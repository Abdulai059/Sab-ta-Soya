# Implementation Plan: Work Verification Workflow

## Overview

This implementation plan breaks down the work verification workflow feature into discrete, actionable tasks. The feature adds a verification step where supervisors and administrators can verify completed sanitation work before closing reports. Implementation follows existing patterns for React hooks, Supabase data access, and permission checking.

## Tasks

- [x] 1. Create useVerifyWork hook
  - Create `/hooks/useVerifyWork.js` following the pattern from `useCompleteWork` and `useStartWork`
  - Implement mutation function that validates report status, updates to "verified", and creates status history
  - Use `@tanstack/react-query` `useMutation` for state management
  - Invalidate queries: `['report', reportId]`, `['reports']`, `['assignment-history']`
  - Display toast notifications for success/error using `react-hot-toast`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 1.1 Write unit tests for useVerifyWork hook
  - Test successful verification flow
  - Test validation errors (report not found, invalid status)
  - Test permission errors
  - Test query invalidation on success
  - Test toast notifications
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4_

- [x] 2. Create VerifyWorkButton component
  - Create `/components/reports/detail/VerifyWorkButton.js`
  - Check permission using `useHasPermission(REPORTS.CHANGE_STATUS)`
  - Only render when report status is "disposed" and user has permission
  - Use ShieldCheck icon from `lucide-react`
  - Style with emerald color scheme matching existing action buttons
  - Display loading state during __verification
  - Call `useVerifyWork` hook on button click
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

- [ ]* 2.1 Write unit tests for VerifyWorkButton component
  - Test button renders when status is "disposed" and user has permission
  - Test button does not render when status is not "disposed"
  - Test button does not render when user lacks permission
  - Test loading state during verification
  - Test button calls verifyWork with correct parameters
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4_

- [x] 3. Integrate VerifyWorkButton into ReportDetailPage
  - Open `/app/(dashboard)/reports/[id]/page.js`
  - Import `VerifyWorkButton` component
  - Add button in appropriate location (below WorkflowRoadmap or in sidebar)
  - Pass props: `reportId={report.id}`, `reportStatus={report.status}`, `userId={profile.id}`
  - Ensure button is positioned prominently and styled consistently
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Manually test verification flow in development environment
  - Verify WorkflowRoadmap updates to show "verified" status
  - Verify StatusHistory shows verification entry
  - Ask the user if questions arise

- [ ]* 5. Write integration tests for verification flow
  - Test end-to-end verification flow (disposed → verified)
  - Test permission enforcement (unauthorized users cannot verify)
  - Test UI updates after verification (WorkflowRoadmap, StatusHistory)
  - Test error handling (invalid status, report not found)
  - _Requirements: 1.1, 2.1, 3.1, 4.5, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

- [ ] 6. Final checkpoint - Ensure all tests pass
  - Run full test suite and verify all tests pass
  - Perform manual testing with different user roles
  - Verify verification works for admin, district_officer, and supervisor
  - Verify verification is blocked for other roles
  - Verify status history tracking is accurate
  - Ask the user if questions arise

## Task Dependency Graph

```
1. Create useVerifyWork hook
  └─> 1.1 Write unit tests for useVerifyWork hook (optional)
  └─> 2. Create VerifyWorkButton component
      └─> 2.1 Write unit tests for VerifyWorkButton component (optional)
      └─> 3. Integrate VerifyWorkButton into ReportDetailPage
          └─> 4. Checkpoint - Ensure all tests pass
              └─> 5. Write integration tests for verification flow (optional)
                  └─> 6. Final checkpoint - Ensure all tests pass
```

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The feature integrates seamlessly with existing components (WorkflowRoadmap, StatusHistory)
- No database schema changes required - uses existing tables and columns
- Follow existing patterns from `useCompleteWork` and `useStartWork` hooks
