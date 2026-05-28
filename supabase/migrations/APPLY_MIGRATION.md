# How to Apply the Accept/Decline Workflow Migration

## Overview
This migration updates the `assign_report` function and adds necessary RLS policies to support the accept/decline workflow for work assignments.

## What Changed
1. **assign_report function**: No longer automatically changes report status to "assigned"
2. **New RLS policies**: Allow workers to update their assignments and reports
3. **Status workflow**: Report status only changes when worker accepts

## Apply Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
# Navigate to project root
cd /home/zesung/Desktop/projects/Santrack-fontend

# Apply the migration
supabase db push
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `assign_report_function.sql`
4. Paste and run the SQL

### Option 3: Manual SQL Execution
```bash
# Connect to your database
psql -h <your-db-host> -U postgres -d postgres

# Run the migration file
\i supabase/migrations/assign_report_function.sql
```

## Verify Migration

After applying the migration, verify it worked:

```sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'assign_report';

-- Check if policies exist
SELECT policyname 
FROM pg_policies 
WHERE tablename IN ('report_assignments', 'report_status_history', 'sanitation_reports')
AND policyname LIKE '%Workers%';
```

Expected policies:
- `Workers can update their own assignments` (on report_assignments)
- `Workers can create status history for their assignments` (on report_status_history)
- `Workers can update their assigned reports` (on sanitation_reports)

## Testing the Workflow

### Test 1: Admin Assigns Work
```javascript
// As admin, assign a report
const { error } = await supabase.rpc('assign_report', {
  p_report_id: '<report-id>',
  p_worker_id: '<worker-id>',
  p_assigned_by: '<admin-id>',
  p_previous_assigned_to: null,
  p_previous_status: 'pending'
});

// Verify: report.assigned_to is set, but status is still 'pending'
// Verify: report_assignments record created with status 'pending'
```

### Test 2: Worker Accepts Assignment
```javascript
// As worker, accept the assignment
const { error } = await supabase
  .from('report_assignments')
  .update({
    status: 'accepted',
    accepted_at: new Date().toISOString()
  })
  .eq('report_id', '<report-id>')
  .eq('worker_id', '<worker-id>')
  .eq('status', 'pending');

// Verify: assignment status is 'accepted'
// Verify: report status changed to 'assigned'
```

### Test 3: Worker Declines Assignment
```javascript
// As worker, decline the assignment
const { error } = await supabase
  .from('report_assignments')
  .update({
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    notes: 'Cannot complete this task'
  })
  .eq('report_id', '<report-id>')
  .eq('worker_id', '<worker-id>')
  .eq('status', 'pending');

// Verify: assignment status is 'rejected'
// Verify: report status reverted to 'pending'
// Verify: report.assigned_to is null
```

## Rollback (If Needed)

If you need to rollback to the previous behavior:

```sql
-- Restore old assign_report function
CREATE OR REPLACE FUNCTION assign_report(
  p_report_id UUID,
  p_worker_id UUID,
  p_assigned_by UUID,
  p_previous_assigned_to UUID,
  p_previous_status VARCHAR
)
RETURNS VOID AS $$
DECLARE
  v_new_status VARCHAR;
BEGIN
  IF p_previous_status = 'pending' THEN
    v_new_status := 'assigned';
  ELSE
    v_new_status := p_previous_status;
  END IF;
  
  UPDATE sanitation_reports
  SET 
    assigned_to = p_worker_id,
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_report_id;
  
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
  
  IF v_new_status != p_previous_status THEN
    INSERT INTO report_status_history (
      report_id,
      old_status,
      new_status,
      changed_by,
      changed_at
    ) VALUES (
      p_report_id,
      p_previous_status,
      v_new_status,
      p_assigned_by,
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Remove new policies
DROP POLICY IF EXISTS "Workers can update their own assignments" ON report_assignments;
DROP POLICY IF EXISTS "Workers can create status history for their assignments" ON report_status_history;
DROP POLICY IF EXISTS "Workers can update their assigned reports" ON sanitation_reports;
```

## Support

If you encounter any issues:
1. Check Supabase logs for RLS policy violations
2. Verify user roles are set correctly
3. Ensure auth.uid() returns the correct user ID
4. Check that report_assignments records exist before accept/decline
