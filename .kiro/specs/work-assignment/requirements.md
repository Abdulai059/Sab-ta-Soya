# Requirements Document

## Introduction

The work-assignment feature enables administrators to manually assign sanitation reports to sanitation workers, automatically updating report status, providing workers with a dedicated view of their assignments, and maintaining a complete audit trail of all assignment activities.

This feature extends the existing Next.js application with Supabase backend, leveraging the current RBAC system, reports infrastructure, and user management capabilities.

## Glossary

- **Admin_User**: A user with the admin role who has permission to assign reports to sanitation workers
- **Sanitation_Worker**: A user with the sanitation_worker role who receives and works on assigned reports
- **Assignment_System**: The subsystem responsible for managing report assignments, status updates, and assignment history
- **Report**: A sanitation incident record in the sanitation_reports table with statuses: pending, assigned, in_progress, verified
- **Assignment_History**: A complete audit trail of assignment events including who assigned, when, reassignments, and status changes
- **Worker_List**: The complete list of all users with the sanitation_worker role available for assignment
- **My_Assignments_Page**: A dedicated page showing sanitation workers only their assigned reports
- **Assignment_Action**: The act of linking a report to a sanitation worker by setting the assigned_to field

## Requirements

### Requirement 1: Manual Report Assignment

**User Story:** As an admin, I want to manually assign reports to sanitation workers from a complete list, so that I can distribute work based on my knowledge of worker availability and expertise.

#### Acceptance Criteria

1. WHEN an Admin_User views a Report, THE Assignment_System SHALL display a worker selection interface
2. WHEN the worker selection interface is displayed, THE Assignment_System SHALL retrieve and display the complete Worker_List
3. THE Worker_List SHALL include the full name and role of each Sanitation_Worker
4. WHEN an Admin_User selects a Sanitation_Worker from the Worker_List, THE Assignment_System SHALL update the Report assigned_to field with the selected worker's user ID
5. WHEN the Assignment_Action completes successfully, THE Assignment_System SHALL display a success confirmation message
6. IF the Assignment_Action fails, THEN THE Assignment_System SHALL display an error message and retain the previous assignment state

### Requirement 2: Automatic Status Change on Assignment

**User Story:** As an admin, I want the report status to automatically change to "assigned" when I assign it to a worker, so that the workflow progresses without manual status updates.

#### Acceptance Criteria

1. WHEN an Admin_User assigns a Report with status "pending" to a Sanitation_Worker, THE Assignment_System SHALL change the Report status to "assigned"
2. WHEN an Admin_User reassigns a Report from one Sanitation_Worker to another Sanitation_Worker, THE Assignment_System SHALL maintain the Report status as "assigned"
3. WHEN the status change completes, THE Assignment_System SHALL update the Report updated_at timestamp
4. THE Assignment_System SHALL persist both the assigned_to field and status field changes in a single atomic transaction
5. IF the status update fails, THEN THE Assignment_System SHALL rollback the assignment and display an error message

### Requirement 3: Worker Assignment View

**User Story:** As a sanitation worker, I want to see only my assigned reports on a dedicated page, so that I can focus on my work without distraction from other reports.

#### Acceptance Criteria

1. WHEN a Sanitation_Worker navigates to the My_Assignments_Page, THE Assignment_System SHALL display only Reports where assigned_to equals the worker's user ID
2. THE My_Assignments_Page SHALL display Report details including issue type, location, severity, status, and created date
3. THE My_Assignments_Page SHALL order Reports by created_at timestamp in descending order
4. WHEN no Reports are assigned to the Sanitation_Worker, THE My_Assignments_Page SHALL display an empty state message
5. WHEN a Report is assigned to the Sanitation_Worker in real-time, THE My_Assignments_Page SHALL update to include the new assignment within 2 seconds
6. THE Assignment_System SHALL restrict access to the My_Assignments_Page to users with the REPORTS.VIEW_ASSIGNED permission

### Requirement 4: Assignment History Tracking

**User Story:** As an admin, I want to see a complete history of all assignment activities for each report, so that I can audit who assigned work, when it was assigned, and track any reassignments.

#### Acceptance Criteria

1. WHEN an Admin_User assigns a Report to a Sanitation_Worker, THE Assignment_System SHALL create an Assignment_History record with the assigner's user ID, assignee's user ID, and assignment timestamp
2. WHEN an Admin_User reassigns a Report from one Sanitation_Worker to another Sanitation_Worker, THE Assignment_System SHALL create a new Assignment_History record with the reassignment details
3. WHEN a Report status changes, THE Assignment_System SHALL create an Assignment_History record with the status change details and the user who triggered the change
4. THE Assignment_History record SHALL include the fields: report_id, assigned_by, assigned_to, action_type, previous_value, new_value, and created_at
5. WHEN an Admin_User views a Report, THE Assignment_System SHALL display the complete Assignment_History in chronological order
6. THE Assignment_History SHALL display the full name of the assigner and assignee for each record
7. THE Assignment_History SHALL display human-readable timestamps using relative time format (e.g., "2 hours ago")
8. THE Assignment_System SHALL persist Assignment_History records permanently and prevent deletion or modification

### Requirement 5: Permission-Based Access Control

**User Story:** As a system administrator, I want assignment functionality to respect existing RBAC permissions, so that only authorized users can assign reports and view assignment history.

#### Acceptance Criteria

1. THE Assignment_System SHALL allow assignment actions only for users with the REPORTS.ASSIGN permission
2. THE Assignment_System SHALL display the worker selection interface only to users with the REPORTS.ASSIGN permission
3. WHEN a user without the REPORTS.ASSIGN permission views a Report, THE Assignment_System SHALL hide the worker selection interface
4. THE Assignment_System SHALL allow viewing Assignment_History only to users with the REPORTS.VIEW_DETAILS permission
5. THE Assignment_System SHALL validate permissions on the server side before executing any assignment or status change operation
6. IF a user attempts an assignment action without the REPORTS.ASSIGN permission, THEN THE Assignment_System SHALL return a 403 Forbidden error

### Requirement 6: Data Integrity and Validation

**User Story:** As a system administrator, I want the assignment system to validate all data and maintain referential integrity, so that the system remains consistent and reliable.

#### Acceptance Criteria

1. WHEN an Admin_User attempts to assign a Report, THE Assignment_System SHALL verify that the selected user has the sanitation_worker role
2. IF the selected user does not have the sanitation_worker role, THEN THE Assignment_System SHALL reject the assignment and display an error message
3. THE Assignment_System SHALL verify that the Report exists before creating an Assignment_History record
4. THE Assignment_System SHALL verify that the assigned_to user ID references a valid user in the profiles table
5. WHEN creating an Assignment_History record, THE Assignment_System SHALL enforce foreign key constraints for report_id, assigned_by, and assigned_to fields
6. THE Assignment_System SHALL prevent assignment of a Report to a deleted or inactive user account
7. IF any validation fails, THEN THE Assignment_System SHALL rollback all changes and return a descriptive error message

### Requirement 7: User Interface Responsiveness

**User Story:** As a user, I want the assignment interface to work smoothly on both desktop and mobile devices, so that I can manage assignments from any device.

#### Acceptance Criteria

1. THE Assignment_System SHALL render the worker selection interface with responsive design that adapts to screen widths from 320px to 2560px
2. WHEN displayed on mobile devices (screen width less than 768px), THE worker selection interface SHALL use a full-screen modal or bottom sheet layout
3. WHEN displayed on desktop devices (screen width 768px or greater), THE worker selection interface SHALL use a dropdown or modal dialog layout
4. THE My_Assignments_Page SHALL display Reports in a responsive grid or list layout that adapts to screen size
5. THE Assignment_History SHALL display in a responsive format with horizontal scrolling on small screens if necessary
6. THE Assignment_System SHALL ensure all interactive elements have a minimum touch target size of 44x44 pixels on mobile devices

### Requirement 8: Real-Time Updates

**User Story:** As a sanitation worker, I want to see new assignments appear immediately without refreshing the page, so that I can respond quickly to new work.

#### Acceptance Criteria

1. WHEN a Report is assigned to a Sanitation_Worker, THE Assignment_System SHALL push a real-time update to the worker's active My_Assignments_Page session
2. WHEN a Report assignment is removed or reassigned, THE Assignment_System SHALL push a real-time update to remove the Report from the previous worker's My_Assignments_Page
3. WHEN a Report status changes, THE Assignment_System SHALL push a real-time update to all users viewing that Report
4. THE Assignment_System SHALL use Supabase real-time subscriptions to deliver updates within 2 seconds of the triggering event
5. IF the real-time connection is lost, THEN THE Assignment_System SHALL display a connection status indicator and attempt to reconnect
6. WHEN the real-time connection is restored, THE Assignment_System SHALL refresh the displayed data to ensure consistency
