# Requirements Document

## Introduction

This document specifies the requirements for a work verification workflow feature that enables supervisors and administrators to verify completed sanitation work. The feature extends the existing work assignment workflow (Pending → Assigned → In Progress → Disposed) by adding a verification step where authorized users can confirm work completion before closing reports.

## Glossary

- **System**: The Santrack sanitation management application
- **Report**: A sanitation issue report tracked in the sanitation_reports table
- **Verification**: The process of confirming that completed work meets quality standards
- **Authorized_User**: A user with admin, district_officer, or supervisor role
- **Disposed_Report**: A report with status "disposed" indicating work completion by a sanitation worker
- **Verified_Report**: A report with status "verified" indicating confirmed completion by an authorized user
- **Status_History**: A record in report_status_history tracking status changes
- **Verify_Button**: A UI control that triggers the verification action

## Requirements

### Requirement 1: Verification Action Availability

**User Story:** As a supervisor or administrator, I want to see a verify button on disposed reports, so that I can confirm completed work.

#### Acceptance Criteria

1. WHEN an Authorized_User views a Disposed_Report THEN THE System SHALL display the Verify_Button on the report detail page
2. WHEN a non-authorized user views a Disposed_Report THEN THE System SHALL NOT display the Verify_Button
3. WHEN an Authorized_User views a report with status other than "disposed" THEN THE System SHALL NOT display the Verify_Button
4. WHEN an Authorized_User views a Verified_Report THEN THE System SHALL NOT display the Verify_Button

### Requirement 2: Verification Execution

**User Story:** As a supervisor or administrator, I want to verify completed work, so that I can confirm the work was done properly and close the report.

#### Acceptance Criteria

1. WHEN an Authorized_User clicks the Verify_Button THEN THE System SHALL change the report status from "disposed" to "verified"
2. WHEN the verification succeeds THEN THE System SHALL update the report's updated_at timestamp
3. WHEN the verification succeeds THEN THE System SHALL display a success notification to the user
4. IF the verification fails THEN THE System SHALL display an error notification with a descriptive message
5. WHEN the verification is in progress THEN THE System SHALL disable the Verify_Button to prevent duplicate submissions

### Requirement 3: Status History Tracking

**User Story:** As a system administrator, I want verification actions tracked in the status history, so that I can audit who verified each report and when.

#### Acceptance Criteria

1. WHEN a report is verified THEN THE System SHALL create a Status_History record with old_status "disposed" and new_status "verified"
2. WHEN creating the Status_History record THEN THE System SHALL record the Authorized_User's ID in the changed_by field
3. WHEN creating the Status_History record THEN THE System SHALL record the current timestamp in the changed_at field
4. WHEN creating the Status_History record THEN THE System SHALL include a note indicating "Work verified by supervisor/admin"

### Requirement 4: Permission Enforcement

**User Story:** As a system administrator, I want verification restricted to authorized roles, so that only qualified personnel can verify work completion.

#### Acceptance Criteria

1. THE System SHALL allow users with role "admin" to verify reports
2. THE System SHALL allow users with role "district_officer" to verify reports
3. THE System SHALL allow users with role "supervisor" to verify reports
4. THE System SHALL prevent users with any other role from verifying reports
5. WHEN an unauthorized user attempts verification THEN THE System SHALL return an error and maintain the current report status

### Requirement 5: UI Integration

**User Story:** As a supervisor, I want the verify button integrated into the existing report detail page, so that I can easily verify work without navigating away.

#### Acceptance Criteria

1. WHEN the Verify_Button is displayed THEN THE System SHALL position it in a prominent location on the report detail page
2. WHEN the Verify_Button is displayed THEN THE System SHALL style it consistently with existing action buttons
3. WHEN verification succeeds THEN THE System SHALL update the WorkflowRoadmap component to reflect the "verified" status
4. WHEN verification succeeds THEN THE System SHALL refresh the report data to show updated information
5. WHEN verification succeeds THEN THE System SHALL update the StatusHistory component to show the new verification entry

### Requirement 6: Data Integrity

**User Story:** As a system administrator, I want verification to maintain data integrity, so that the system remains in a consistent state.

#### Acceptance Criteria

1. WHEN verification is initiated THEN THE System SHALL verify the report exists before updating
2. WHEN verification is initiated THEN THE System SHALL verify the current status is "disposed" before updating
3. IF the report does not exist THEN THE System SHALL return an error "Report not found"
4. IF the current status is not "disposed" THEN THE System SHALL return an error "Report cannot be verified in current status"
5. WHEN verification completes THEN THE System SHALL invalidate cached report data to ensure UI consistency
