# Assignment History Feature

## Overview
Added comprehensive assignment history tracking for sanitation workers to view all past assignments (completed, declined, and expired).

## Features Implemented

### 1. History Display
- Shows all historical assignments with status badges
- Displays timeline of events (assigned, accepted, completed/declined)
- Calculates and shows duration for each assignment
- Shows decline reasons when applicable

### 2. Filtering & Sorting
- Filter by status: All, Completed, Declined, Expired
- Sort by date: Newest First, Oldest First
- Real-time filtering without page reload

### 3. Statistics
- Total assignments count
- Completion rate percentage
- Average completion time
- Breakdown by status (completed/declined/expired)

### 4. User Interface
- Clean card-based layout
- Color-coded status badges (green=completed, red=declined, gray=expired)
- Responsive grid layout
- Empty states for no history

## Files Created

### Components
1. **`components/assignment/HistoryCard.js`**
   - Displays individual assignment history
   - Shows timeline and duration
   - View details button for completed assignments
   - Decline reason display

2. **`components/assignment/HistoryFilters.js`**
   - Status filter buttons
   - Sort dropdown
   - Clean, accessible UI

### Hooks
3. **`hooks/useAssignmentHistory.js`**
   - Fetches historical assignments from database
   - Filters by status (rejected, completed, expired)
   - Sorted by completion date
   - React Query caching

### Utilities
4. **`utils/assignmentStats.js`**
   - `calculateAssignmentStats()` - Computes statistics
   - `calculateDuration()` - Calculates time between events
   - Formats durations (minutes, hours, days)

### Pages
5. **`app/(dashboard)/my-assignments/page.js`** (Updated)
   - Added history section
   - Integrated filters and stats
   - Real-time updates for history
   - Three-column stats display

## Database Schema Used

**Existing Tables (No Changes Required):**
- `report_assignments` - Status tracking
- `sanitation_reports` - Report details
- `locations` - Location information
- `communities` - Community data

**Status Values:**
- `pending` - Awaiting worker action
- `accepted` - Worker accepted
- `rejected` - Worker declined
- `completed` - Work finished
- `expired` - Assignment expired

## User Experience

### Viewing History
1. Worker navigates to My Assignments
2. Scrolls to "Assignment History" section
3. Sees all past assignments with status badges
4. Can filter by status or sort by date

### Completed Assignments
- Green badge with checkmark icon
- Shows full timeline (assigned → accepted → completed)
- Displays duration
- "View Details" button to see report

### Declined Assignments
- Red badge with X icon
- Shows timeline (assigned → declined)
- Displays decline reason if provided
- Shows how quickly they declined

### Statistics Display
- Pending count (orange)
- Accepted count (green)
- History count (gray)
- Completion rate percentage
- Average completion time

## Real-time Updates

**Subscriptions:**
- Listens to `sanitation_reports` changes
- Listens to `report_assignments` changes
- Automatically refreshes both active and history lists
- Connection status indicator

## Performance Optimizations

1. **React Query Caching**
   - Separate queries for active and history
   - Automatic cache invalidation
   - Background refetching

2. **Memoization**
   - Stats calculated with `useMemo`
   - Filtered history memoized
   - Prevents unnecessary recalculations

3. **Efficient Queries**
   - Single query for history
   - Proper indexing on status field
   - Sorted at database level

## Accessibility

- Keyboard navigation for filters
- ARIA labels for status badges
- Screen reader friendly
- Focus management
- Color contrast compliant

## Mobile Responsive

- Stacks cards vertically on mobile
- Touch-friendly buttons
- Collapsible sections
- Optimized for small screens

## Future Enhancements

### Phase 2 (Optional)
- Export history to CSV
- Pagination for large histories
- Search by reference ID
- Date range filter

### Phase 3 (Optional)
- Performance charts
- Comparison with other workers
- Detailed analytics modal
- Print-friendly view

## Testing Checklist

- [ ] History loads correctly
- [ ] Filters work properly
- [ ] Sort order changes
- [ ] Status badges display correctly
- [ ] Durations calculate accurately
- [ ] Decline reasons show
- [ ] View details works for completed
- [ ] Real-time updates work
- [ ] Empty states display
- [ ] Mobile responsive
- [ ] Statistics accurate
- [ ] Completion rate correct

## Usage

Workers can now:
1. View all past assignments
2. Filter by completion status
3. Sort by date
4. See decline reasons
5. Track performance metrics
6. Review completed work
7. Learn from past decisions
