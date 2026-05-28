-- Migration: Create assign_report RPC function
-- This function handles atomic assignment operations using existing tables

CREATE OR REPLACE FUNCTION assign_report(
  p_report_id UUID,
  p_worker_id UUID,
  p_assigned_by UUID,
  p_previous_assigned_to UUID,
  p_previous_status VARCHAR
)
RETURNS VOID AS $$
BEGIN
  -- Update report with assigned_to but keep status unchanged
  -- Status will only change when worker accepts the assignment
  UPDATE sanitation_reports
  SET 
    assigned_to = p_worker_id,
    updated_at = NOW()
  WHERE id = p_report_id;
  
  -- Create assignment record in report_assignments table with 'pending' status
  INSERT INTO report_assignments (
    report_id,
    worker_id,
    assigned_by,
    status,
    assigned_at
  ) VALUES (
    p_report_id,
    p_worker_id,
    p_assigned_by,
    'pending',
    NOW()
  );
  
  -- Create history record for assignment action (not status change)
  INSERT INTO report_status_history (
    report_id,
    old_status,
    new_status,
    changed_by,
    changed_at,
    notes
  ) VALUES (
    p_report_id,
    p_previous_status,
    p_previous_status,
    p_assigned_by,
    NOW(),
    'Report assigned to worker (pending acceptance)'
  );
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for report_assignments
CREATE POLICY IF NOT EXISTS "Users can view assignments for accessible reports"
ON report_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sanitation_reports
    WHERE sanitation_reports.id = report_assignments.report_id
    AND (
      -- Admin can see all
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      -- Or user is assigned to the report
      OR sanitation_reports.assigned_to = auth.uid()
      -- Or user has VIEW_ALL permission
      OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('district_officer', 'supervisor', 'operator')
    )
  )
);

CREATE POLICY IF NOT EXISTS "Authorized users can create assignments"
ON report_assignments FOR INSERT
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'district_officer', 'supervisor')
);

-- Allow workers to update their own assignments (accept/decline)
CREATE POLICY IF NOT EXISTS "Workers can update their own assignments"
ON report_assignments FOR UPDATE
USING (worker_id = auth.uid())
WITH CHECK (worker_id = auth.uid());

-- Add RLS policies for report_status_history
CREATE POLICY IF NOT EXISTS "Users can view status history for accessible reports"
ON report_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sanitation_reports
    WHERE sanitation_reports.id = report_status_history.report_id
    AND (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      OR sanitation_reports.assigned_to = auth.uid()
      OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('district_officer', 'supervisor', 'operator')
    )
  )
);

-- Allow workers to insert status history when accepting/declining
CREATE POLICY IF NOT EXISTS "Workers can create status history for their assignments"
ON report_status_history FOR INSERT
WITH CHECK (
  changed_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM sanitation_reports
    WHERE sanitation_reports.id = report_status_history.report_id
    AND sanitation_reports.assigned_to = auth.uid()
  )
);


-- Allow workers to update reports they are assigned to (for accept/decline workflow)
CREATE POLICY IF NOT EXISTS "Workers can update their assigned reports"
ON sanitation_reports FOR UPDATE
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());
