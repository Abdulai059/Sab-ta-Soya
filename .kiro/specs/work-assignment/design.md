# Design Document: Work Assignment Feature

## Overview

The work-assignment feature enables administrators to manually assign sanitation reports to sanitation workers through an intuitive interface. The system automatically manages report status transitions, provides workers with a dedicated view of their assignments, and maintains a complete audit trail of all assignment activities.

This feature integrates seamlessly with the existing Next.js application architecture, leveraging Supabase for real-time data synchronization, React Query for state management, and the established RBAC permission system.

## Architecture

### System Components

The work-assignment feature follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ WorkerSelector   │  │ MyAssignments    │  │ Assignment ││
│  │ Component        │  │ Page             │  │ History    ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ useAssignment    │  │ useWorkerList    │  │ useHistory ││
│  │ Hook             │  │ Hook             │  │ Hook       ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Data Access Layer                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Assignment API   │  │ Worker API       │  │ History    ││
│  │ Functions        │  │ Functions        │  │ API        ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ sanitation_      │  │ profiles         │  │ assignment ││
│  │ reports          │  │ table            │  │ _history   ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Assignment Flow:**
1. Admin views report → WorkerSelector component renders
2. Component fetches worker list via useWorkerList hook
3. Admin selects worker → useAssignment hook triggers
4. API function updates report (assigned_to, status) atomically
5. API function creates assignment_history record
6. Supabase real-time pushes update to worker's session
7. MyAssignments page updates automatically

**Worker View Flow:**
1. Worker navigates to /my-assignments
2. Page fetches reports where assigned_to = worker.id
3. Supabase real-time subscription listens for changes
4. New assignments appear automatically within 2 seconds

## Database Schema

### Existing Tables (No Modifications Needed)

Your database already has the necessary tables:

**`sanitation_reports` table:**
- `id` - UUID primary key
- `assigned_to` - UUID foreign key to profiles(id) - stores the assigned worker
- `status` - VARCHAR with CHECK constraint: 'pending', 'assigned', 'in_progress', 'disposed', 'verified', 'cancelled'
- `updated_at` - timestamp with time zone, automatically updated

**`report_assignments` table (already exists):**
- `id` - UUID primary key
- `report_id` - UUID foreign key to sanitation_reports(id)
- `worker_id` - UUID foreign key to profiles(id) - the assigned worker
- `assigned_by` - UUID foreign key to profiles(id) - who made the assignment
- `status` - text with CHECK: 'pending', 'accepted', 'rejected', 'expired', 'completed'
- `assigned_at` - timestamp with time zone
- `accepted_at`, `rejected_at`, `expired_at`, `completed_at` - timestamps
- `notes` - text field

**`report_status_history` table (already exists):**
- `id` - UUID primary key
- `report_id` - UUID foreign key to sanitation_reports(id)
- `old_status` - text
- `new_status` - text
- `changed_by` - UUID foreign key to profiles(id)
- `changed_at` - timestamp with time zone
- `notes` - text field

**`profiles` table:**
- `id` - UUID primary key (references auth.users)
- `full_name` - text
- `role` - text (includes 'sanitation_worker')
- `email`, `phone`, `organization`, `avatar_url` - text fields

### Implementation Strategy

We'll use your existing tables instead of creating new ones:
- Use `report_assignments` for tracking assignment records
- Use `report_status_history` for tracking status changes
- Update `sanitation_reports.assigned_to` for the current assignment
- Create an RPC function to handle atomic updates across these tables

## Component Design

### 1. WorkerSelector Component

**Purpose:** Provides UI for admins to select and assign workers to reports

**Props:**
```javascript
{
  reportId: string,          // UUID of the report
  currentAssignedTo: string, // UUID of currently assigned worker (nullable)
  onAssignSuccess: () => void // Callback after successful assignment
}
```

**State:**
```javascript
{
  isOpen: boolean,           // Modal/dropdown open state
  selectedWorkerId: string,  // Currently selected worker
  isSubmitting: boolean      // Assignment in progress
}
```

**Behavior:**
- Fetches worker list on mount using useWorkerList hook
- Displays workers in searchable dropdown/modal
- Shows current assignment if exists
- Validates permission before rendering
- Handles assignment via useAssignment hook
- Shows success/error toast notifications

**Responsive Design:**
- Desktop (≥768px): Dropdown or modal dialog
- Mobile (<768px): Full-screen modal or bottom sheet
- Touch targets: minimum 44x44px


### 2. MyAssignments Page

**Location:** `/app/my-assignments/page.js`

**Purpose:** Dedicated page showing sanitation workers only their assigned reports

**Data Fetching:**
```javascript
const { data: assignments } = useQuery({
  queryKey: ['my-assignments', workerId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('sanitation_reports')
      .select(`
        id, reference_id, issue_type, severity, status,
        created_at, updated_at,
        location:locations(name, area_name, landmark),
        community:communities(name, district)
      `)
      .eq('assigned_to', workerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
});
```

**Real-time Subscription:**
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('my-assignments')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'sanitation_reports',
      filter: `assigned_to=eq.${workerId}`
    }, (payload) => {
      queryClient.invalidateQueries(['my-assignments', workerId]);
    })
    .subscribe();
  
  return () => subscription.unsubscribe();
}, [workerId]);
```

**UI Elements:**
- Header with assignment count
- Responsive grid/list of report cards
- Each card shows: issue type, location, severity, status, created date
- Empty state when no assignments
- Loading skeleton during fetch
- Connection status indicator for real-time

**Permission Check:**
- Requires `REPORTS.VIEW_ASSIGNED` permission
- Redirects to unauthorized page if missing

### 3. AssignmentHistory Component

**Purpose:** Displays chronological audit trail of assignment activities

**Props:**
```javascript
{
  reportId: string // UUID of the report
}
```

**Data Structure:**
```javascript
{
  id: string,
  report_id: string,
  assigned_by: { id: string, full_name: string },
  assigned_to: { id: string, full_name: string },
  action_type: 'assigned' | 'reassigned' | 'status_changed',
  previous_value: string,
  new_value: string,
  created_at: string
}
```

**Display Format:**
```
John Doe assigned this report to Jane Smith
2 hours ago

Jane Smith changed status from "assigned" to "in_progress"
1 hour ago
```

**Features:**
- Chronological ordering (newest first)
- Relative timestamps ("2 hours ago")
- User full names (not IDs)
- Action type icons
- Responsive layout with horizontal scroll on mobile
- Permission check: requires `REPORTS.VIEW_DETAILS`

## Custom Hooks

### useWorkerList Hook

**Purpose:** Fetches and caches list of all sanitation workers

**Implementation:**
```javascript
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

**Returns:**
```javascript
{
  workers: Array<Worker>,
  isLoading: boolean,
  error: Error | null
}
```

### useAssignment Hook

**Purpose:** Handles report assignment with status update and history tracking

**Implementation:**
```javascript
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
      
      // Get current report state for history
      const { data: currentReport } = await supabase
        .from('sanitation_reports')
        .select('assigned_to, status')
        .eq('id', reportId)
        .single();
      
      // Update report (atomic transaction via RPC)
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

**Database Function (RPC):**
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
  
  -- Create assignment record in report_assignments table
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

### useAssignmentHistory Hook

**Purpose:** Fetches assignment history for a report using existing tables

**Implementation:**
```javascript
export function useAssignmentHistory(reportId) {
  return useQuery({
    queryKey: ['assignment-history', reportId],
    queryFn: async () => {
      // Fetch from report_assignments table
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
      
      // Fetch from report_status_history table
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
      
      // Combine and sort by timestamp
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

## Permission Integration

### Permission Checks

The feature leverages the existing RBAC system defined in `/lib/permissions.js`:

**Assignment Actions:**
- Requires: `REPORTS.ASSIGN` permission
- Roles with access: admin, district_officer, supervisor

**View My Assignments:**
- Requires: `REPORTS.VIEW_ASSIGNED` permission
- Roles with access: sanitation_worker, response_team

**View Assignment History:**
- Requires: `REPORTS.VIEW_DETAILS` permission
- Roles with access: all roles that can view reports

### Server-Side Validation

All API endpoints must validate permissions server-side using Supabase Row Level Security (RLS):

```sql
-- RLS Policy for report_assignments table
CREATE POLICY "Users can view assignments for reports they can access"
ON report_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sanitation_reports
    WHERE sanitation_reports.id = report_assignments.report_id
    AND (
      -- Admin can see all
      auth.jwt() ->> 'role' = 'admin'
      -- Or user is assigned to the report
      OR sanitation_reports.assigned_to = auth.uid()
      -- Or user has VIEW_ALL permission
      OR auth.jwt() ->> 'role' IN ('district_officer', 'supervisor', 'operator')
    )
  )
);

CREATE POLICY "Only authorized users can create assignments"
ON report_assignments FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' IN ('admin', 'district_officer', 'supervisor')
);

-- RLS Policy for report_status_history table
CREATE POLICY "Users can view status history for reports they can access"
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

## Error Handling

### Validation Errors

**Invalid Worker Role:**
```javascript
if (worker.role !== 'sanitation_worker') {
  throw new ValidationError('Selected user must have sanitation_worker role');
}
```

**Non-existent Report:**
```javascript
if (!report) {
  throw new NotFoundError('Report not found');
}
```

**Inactive User:**
```javascript
if (worker.status === 'inactive') {
  throw new ValidationError('Cannot assign to inactive user');
}
```

### Transaction Rollback

All assignment operations use database transactions to ensure atomicity:

```javascript
// If any step fails, entire operation rolls back
BEGIN;
  UPDATE sanitation_reports SET assigned_to = ?, status = ?;
  INSERT INTO assignment_history (...);
COMMIT;
```

### User-Facing Error Messages

```javascript
const ERROR_MESSAGES = {
  INVALID_ROLE: 'Selected user must be a sanitation worker',
  REPORT_NOT_FOUND: 'Report not found',
  PERMISSION_DENIED: 'You do not have permission to assign reports',
  INACTIVE_USER: 'Cannot assign to inactive user account',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};
```

## Real-Time Updates

### Supabase Real-Time Configuration

**Channel Setup:**
```javascript
const channel = supabase.channel('assignments');

// Listen for report updates
channel.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'sanitation_reports',
  filter: `assigned_to=eq.${workerId}`
}, (payload) => {
  // Invalidate queries to refetch data
  queryClient.invalidateQueries(['my-assignments', workerId]);
});

// Listen for new assignments
channel.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'report_assignments',
  filter: `worker_id=eq.${workerId}`
}, (payload) => {
  queryClient.invalidateQueries(['my-assignments', workerId]);
});

channel.subscribe();
```

### Connection Status Handling

```javascript
const [connectionStatus, setConnectionStatus] = useState('connected');

channel.on('system', { event: 'error' }, () => {
  setConnectionStatus('error');
});

channel.on('system', { event: 'close' }, () => {
  setConnectionStatus('disconnected');
  // Attempt reconnection
  setTimeout(() => channel.subscribe(), 5000);
});

channel.on('system', { event: 'open' }, () => {
  setConnectionStatus('connected');
  // Refresh data on reconnection
  queryClient.invalidateQueries(['my-assignments']);
});
```

**UI Indicator:**
```javascript
{connectionStatus !== 'connected' && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
    <p className="text-sm text-yellow-700">
      {connectionStatus === 'disconnected' 
        ? 'Connection lost. Attempting to reconnect...'
        : 'Connection error. Updates may be delayed.'}
    </p>
  </div>
)}
```


## UI/UX Design

### WorkerSelector Component UI

**Desktop View (≥768px):**
```javascript
<div className="relative">
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
  >
    <UserIcon className="w-4 h-4" />
    <span>{currentWorker?.full_name || 'Assign Worker'}</span>
    <ChevronDownIcon className="w-4 h-4" />
  </button>
  
  {isOpen && (
    <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
      <input
        type="text"
        placeholder="Search workers..."
        className="w-full px-3 py-2 border-b border-gray-200"
      />
      <div className="max-h-64 overflow-y-auto">
        {workers.map(worker => (
          <button
            key={worker.id}
            onClick={() => handleAssign(worker.id)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50"
          >
            <div className="font-medium">{worker.full_name}</div>
            <div className="text-sm text-gray-500">{worker.email}</div>
          </button>
        ))}
      </div>
    </div>
  )}
</div>
```

**Mobile View (<768px):**
```javascript
<>
  <button
    onClick={() => setIsOpen(true)}
    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg"
  >
    <span>{currentWorker?.full_name || 'Assign Worker'}</span>
    <ChevronRightIcon className="w-5 h-5" />
  </button>
  
  {isOpen && (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Select Worker</h2>
        <button onClick={() => setIsOpen(false)}>
          <XIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="p-4">
        <input
          type="text"
          placeholder="Search workers..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>
      
      <div className="overflow-y-auto">
        {workers.map(worker => (
          <button
            key={worker.id}
            onClick={() => handleAssign(worker.id)}
            className="w-full px-4 py-4 border-b border-gray-100 text-left"
            style={{ minHeight: '44px' }}
          >
            <div className="font-medium">{worker.full_name}</div>
            <div className="text-sm text-gray-500">{worker.email}</div>
          </button>
        ))}
      </div>
    </div>
  )}
</>
```

### MyAssignments Page UI

```javascript
<div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto py-6 space-y-6">
    
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Reports assigned to you
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
        <p className="text-xs text-gray-500">Total Assignments</p>
        <p className="text-2xl font-semibold text-gray-900">{assignments.length}</p>
      </div>
    </div>
    
    {/* Connection Status */}
    {connectionStatus !== 'connected' && (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm text-yellow-700">
          Connection lost. Attempting to reconnect...
        </p>
      </div>
    )}
    
    {/* Assignments Grid */}
    {assignments.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map(report => (
          <Link
            key={report.id}
            href={`/reports/${report.id}`}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">
                {report.reference_id}
              </span>
              <StatusBadge status={report.status} />
            </div>
            
            <h3 className="font-medium text-gray-900 mb-2">
              {report.issue_type}
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{report.location?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4" />
                <SeverityBadge severity={report.severity} />
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>{formatTimeAgo(report.created_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No assignments yet
        </h3>
        <p className="text-sm text-gray-500">
          You'll see reports here when they're assigned to you
        </p>
      </div>
    )}
  </div>
</div>
```

### AssignmentHistory Component UI

```javascript
<div className="bg-white border border-gray-200 rounded-lg p-4">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Assignment History
  </h3>
  
  {history.length > 0 ? (
    <div className="space-y-4">
      {history.map(record => (
        <div key={record.id} className="flex gap-3">
          <div className="flex-shrink-0">
            {record.action_type === 'assigned' && (
              <UserPlusIcon className="w-5 h-5 text-blue-500" />
            )}
            {record.action_type === 'reassigned' && (
              <RefreshIcon className="w-5 h-5 text-orange-500" />
            )}
            {record.action_type === 'status_changed' && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              {formatHistoryMessage(record)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTimeAgo(record.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500 text-center py-4">
      No history available
    </p>
  )}
</div>
```

## Utility Functions

### formatHistoryMessage

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
```

### formatTimeAgo

```javascript
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

## Testing Strategy

The work-assignment feature will be tested using a dual approach:

1. **Property-Based Tests**: Verify universal properties across all inputs using a PBT library (fast-check for JavaScript)
2. **Example-Based Unit Tests**: Verify specific scenarios, edge cases, and UI behaviors
3. **Integration Tests**: Verify database transactions, real-time subscriptions, and external service behavior

### Property-Based Testing Configuration

- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `Feature: work-assignment, Property {number}: {property_text}`

### Unit Testing Focus

- Specific examples demonstrating correct behavior
- UI component rendering and interaction
- Error handling scenarios
- Permission checks
- Responsive layout behavior

### Integration Testing Focus

- Database atomicity and rollback
- Supabase real-time subscriptions
- Foreign key constraints
- Row-level security policies


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. During reflection, I consolidated redundant properties:

- **Consolidated 5.2 and 5.3**: Both test UI visibility based on REPORTS.ASSIGN permission - combined into Property 13
- **Removed redundancy in assignment validation**: Properties 18-20 all test validation, but each validates different aspects (role, existence, status) so all are kept
- **Consolidated history display properties**: Properties 15-17 all relate to history display but test different aspects (ordering, names, timestamps) so all are kept

The following properties provide comprehensive coverage of the work-assignment feature's correctness requirements:

### Property 1: Worker List Completeness

*For any* worker in the Worker_List, the worker SHALL have both a full_name field and a role field populated.

**Validates: Requirements 1.3**

### Property 2: Assignment Updates assigned_to Field

*For any* report and any sanitation worker, when an assignment is performed, the report's assigned_to field SHALL be updated to the worker's user ID.

**Validates: Requirements 1.4**

### Property 3: Assignment Failure Preserves State

*For any* report with an initial assignment state, if the assignment operation fails, the report's assigned_to field SHALL remain unchanged from its initial value.

**Validates: Requirements 1.6**

### Property 4: Pending to Assigned Status Transition

*For any* report with status "pending", when assigned to a sanitation worker, the report's status SHALL change to "assigned".

**Validates: Requirements 2.1**

### Property 5: Reassignment Preserves Assigned Status

*For any* report with status "assigned", when reassigned from one sanitation worker to another, the report's status SHALL remain "assigned".

**Validates: Requirements 2.2**

### Property 6: Status Change Updates Timestamp

*For any* report, when the status field changes, the updated_at timestamp SHALL be modified to a value greater than the previous timestamp.

**Validates: Requirements 2.3**

### Property 7: Assignment Filtering by Worker

*For any* sanitation worker, the My_Assignments_Page SHALL display only reports where the assigned_to field equals the worker's user ID.

**Validates: Requirements 3.1**

### Property 8: Assignment Display Includes Required Fields

*For any* report displayed on the My_Assignments_Page, the rendered output SHALL include issue_type, location, severity, status, and created_at fields.

**Validates: Requirements 3.2**

### Property 9: Assignment Ordering by Creation Time

*For any* list of reports on the My_Assignments_Page, the reports SHALL be ordered by created_at timestamp in descending order (newest first).

**Validates: Requirements 3.3**

### Property 10: My Assignments Permission Check

*For any* user without the REPORTS.VIEW_ASSIGNED permission, access to the My_Assignments_Page SHALL be denied.

**Validates: Requirements 3.6**

### Property 11: Assignment Creates History Record

*For any* assignment of a report to a sanitation worker, an assignment_history record SHALL be created with report_id, assigned_by, assigned_to, and created_at fields populated.

**Validates: Requirements 4.1**

### Property 12: Reassignment Creates New History Record

*For any* reassignment of a report from one sanitation worker to another, a new assignment_history record SHALL be created with action_type "reassigned".

**Validates: Requirements 4.2**

### Property 13: Status Change Creates History Record

*For any* report status change, an assignment_history record SHALL be created with action_type "status_changed", previous_value, and new_value fields populated.

**Validates: Requirements 4.3**

### Property 14: History Record Structure

*For any* assignment_history record, the record SHALL include the fields: report_id, assigned_by, assigned_to, action_type, previous_value, new_value, and created_at.

**Validates: Requirements 4.4**

### Property 15: History Chronological Ordering

*For any* report's assignment history, the history records SHALL be ordered by created_at timestamp in descending order (newest first).

**Validates: Requirements 4.5**

### Property 16: History Displays User Names

*For any* assignment_history record displayed to a user, the rendered output SHALL include the full_name of both the assigner (assigned_by) and assignee (assigned_to).

**Validates: Requirements 4.6**

### Property 17: History Timestamps Use Relative Format

*For any* assignment_history record displayed to a user, the created_at timestamp SHALL be formatted as relative time (e.g., "2 hours ago", "3 days ago").

**Validates: Requirements 4.7**

### Property 18: Assignment Permission Check

*For any* user without the REPORTS.ASSIGN permission, assignment actions SHALL be denied and return an error.

**Validates: Requirements 5.1, 5.6**

### Property 19: Worker Selection UI Permission Check

*For any* user, the worker selection interface SHALL be displayed if and only if the user has the REPORTS.ASSIGN permission.

**Validates: Requirements 5.2, 5.3**

### Property 20: History View Permission Check

*For any* user without the REPORTS.VIEW_DETAILS permission, the assignment history SHALL not be displayed.

**Validates: Requirements 5.4**

### Property 21: Server-Side Permission Validation

*For any* assignment or status change operation, the server SHALL validate the user's permissions before executing the operation.

**Validates: Requirements 5.5**

### Property 22: Worker Role Validation

*For any* assignment attempt, if the selected user does not have the sanitation_worker role, the assignment SHALL be rejected with an error message.

**Validates: Requirements 6.1, 6.2**

### Property 23: Report Existence Validation

*For any* assignment_history record creation, the system SHALL verify that the report_id references an existing report in the sanitation_reports table.

**Validates: Requirements 6.3**

### Property 24: User Existence Validation

*For any* assignment attempt, the system SHALL verify that the assigned_to user ID references an existing user in the profiles table.

**Validates: Requirements 6.4**

### Property 25: Active User Validation

*For any* assignment attempt, if the selected user has an inactive or deleted account status, the assignment SHALL be rejected with an error message.

**Validates: Requirements 6.6**

### Property 26: Validation Failure Rollback

*For any* assignment operation where validation fails, all database changes SHALL be rolled back and the system SHALL return to its previous state.

**Validates: Requirements 6.7**

## Code Examples

### Example: useAssignment Hook Usage

```javascript
import { useAssignment } from '@/hooks/useAssignment';
import { useAuth } from '@/context/AuthContext';

function WorkerSelector({ reportId, currentAssignedTo }) {
  const { profile } = useAuth();
  const { mutate: assignReport, isLoading } = useAssignment();
  
  const handleAssign = (workerId) => {
    assignReport({
      reportId,
      workerId,
      assignedBy: profile.id
    });
  };
  
  return (
    <div>
      {/* Worker selection UI */}
      <button
        onClick={() => handleAssign(selectedWorkerId)}
        disabled={isLoading}
      >
        {isLoading ? 'Assigning...' : 'Assign Worker'}
      </button>
    </div>
  );
}
```

### Example: MyAssignments Page with Real-Time

```javascript
'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useHasPermission } from '@/hooks/usePermissions';
import { REPORTS } from '@/lib/permissions';

export default function MyAssignmentsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const canViewAssigned = useHasPermission(REPORTS.VIEW_ASSIGNED);
  
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['my-assignments', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sanitation_reports')
        .select(`
          id, reference_id, issue_type, severity, status,
          created_at, updated_at,
          location:locations(name, area_name),
          community:communities(name, district)
        `)
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: canViewAssigned && !!profile?.id
  });
  
  // Real-time subscription
  useEffect(() => {
    if (!profile?.id) return;
    
    const channel = supabase
      .channel('my-assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sanitation_reports',
        filter: `assigned_to=eq.${profile.id}`
      }, () => {
        queryClient.invalidateQueries(['my-assignments', profile.id]);
      })
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [profile?.id, queryClient]);
  
  if (!canViewAssigned) {
    return <div>You do not have permission to view this page.</div>;
  }
  
  if (isLoading) {
    return <div>Loading assignments...</div>;
  }
  
  return (
    <div>
      <h1>My Assignments ({assignments.length})</h1>
      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <EmptyState message="No assignments yet" />
      )}
    </div>
  );
}
```

### Example: AssignmentHistory Component

```javascript
import { useAssignmentHistory } from '@/hooks/useAssignmentHistory';
import { useHasPermission } from '@/hooks/usePermissions';
import { REPORTS } from '@/lib/permissions';
import { formatTimeAgo, formatHistoryMessage } from '@/utils/formatters';

export function AssignmentHistory({ reportId }) {
  const canViewDetails = useHasPermission(REPORTS.VIEW_DETAILS);
  const { data: history = [], isLoading } = useAssignmentHistory(reportId);
  
  if (!canViewDetails) {
    return null;
  }
  
  if (isLoading) {
    return <div>Loading history...</div>;
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Assignment History</h3>
      
      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map(record => (
            <div key={record.id} className="flex gap-3">
              <ActionIcon type={record.action_type} />
              <div>
                <p className="text-sm text-gray-900">
                  {formatHistoryMessage(record)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(record.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No history available
        </p>
      )}
    </div>
  );
}
```

## Implementation Notes

### Database Migration Order

1. Create `assignment_history` table
2. Create indexes on `assignment_history`
3. Create `assign_report` RPC function
4. Add RLS policies for `assignment_history`
5. Test atomicity of assignment operations

### Component Implementation Order

1. `useWorkerList` hook (data fetching)
2. `useAssignment` hook (assignment logic)
3. `WorkerSelector` component (UI)
4. `MyAssignments` page (worker view)
5. `useAssignmentHistory` hook (history fetching)
6. `AssignmentHistory` component (history display)
7. Real-time subscriptions (last, after core functionality works)

### Testing Implementation Order

1. Unit tests for utility functions (formatTimeAgo, formatHistoryMessage)
2. Property-based tests for core logic (assignment, filtering, validation)
3. Component tests for UI (WorkerSelector, AssignmentHistory)
4. Integration tests for database operations (atomicity, RLS)
5. End-to-end tests for complete workflows

### Performance Considerations

**Query Optimization:**
- Index on `sanitation_reports.assigned_to` for fast filtering
- Index on `assignment_history.report_id` for fast history lookup
- Index on `assignment_history.created_at` for fast ordering

**Caching Strategy:**
- Worker list cached for 5 minutes (rarely changes)
- Assignments refetched on real-time updates
- History fetched on-demand when viewing report details

**Real-Time Optimization:**
- Use filtered subscriptions to reduce unnecessary updates
- Debounce rapid updates to prevent excessive re-renders
- Unsubscribe when component unmounts to prevent memory leaks

## Security Considerations

### Input Validation

All user inputs must be validated:
- `reportId`: Must be valid UUID format
- `workerId`: Must be valid UUID format and reference existing user
- `assignedBy`: Must match authenticated user's ID

### SQL Injection Prevention

Use parameterized queries for all database operations:
```javascript
// Good: Parameterized query
supabase.from('sanitation_reports').select('*').eq('id', reportId);

// Bad: String concatenation (vulnerable to SQL injection)
// NEVER DO THIS
```

### Authorization Checks

Always validate permissions on both client and server:
```javascript
// Client-side (UX)
if (!canAssign) return null;

// Server-side (security)
if (!hasPermission(user, 'REPORTS.ASSIGN')) {
  throw new ForbiddenError();
}
```

### Rate Limiting

Implement rate limiting for assignment operations to prevent abuse:
- Maximum 10 assignments per minute per user
- Maximum 100 assignments per hour per user

## Accessibility

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must be logical
- Enter/Space keys must trigger actions

### Screen Reader Support

- Use semantic HTML elements
- Provide ARIA labels for icon-only buttons
- Announce dynamic updates (new assignments)

### Color Contrast

- All text must meet WCAG AA standards (4.5:1 contrast ratio)
- Status badges must not rely solely on color
- Use icons in addition to color for status indication

### Touch Targets

- Minimum 44x44px touch targets on mobile
- Adequate spacing between interactive elements
- Large enough tap areas for dropdowns and buttons

