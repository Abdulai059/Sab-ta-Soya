# Implementation Plan: Work Assignment Feature

## Overview

This implementation plan breaks down the work-assignment feature into discrete coding tasks. The feature enables administrators to manually assign sanitation reports to sanitation workers, automatically manages report status transitions, provides workers with a dedicated view of their assignments, and maintains a complete audit trail of all assignment activities.

The implementation follows a layered architecture with presentation components, business logic hooks, and data access functions, all integrated with Supabase for real-time data synchronization and the existing RBAC permission system.

## Tasks

- [ ] 1. Set up database RPC function and RLS policies
  - [ ] 1.1 Create assign_report RPC function
    - Write PostgreSQL function to handle atomic assignment operations using existing tables
    - Update sanitation_reports.assigned_to and status fields
    - Insert record into report_assignments table (worker_id, assigned_by, status='pending')
    - Insert record into report_status_history table if status changes
    - Implement status transition logic (pending → assigned, assigned → assigned)
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3_
  
  - [ ] 1.2 Add Row Level Security policies
    - Create RLS policy for viewing report_assignments (admin, assigned workers, users with VIEW_ALL)
    - Create RLS policy for creating report_assignments records (admin, district_officer, supervisor)
    - Create RLS policy for viewing report_status_history (admin, assigned workers, users with VIEW_ALL)
    - _Requirements: 5.5, 5.6_

- [ ] 2. Implement data access layer hooks
  - [ ] 2.1 Create useWorkerList hook
    - Implement React Query hook to fetch all sanitation workers from profiles table
    - Filter by role = 'sanitation_worker'
    - Order by full_name ascending
    - Set staleTime to 5 minutes for caching
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 2.2 Write property test for useWorkerList
    - **Property 1: Worker List Completeness**
    - **Validates: Requirements 1.3**
  
  - [ ] 2.3 Create useAssignment hook
    - Implement React Query mutation hook for assignment operations
    - Validate worker role before assignment
    - Fetch current report state for history tracking
    - Call assign_report RPC function with all required parameters
    - Invalidate relevant queries on success
    - Display toast notifications for success/error
    - _Requirements: 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2_
  
  - [ ]* 2.4 Write property tests for useAssignment
    - **Property 2: Assignment Updates assigned_to Field**
    - **Property 3: Assignment Failure Preserves State**
    - **Property 4: Pending to Assigned Status Transition**
    - **Property 5: Reassignment Preserves Assigned Status**
    - **Property 6: Status Change Updates Timestamp**
    - **Validates: Requirements 1.4, 1.6, 2.1, 2.2, 2.3**
  
  - [ ] 2.5 Create useAssignmentHistory hook
    - Implement React Query hook to fetch assignment history from both report_assignments and report_status_history tables
    - Fetch from report_assignments with worker and assigner profiles joined
    - Fetch from report_status_history with changer profile joined
    - Combine both result sets and sort by timestamp descending (newest first)
    - Enable query only when reportId is provided
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [ ]* 2.6 Write property tests for useAssignmentHistory
    - **Property 14: History Record Structure**
    - **Property 15: History Chronological Ordering**
    - **Property 16: History Displays User Names**
    - **Validates: Requirements 4.4, 4.5, 4.6**

- [ ] 3. Checkpoint - Ensure database and hooks work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement WorkerSelector component
  - [ ] 4.1 Create WorkerSelector component structure
    - Create component file with props: reportId, currentAssignedTo, onAssignSuccess
    - Implement state management for isOpen, selectedWorkerId, isSubmitting
    - Add permission check using useHasPermission(REPORTS.ASSIGN)
    - Return null if user lacks permission
    - _Requirements: 1.1, 5.1, 5.2, 5.3_
  
  - [ ] 4.2 Implement worker list fetching and display
    - Use useWorkerList hook to fetch workers
    - Implement search/filter functionality for worker list
    - Display worker full_name and email in dropdown/modal
    - Show current assignment if exists
    - Handle loading and error states
    - _Requirements: 1.2, 1.3_
  
  - [ ] 4.3 Implement assignment action handler
    - Use useAssignment hook for assignment mutation
    - Handle worker selection and trigger assignment
    - Pass reportId, workerId, and assignedBy to mutation
    - Call onAssignSuccess callback after successful assignment
    - Close modal/dropdown after assignment
    - _Requirements: 1.4, 1.5, 1.6_
  
  - [ ] 4.4 Add responsive UI for desktop and mobile
    - Implement desktop view (≥768px) with dropdown or modal dialog
    - Implement mobile view (<768px) with full-screen modal or bottom sheet
    - Ensure touch targets are minimum 44x44px on mobile
    - Add proper ARIA labels and keyboard navigation support
    - _Requirements: 7.1, 7.2, 7.3, 7.6_
  
  - [ ]* 4.5 Write property test for WorkerSelector permission check
    - **Property 19: Worker Selection UI Permission Check**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 4.6 Write unit tests for WorkerSelector component
    - Test component renders correctly with permission
    - Test component returns null without permission
    - Test worker list display and search functionality
    - Test assignment action triggers correctly
    - Test responsive layout behavior
    - _Requirements: 1.1, 1.2, 5.2, 7.1, 7.2, 7.3_

- [ ] 5. Implement MyAssignments page
  - [ ] 5.1 Create MyAssignments page structure
    - Create page file at /app/my-assignments/page.js
    - Add permission check using useHasPermission(REPORTS.VIEW_ASSIGNED)
    - Redirect to unauthorized page if permission missing
    - Get current user profile from auth context
    - _Requirements: 3.6_
  
  - [ ] 5.2 Implement assignments data fetching
    - Use React Query to fetch reports where assigned_to = worker.id
    - Select required fields: id, reference_id, issue_type, severity, status, created_at, updated_at
    - Join with locations and communities tables for location details
    - Order by created_at descending (newest first)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 5.3 Add real-time subscription for assignments
    - Create Supabase channel subscription for sanitation_reports table
    - Filter by assigned_to = worker.id
    - Listen for INSERT, UPDATE, DELETE events
    - Invalidate queries on changes to trigger refetch
    - Handle connection status (connected, disconnected, error)
    - Display connection status indicator when not connected
    - Unsubscribe on component unmount
    - _Requirements: 3.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 5.4 Implement UI layout and report cards
    - Create header with page title and total assignment count
    - Implement responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
    - Create report cards showing issue_type, location, severity, status, created_at
    - Add link to report detail page for each card
    - Display empty state when no assignments exist
    - Add loading skeleton during data fetch
    - _Requirements: 3.2, 3.4, 7.1, 7.4_
  
  - [ ]* 5.5 Write property tests for MyAssignments page
    - **Property 7: Assignment Filtering by Worker**
    - **Property 8: Assignment Display Includes Required Fields**
    - **Property 9: Assignment Ordering by Creation Time**
    - **Property 10: My Assignments Permission Check**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.6**
  
  - [ ]* 5.6 Write unit tests for MyAssignments page
    - Test page renders correctly with permission
    - Test page redirects without permission
    - Test assignments display with correct data
    - Test empty state displays when no assignments
    - Test real-time updates trigger refetch
    - _Requirements: 3.1, 3.4, 3.6, 8.1_

- [ ] 6. Implement AssignmentHistory component
  - [ ] 6.1 Create AssignmentHistory component structure
    - Create component file with props: reportId
    - Add permission check using useHasPermission(REPORTS.VIEW_DETAILS)
    - Return null if user lacks permission
    - Use useAssignmentHistory hook to fetch history data
    - _Requirements: 4.5, 5.4_
  
  - [ ] 6.2 Implement history display with formatting
    - Display history records in chronological order (newest first)
    - Format action messages using formatHistoryMessage utility (handle 'assignment' and 'status_change' types)
    - Format timestamps using formatTimeAgo utility (relative time)
    - Add action type icons for assignments and status changes
    - Display full names of workers, assigners, and status changers
    - Show empty state when no history exists
    - _Requirements: 4.5, 4.6, 4.7_
  
  - [ ] 6.3 Add responsive layout for history display
    - Implement responsive layout that adapts to screen size
    - Add horizontal scroll on small screens if necessary
    - Ensure proper spacing and readability on all devices
    - _Requirements: 7.1, 7.5_
  
  - [ ]* 6.4 Write property tests for AssignmentHistory
    - **Property 11: Assignment Creates History Record**
    - **Property 12: Reassignment Creates New History Record**
    - **Property 13: Status Change Creates History Record**
    - **Property 17: History Timestamps Use Relative Format**
    - **Property 20: History View Permission Check**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.7, 5.4**
  
  - [ ]* 6.5 Write unit tests for AssignmentHistory component
    - Test component renders correctly with permission
    - Test component returns null without permission
    - Test history records display in correct order
    - Test action messages format correctly
    - Test timestamps format as relative time
    - Test empty state displays when no history
    - _Requirements: 4.5, 4.6, 4.7, 5.4_

- [ ] 7. Create utility functions
  - [ ] 7.1 Implement formatHistoryMessage utility
    - Create function to format history records into human-readable messages
    - Handle 'assignment' type (from report_assignments table)
    - Handle 'status_change' type (from report_status_history table)
    - Include full names of workers, assigners, and status changers in messages
    - Return appropriate message for each record type
    - _Requirements: 4.6_
  
  - [ ] 7.2 Implement formatTimeAgo utility
    - Create function to format timestamps as relative time
    - Handle "just now", "X minutes ago", "X hours ago", "X days ago"
    - Fall back to date string for older timestamps
    - _Requirements: 4.7_
  
  - [ ]* 7.3 Write unit tests for utility functions
    - Test formatHistoryMessage with all action types
    - Test formatTimeAgo with various time differences
    - Test edge cases and boundary conditions
    - _Requirements: 4.6, 4.7_

- [ ] 8. Implement validation and error handling
  - [ ] 8.1 Add validation in useAssignment hook
    - Validate worker has sanitation_worker role before assignment
    - Validate report exists before assignment
    - Validate user is not inactive or deleted
    - Return descriptive error messages for each validation failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_
  
  - [ ]* 8.2 Write property tests for validation
    - **Property 18: Assignment Permission Check**
    - **Property 21: Server-Side Permission Validation**
    - **Property 22: Worker Role Validation**
    - **Property 23: Report Existence Validation**
    - **Property 24: User Existence Validation**
    - **Property 25: Active User Validation**
    - **Property 26: Validation Failure Rollback**
    - **Validates: Requirements 5.1, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.6, 6.7**
  
  - [ ] 8.3 Add error handling and user feedback
    - Implement error message constants for common errors
    - Display toast notifications for validation errors
    - Handle network errors gracefully
    - Ensure transaction rollback on any failure
    - _Requirements: 1.6, 2.5, 6.7_

- [ ] 9. Checkpoint - Ensure all components work together
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integration and final touches
  - [ ] 10.1 Integrate WorkerSelector into report detail pages
    - Add WorkerSelector component to admin report detail view
    - Pass reportId and currentAssignedTo props
    - Handle onAssignSuccess callback to refresh report data
    - Ensure proper permission checks are in place
    - _Requirements: 1.1, 5.1_
  
  - [ ] 10.2 Integrate AssignmentHistory into report detail pages
    - Add AssignmentHistory component to report detail view
    - Pass reportId prop
    - Ensure proper permission checks are in place
    - Position appropriately in the page layout
    - _Requirements: 4.5, 5.4_
  
  - [ ] 10.3 Add navigation link to MyAssignments page
    - Add "My Assignments" link to navigation menu for sanitation workers
    - Show link only to users with REPORTS.VIEW_ASSIGNED permission
    - Ensure link is accessible and properly styled
    - _Requirements: 3.6_
  
  - [ ]* 10.4 Write integration tests
    - Test complete assignment flow from admin to worker
    - Test real-time updates propagate correctly
    - Test database atomicity and rollback scenarios
    - Test RLS policies enforce permissions correctly
    - Test foreign key constraints work as expected
    - _Requirements: 2.4, 6.3, 6.4, 6.5, 6.7, 8.4_

- [ ] 11. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate database transactions and real-time behavior
- The implementation uses JavaScript/React with Next.js framework
- All database operations use Supabase client and RPC functions
- Real-time updates use Supabase real-time subscriptions
- Permission checks use the existing RBAC system in /lib/permissions.js
- **Uses existing database tables**: report_assignments, report_status_history, sanitation_reports, profiles
- **No new tables needed**: The schema already has all necessary tables for assignment tracking

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "7.1", "7.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "7.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "8.1"] },
    { "id": 4, "tasks": ["2.6", "4.1", "8.2"] },
    { "id": 5, "tasks": ["4.2", "4.3", "5.1", "8.3"] },
    { "id": 6, "tasks": ["4.4", "4.5", "5.2"] },
    { "id": 7, "tasks": ["4.6", "5.3", "6.1"] },
    { "id": 8, "tasks": ["5.4", "6.2"] },
    { "id": 9, "tasks": ["5.5", "6.3"] },
    { "id": 10, "tasks": ["5.6", "6.4"] },
    { "id": 11, "tasks": ["6.5", "10.1"] },
    { "id": 12, "tasks": ["10.2", "10.3"] },
    { "id": 13, "tasks": ["10.4"] }
  ]
}
```
