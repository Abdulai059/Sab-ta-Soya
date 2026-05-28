# Accept/Decline Assignment Workflow

## Overview
This document describes the accept/decline workflow implementation for work assignments. Workers can now accept or decline assignments before starting work on them.

## Workflow

### 1. Admin Assigns Work
- Admin selects a sanitation worker and assigns a report
- `assign_report` RPC function is called
- Report's `assigned_to` field is set to the worker
- Report's `status` remains unchanged (typically "pending")
- Assignment record created in `report_assignments` with status "pending"
- History record created noting the assignment

### 2. Worker Views Assignment
- Worker navigates to "My Assignments" page
- Sees two sections:
  - **Pending Assignments**: Require accept/decline action
  - **Accepted Assignments**: Already accepted, ready to work on

### 3. Worker Accepts Assignment
- Worker clicks "Accept" button
- `useAcceptAssignment` hook is called
- Updates `report_assignments.status` to "accepted"
- Sets `accepted_at` timestamp
- Updates `sanitation_reports.status` to "assigned" (if it was "pending")
- Creates history record noting acceptance
- Assignment moves to "Accepted Assignments" section

### 4. Worker Declines Assignment
- Worker clicks "Decline" button
- Optional: Worker provides reason for declining
- `useDeclineAssignment` hook is called
- Updates `report_assignments.status` to "rejected"
- Sets `rejected_at` timestamp
- Reverts `sanitation_reports.status` back to "pending"
- Clears `assigned_to` field (report becomes unassigned)
- Creates history record noting decline with reason
- Assignment disappears from worker's list
- Admin can reassign to another worker

## Database Schema

### report_assignments table
```sql
- status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed'
- assigned_at: timestamp (when admin assigned)
- accepted_at: timestamp (when worker accepted)
- rejected_at: timestamp (when worker declined)
- notes: text (reason for declining, etc.)
```

### sanitation_reports table
```sql
- assigned_to: uuid (worker id, set when assigned, cleared when declined)
- status: 'pending' | 'assigned' | 'in_progress' | 'disposed' | 'verified' | 'cancelled'
```

### report_status_history table
```sql
- Tracks all status changes and assignment actions
- Includes notes field for additional context
```

## Files Modified

### New Hooks
1. **`hooks/useAcceptAssignment.js`**
   - Handles accepting an assignment
   - Updates assignment status to "accepted"
   - Updates report status to "assigned"
   - Creates history record

2. **`hooks/useDeclineAssignment.js`**
   - Handles declining an assignment
   - Updates assignment status to "rejected"
   - Reverts report status to "pending"
   - Clears assigned_to field
   - Creates history record with reason

### Updated Pages
1. **`app/my-assignments/page.js`**
   - Fetches assignments with assignment status
   - Separates pending and accepted assignments
   - Shows accept/decline buttons for pending assignments
   - Shows "View Details" button for accepted assignments
   - Displays separate counts for pending and accepted
   - Includes decline reason textarea

### Updated Database Functions
1. **`supabase/migrations/assign_report_function.sql`**
   - Modified to NOT change report status when assigning
   - Report status only changes when worker accepts
   - Creates history record noting assignment action
   - Added RLS policies for workers to update their assignments
   - Added RLS policies for workers to update their assigned reports
   - Added RLS policies for workers to create status history

## User Experience

### For Workers
1. Receive notification of new assignment (via real-time subscription)
2. Navigate to "My Assignments" page
3. See pending assignments with orange "Action Required" badge
4. Review assignment details (location, severity, issue type)
5. Choose to:
   - **Accept**: Assignment moves to "Accepted" section, can start work
   - **Decline**: Optionally provide reason, assignment removed from list

### For Admins
1. Assign work to a worker
2. Assignment appears in worker's pending list
3. If worker declines:
   - Report becomes unassigned
   - Admin can reassign to another worker
   - History shows decline reason
4. If worker accepts:
   - Report status changes to "assigned"
   - Worker can begin work

## Benefits

1. **Worker Autonomy**: Workers can decline assignments they cannot handle
2. **Better Planning**: Admins know which assignments are confirmed
3. **Audit Trail**: Complete history of assignments, acceptances, and declines
4. **Flexibility**: Workers can provide reasons for declining
5. **Real-time Updates**: Workers see new assignments immediately
6. **Clear Status**: Separate pending and accepted sections

## Future Enhancements

1. **Auto-expiration**: Automatically expire assignments not accepted within X hours
2. **Notifications**: Push notifications for new assignments
3. **Reassignment**: Quick reassignment when worker declines
4. **Workload Balancing**: Suggest workers based on current workload
5. **Decline Analytics**: Track decline reasons to improve assignment process
