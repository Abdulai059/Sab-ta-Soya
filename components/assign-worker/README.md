# Assign Worker Module

This directory contains all modular components for the Assign Worker feature, following the modularity principle for better maintainability and reusability.

## Structure

### Core Components

#### `AssignWorkerPage.js` (Main Component)
- **Location**: `components/admin/AssignWorkerPage.js`
- **Purpose**: Main page component that orchestrates all sub-components
- **Responsibilities**:
  - State management (search, filters, removing state)
  - Data fetching via `useAssignWorker` hook
  - Filtering and sorting logic
  - Layout and composition of child components

### Custom Hooks

#### 1. `useReportFilters.js`
- **Purpose**: Manage report filtering and sorting logic
- **Parameters**: `reports` array
- **Returns**:
  - `filtered`: Filtered and sorted reports
  - `search`, `severityFilter`, `statusFilter`: Current filter values
  - `setSearch`, `setSeverityFilter`, `setStatusFilter`: Filter setters
  - `clearFilters`: Reset all filters to defaults
- **Features**:
  - Search by issue type, reference ID, location, community
  - Filter by severity (all/critical/high/medium/low)
  - Filter by status (active/completed/all)
  - Auto-sort by severity (critical → high → medium → low)

#### 2. `useReportStats.js`
- **Purpose**: Calculate report statistics
- **Parameters**: `reports` array
- **Returns**:
  - `unassigned`: Count of unassigned reports
  - `completed`: Count of completed reports
  - `critical`: Count of critical severity reports
  - `total`: Total report count
- **Features**:
  - Memoized calculations for performance
  - Considers both report status and task status

### Modular Components

#### 3. `constants.js`
- **Purpose**: Centralized constants and configuration
- **Exports**:
  - `OFFER_TIMEOUT_MS`: 30-minute timeout for worker offers
  - `SEVERITY_STYLES`: Color styles for severity badges
  - `SEVERITY_ORDER`: Sorting order for severity levels

#### 4. `SeverityBadge.js`
- **Purpose**: Display severity levels with appropriate styling
- **Components**:
  - `SeverityBadge`: Renders severity badge with color coding
  - `WorkerInitials`: Displays worker avatar with initials

#### 5. `OfferCountdown.js`
- **Purpose**: Live countdown timer for pending worker offers
- **Features**:
  - Real-time countdown display
  - Progress bar visualization
  - Urgent state (< 5 minutes) with red styling
  - Auto-expire callback when time runs out

#### 6. `Lightbox.js`
- **Purpose**: Full-screen image viewer with navigation
- **Features**:
  - Image carousel with prev/next navigation
  - Thumbnail strip at bottom
  - Caption display
  - Click outside to close

#### 7. `ConfirmRemoveModal.js`
- **Purpose**: Confirmation dialog for removing workers
- **Features**:
  - Context-aware messaging based on task status
  - Loading state during removal
  - Different messages for pending/active/completed tasks

#### 8. `AssignModal.js`
- **Purpose**: Modal for assigning/reassigning workers to reports
- **Features**:
  - Worker search functionality
  - Worker selection with role badges
  - Optional notes field
  - Warning when replacing current worker
  - Filters out currently assigned worker

#### 9. `WorkerSlot.js`
- **Purpose**: Display worker assignment status within report cards
- **States**:
  - **Pending**: Shows countdown timer and worker info
  - **Active**: Blue badge indicating work in progress
  - **Completed**: Green badge with verified checkmark
  - **Expired**: Red notice that offer expired
- **Features**:
  - Remove button for all states
  - State-specific styling and icons

#### 10. `ReportCard.js`
- **Purpose**: Individual report card with all report details
- **Features**:
  - Hero image with lightbox integration
  - Severity badge overlay
  - Status badge (pending/offer sent/in progress/completed)
  - Worker slot integration
  - Action buttons (assign/change/reassign worker)
  - Color-coded border based on status
  - Verified badge for completed tasks

#### 11. `AssignPageSkeleton.js`
- **Purpose**: Loading skeleton matching exact page layout
- **Features**:
  - Animated skeleton cards
  - Matches grid layout
  - Shows 6 placeholder cards

## Data Flow

```
AssignWorkerPage (Main)
  ├─ useAssignWorker hook (data fetching)
  ├─ useReportFilters hook (filtering & sorting)
  ├─ useReportStats hook (statistics)
  └─ ReportCard (for each report)
      ├─ WorkerSlot (assignment status)
      │   └─ OfferCountdown (if pending)
      ├─ AssignModal (when assigning)
      ├─ Lightbox (when viewing images)
      └─ ConfirmRemoveModal (when removing)
```

## Usage Example

```jsx
import AssignWorkerPage from "@/components/admin/AssignWorkerPage";

// In your route/page component
export default function AssignWorkersRoute() {
  return <AssignWorkerPage />;
}
```

## Component Dependencies

- **External Libraries**: `lucide-react` for icons
- **Custom Hooks**: 
  - `useAssignWorker` from `@/hooks/useAssignWorker` (data fetching)
  - `useReportFilters` from `./useReportFilters` (filtering logic)
  - `useReportStats` from `./useReportStats` (statistics)
- **Utils**: `ROLE_METADATA` from `@/lib/permissions`
- **Styling**: Tailwind CSS utility classes

## State Management

### Custom Hooks
- `useReportFilters`: Search, severity filter, status filter
- `useReportStats`: Unassigned, completed, critical, total counts
- `useAssignWorker`: Reports, workers, loading, assigning states

### Local State (AssignWorkerPage)
- `removing`: ID of assignment being removed

## Key Features

1. **Real-time Updates**: 30-second polling for worker actions
2. **Optimistic Updates**: Instant UI feedback before DB sync
3. **One Worker Per Report**: Automatic cancellation of existing assignments
4. **30-Minute Offer Window**: Auto-expire with countdown
5. **Admin Override**: Remove/reassign at any stage
6. **Status Filtering**: Active only / Completed only / All reports
7. **Severity Sorting**: Critical → High → Medium → Low

## Styling Conventions

- **Emerald**: Completed/success states
- **Blue**: Active/in-progress states
- **Yellow**: Pending/awaiting states
- **Red**: Critical/expired/error states
- **Gray**: Neutral/unassigned states

## Future Enhancements

- [ ] Bulk assignment functionality
- [ ] Worker availability calendar
- [ ] Assignment history timeline
- [ ] Performance metrics per worker
- [ ] Push notifications for workers
- [ ] Geolocation-based worker suggestions
