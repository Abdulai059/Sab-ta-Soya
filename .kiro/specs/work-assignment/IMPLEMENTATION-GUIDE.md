# Work Assignment Feature - Implementation Guide

## ✅ Spec Updated for Your Schema

The spec has been updated to work with your **existing database tables**:
- `report_assignments` - for tracking assignments
- `report_status_history` - for tracking status changes  
- `sanitation_reports` - already has `assigned_to` field
- `profiles` - already has user information

**No new tables needed!** We'll use what you already have.

## 📁 What's Been Created

Your spec is located in `.kiro/specs/work-assignment/`:

1. **requirements.md** - 8 detailed requirements
2. **design.md** - Complete technical design (updated for your schema)
3. **tasks.md** - 33 implementation tasks (updated for your schema)
4. **.config.kiro** - Workflow configuration

## 🚀 How to Start Implementing

### Option 1: Use Kiro's Task System (Recommended)

1. **Open the tasks file**:
   ```
   .kiro/specs/work-assignment/tasks.md
   ```

2. **Click "Start task"** next to Task 1.1 in your editor

3. **Kiro will guide you** through each task step-by-step

### Option 2: Manual Implementation

Follow the tasks in order:

#### Phase 1: Database Setup (Tasks 1.1-1.2)

**Task 1.1: Create RPC Function**

Create this SQL function in your Supabase SQL Editor:

```sql
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
  -- Determine new status
  IF p_previous_status = 'pending' THEN
    v_new_status := 'assigned';
  ELSE
    v_new_status := p_previous_status;
  END IF;
  
  -- Update report atomically
  UPDATE sanitation_reports
  SET 
    assigned_to = p_worker_id,
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_report_id;
  
  -- Create assignment record
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
  
  -- Create status change history if status changed
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
```

**Task 1.2: Add RLS Policies**

```sql
-- Policy for report_assignments
CREATE POLICY "Users can view assignments for accessible reports"
ON report_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sanitation_reports
    WHERE sanitation_reports.id = report_assignments.report_id
    AND (
      auth.jwt() ->> 'role' = 'admin'
      OR sanitation_reports.assigned_to = auth.uid()
      OR auth.jwt() ->> 'role' IN ('district_officer', 'supervisor', 'operator')
    )
  )
);

CREATE POLICY "Authorized users can create assignments"
ON report_assignments FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' IN ('admin', 'district_officer', 'supervisor')
);

-- Policy for report_status_history
CREATE POLICY "Users can view status history for accessible reports"
ON report_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sanitation_reports
    WHERE sanitation_reports.id = report_status_history.report_id
    AND (
      auth.jwt() ->> 'role' = 'admin'
      OR sanitation_reports.assigned_to = auth.uid()
      OR auth.jwt() ->> 'role' IN ('district_officer', 'supervisor', 'operator')
    )
  )
);
```

#### Phase 2: Create Hooks (Tasks 2.1-2.5)

**Task 2.1: useWorkerList Hook**

Create `/hooks/useWorkerList.js`:

```javascript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useWorkerList() {
  return useQuery({
    queryKey: ['workers', 'sanitation_worker'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, email')
        .eq('role', 'sanitation_worker')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Task 2.3: useAssignment Hook**

Create `/hooks/useAssignment.js`:

```javascript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, workerId, assignedBy }) => {
      // Validate worker role
      const { data: worker, error: workerError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', workerId)
        .single();
      
      if (workerError || worker.role !== 'sanitation_worker') {
        throw new Error('Invalid worker: must have sanitation_worker role');
      }
      
      // Get current report state
      const { data: currentReport } = await supabase
        .from('sanitation_reports')
        .select('assigned_to, status')
        .eq('id', reportId)
        .single();
      
      // Call RPC function
      const { error: updateError } = await supabase.rpc('assign_report', {
        p_report_id: reportId,
        p_worker_id: workerId,
        p_assigned_by: assignedBy,
        p_previous_assigned_to: currentReport?.assigned_to,
        p_previous_status: currentReport?.status
      });
      
      if (updateError) throw updateError;
      
      return { reportId, workerId };
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['my-assignments']);
      toast.success('Report assigned successfully');
    },
    
    onError: (error) => {
      toast.error(error.message || 'Assignment failed');
    }
  });
}
```

**Task 2.5: useAssignmentHistory Hook**

Create `/hooks/useAssignmentHistory.js`:

```javascript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAssignmentHistory(reportId) {
  return useQuery({
    queryKey: ['assignment-history', reportId],
    queryFn: async () => {
      // Fetch assignments
      const { data: assignments, error: assignError } = await supabase
        .from('report_assignments')
        .select(`
          id,
          assigned_at,
          status,
          notes,
          worker:profiles!worker_id(id, full_name),
          assigner:profiles!assigned_by(id, full_name)
        `)
        .eq('report_id', reportId)
        .order('assigned_at', { ascending: false });
      
      // Fetch status history
      const { data: statusHistory, error: statusError } = await supabase
        .from('report_status_history')
        .select(`
          id,
          old_status,
          new_status,
          changed_at,
          notes,
          changer:profiles!changed_by(id, full_name)
        `)
        .eq('report_id', reportId)
        .order('changed_at', { ascending: false });
      
      if (assignError) throw assignError;
      if (statusError) throw statusError;
      
      // Combine and sort
      const combined = [
        ...(assignments || []).map(a => ({
          id: a.id,
          type: 'assignment',
          timestamp: a.assigned_at,
          worker: a.worker,
          assigner: a.assigner,
          status: a.status,
          notes: a.notes
        })),
        ...(statusHistory || []).map(s => ({
          id: s.id,
          type: 'status_change',
          timestamp: s.changed_at,
          old_status: s.old_status,
          new_status: s.new_status,
          changer: s.changer,
          notes: s.notes
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return combined;
    },
    enabled: !!reportId
  });
}
```

#### Phase 3: Create Components (Tasks 4-6)

Follow the design document for:
- **WorkerSelector** component (Task 4)
- **MyAssignments** page (Task 5)
- **AssignmentHistory** component (Task 6)

#### Phase 4: Utility Functions (Task 7)

Create `/utils/assignmentFormatters.js`:

```javascript
export function formatHistoryMessage(record) {
  if (record.type === 'assignment') {
    return `${record.assigner.full_name} assigned this report to ${record.worker.full_name}`;
  }
  
  if (record.type === 'status_change') {
    return `${record.changer.full_name} changed status from "${record.old_status}" to "${record.new_status}"`;
  }
  
  return 'Unknown action';
}

export function formatTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return past.toLocaleDateString();
}
```

## 📚 Key Files to Reference

- **Design Document**: `.kiro/specs/work-assignment/design.md` - Complete technical design
- **Requirements**: `.kiro/specs/work-assignment/requirements.md` - What needs to be built
- **Tasks**: `.kiro/specs/work-assignment/tasks.md` - Step-by-step implementation plan

## 🎯 Implementation Order

1. ✅ Database (RPC function + RLS policies)
2. ✅ Hooks (useWorkerList, useAssignment, useAssignmentHistory)
3. ✅ Utility functions (formatters)
4. ✅ WorkerSelector component
5. ✅ MyAssignments page
6. ✅ AssignmentHistory component
7. ✅ Integration (add to report detail pages, navigation)

## 💡 Tips

- **Start with Task 1.1** - The RPC function is the foundation
- **Test each phase** - Use the checkpoints (Tasks 3, 9, 11)
- **Skip optional tasks** - Tasks marked with `*` are property-based tests (optional for MVP)
- **Follow the design** - The design document has complete code examples

## 🆘 Need Help?

- Check the **design.md** for detailed code examples
- Each task references specific requirements for context
- The spec uses your existing schema - no new tables needed!

---

**Ready to start?** Open `.kiro/specs/work-assignment/tasks.md` and click "Start task" on Task 1.1! 🚀
