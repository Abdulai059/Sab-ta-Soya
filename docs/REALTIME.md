# Real-time Updates System

This document explains how the real-time updates system works in the Santrack application.

## Overview

The application uses **Supabase Real-time** to automatically update the UI whenever database changes occur. This eliminates the need for manual page refreshes and provides instant feedback across all users.

## How It Works

### 1. Supabase Real-time Subscriptions

Supabase provides real-time functionality through PostgreSQL's replication features. When any row in a subscribed table changes (INSERT, UPDATE, DELETE), Supabase sends a notification to all connected clients.

### 2. Channel-based Architecture

Each subscription creates a unique "channel" that listens for specific database events:

```javascript
const channel = supabase
  .channel("unique_channel_name")
  .on("postgres_changes", {
    event: "*",        // Listen to all events (INSERT, UPDATE, DELETE)
    schema: "public",  // Database schema
    table: "sanitation_reports",  // Table to watch
  }, (payload) => {
    // Handle the change
    console.log("Change detected:", payload);
    refetchData();
  })
  .subscribe();
```

### 3. Automatic Cleanup

All subscriptions are cleaned up when components unmount to prevent memory leaks:

```javascript
useEffect(() => {
  // Setup subscription
  const channel = supabase.channel(...).subscribe();
  
  // Cleanup on unmount
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Implemented Real-time Features

### ✅ Admin: Assign Workers Page

**File**: `hooks/useAssignWorker.js`

**Subscriptions**:
- `sanitation_reports` - Report status changes
- `report_assignments` - Worker assignments
- `service_tasks` - Task status (pending → accepted → completed)
- `profiles` - Worker profile updates

**Triggers**:
- When a worker accepts an offer → Admin sees "Accepted · In progress" instantly
- When a worker completes a task → Admin sees "Completed" badge instantly
- When an offer expires → Card updates automatically
- When a new report is created → Appears in the list instantly

### ✅ Worker: My Offers Page

**File**: `hooks/useMyOffers.js`

**Subscriptions**:
- `service_tasks` (filtered by worker ID) - New offers and status changes
- `sanitation_reports` - Report details updates
- `report_assignments` - Assignment changes

**Triggers**:
- When admin assigns a task → Worker sees new offer instantly
- When admin removes assignment → Offer disappears instantly
- When report details change → Worker sees updated info

### ✅ Admin: Dashboard

**File**: `components/admin/useDashboardData.js`

**Subscriptions**:
- `sanitation_reports` - All report changes
- `report_assignments` - Assignment changes

**Triggers**:
- When reports are created/updated → Metrics update instantly
- When tasks are completed → Statistics refresh automatically
- When assignments change → Worker performance updates

### ✅ Reports List Page

**File**: `hooks/useReports.js`

**Subscriptions**:
- `sanitation_reports` - All report changes

**Triggers**:
- When new reports are submitted → Appears in list instantly
- When report status changes → Updates in real-time
- When reports are deleted → Removed from list instantly

## Benefits

### 🚀 Instant Updates
No need to refresh the page. Changes appear immediately across all connected users.

### 👥 Multi-user Collaboration
Multiple admins can work simultaneously without conflicts. Everyone sees the same up-to-date information.

### ⚡ Better UX
Users get instant feedback on their actions and see changes made by others in real-time.

### 🔄 Reduced Server Load
No need for constant polling. The server pushes updates only when changes occur.

## Performance Considerations

### Efficient Queries
Real-time callbacks trigger data refetches, but we use:
- Silent refreshes (no loading spinners)
- Optimistic updates (UI updates before server confirms)
- Debouncing (prevent multiple rapid refetches)

### Channel Management
Each subscription uses a unique channel name to prevent conflicts:
- `assign_reports` - Assign Workers page
- `my_tasks_123` - Worker's offers (filtered by user ID)
- `dashboard_reports` - Admin dashboard
- `reports_list` - Reports list page

### Memory Management
All channels are properly cleaned up when components unmount, preventing memory leaks.

## Testing Real-time Updates

### Test Scenario 1: Worker Accepts Offer

1. **Admin View**: Open Assign Workers page
2. **Worker View**: Open My Offers page in another browser/tab
3. **Action**: Worker clicks "Accept" on an offer
4. **Expected Result**: 
   - Worker sees status change to "In Progress" instantly
   - Admin sees worker card change from yellow (pending) to blue (accepted) instantly
   - No page refresh needed

### Test Scenario 2: Admin Assigns Worker

1. **Admin View**: Open Assign Workers page
2. **Worker View**: Open My Offers page
3. **Action**: Admin assigns a worker to a report
4. **Expected Result**:
   - Admin sees worker card with countdown timer instantly
   - Worker sees new offer appear in "Pending" tab instantly
   - No page refresh needed

### Test Scenario 3: Multiple Admins

1. **Admin 1**: Open Assign Workers page
2. **Admin 2**: Open Assign Workers page in another browser
3. **Action**: Admin 1 assigns a worker
4. **Expected Result**:
   - Both admins see the assignment instantly
   - Both see the same worker status
   - No conflicts or stale data

## Troubleshooting

### Updates Not Appearing?

1. **Check Supabase Dashboard**: Ensure Real-time is enabled for your tables
2. **Check Browser Console**: Look for `📡` emoji logs showing subscription events
3. **Check Network Tab**: Verify WebSocket connection is established
4. **Check Supabase Logs**: Look for replication errors

### Enable Real-time in Supabase

1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for these tables:
   - `sanitation_reports`
   - `report_assignments`
   - `service_tasks`
   - `profiles`
3. Save changes

### Console Logs

Real-time events are logged with the 📡 emoji:
```
📡 [assign_reports] sanitation_reports changed: {...}
📡 [my_tasks_123] service_tasks changed: {...}
📡 Dashboard: Report changed: {...}
```

## Future Enhancements

- [ ] Add presence indicators (show who's online)
- [ ] Add typing indicators for collaborative editing
- [ ] Add optimistic UI updates with rollback on error
- [ ] Add connection status indicator
- [ ] Add offline queue for actions when disconnected
- [ ] Add real-time notifications/toasts for important events

## Related Files

- `/lib/supabase.js` - Supabase client configuration
- `/lib/realtime.js` - Real-time utilities and helpers
- `/hooks/useAssignWorker.js` - Assign Workers real-time
- `/hooks/useMyOffers.js` - Worker Offers real-time
- `/hooks/useReports.js` - Reports List real-time
- `/components/admin/useDashboardData.js` - Dashboard real-time

## Resources

- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Replication](https://www.postgresql.org/docs/current/logical-replication.html)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
