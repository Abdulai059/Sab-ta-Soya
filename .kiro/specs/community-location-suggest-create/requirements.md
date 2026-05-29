# Requirements Document

## Introduction

The Submit Issue Form (`app/(dashboard)/reporteissue/page.js`) currently uses plain dropdowns populated from the database. If a reporter's community or location does not exist in the database, they are blocked from submitting a report. This feature introduces a "suggest + create" pattern: users can search existing communities and locations via a combobox, and when no match is found, they can add a new entry inline. New entries are inserted into the database immediately so the report can be submitted, and they are flagged for admin review. Admins can approve or reject suggested entries from the admin panel.

## Glossary

- **Form**: The React page component at `app/(dashboard)/reporteissue/page.js` that collects and submits sanitation incident reports.
- **Combobox**: A combined text-input and dropdown UI control that supports live search and an inline "add new" option.
- **Community**: A row in the `communities` table with fields `id`, `name`, `district`, `region`, `is_user_suggested`, etc.
- **Location**: A row in the `locations` table with fields `id`, `name`, `type`, `community_id`, `status`, `created_by`, etc.
- **Suggested_Community**: A Community row where `is_user_suggested = true`, created by a reporter and awaiting admin review.
- **Suggested_Location**: A Location row where `status = 'pending_review'`, created by a reporter and awaiting admin review.
- **Inline_Form**: A small form that appears below the Combobox when the user chooses to add a new entry, collecting only the fields needed to create the new record.
- **Admin_Panel**: The admin page at `app/(dashboard)/admin/page.js` where administrators manage the application.
- **Supabase**: The backend-as-a-service platform providing the PostgreSQL database used by the application.
- **Profile**: A row in the `profiles` table representing an authenticated user, containing `id`, `phone`, and other fields.
- **Reporter**: An authenticated user who submits a sanitation incident report via the Form.

---

## Requirements

### Requirement 1: Database Schema — Add `is_user_suggested` to Communities

**User Story:** As a developer, I want the `communities` table to carry a flag that identifies user-suggested entries, so that the system can distinguish admin-curated communities from reporter-submitted ones.

#### Acceptance Criteria

1. THE Database SHALL have an `is_user_suggested` boolean column on the `communities` table with a default value of `false`.
2. THE Database SHALL preserve all existing community rows with `is_user_suggested = false` after the migration is applied.
3. WHEN a new community is inserted without specifying `is_user_suggested`, THE Database SHALL default the value to `false`.

---

### Requirement 2: Community Combobox with Live Search

**User Story:** As a reporter, I want to search for my community by typing, so that I can quickly find it without scrolling through a long dropdown list.

#### Acceptance Criteria

1. THE Form SHALL replace the community `SelectInput` with a Combobox that contains a text input for live search.
2. WHEN the reporter types in the community Combobox, THE Combobox SHALL filter and display matching Community rows from the `communities` table where the `name` contains the typed text (case-insensitive).
3. WHILE any community data fetch is in progress (including initial load and subsequent searches), THE Combobox SHALL display a disabled state with a "Loading communities…" placeholder and SHALL NOT display search results until the fetch completes.
4. WHEN the reporter clears the community Combobox input, THE Combobox SHALL reset the selected community and clear the location Combobox.
5. WHEN the reporter selects a community from the dropdown results, THE Form SHALL record the selected community's `id` and `name` and close the dropdown.

---

### Requirement 3: Suggest New Community Inline

**User Story:** As a reporter, I want to add a new community if it doesn't exist in the list, so that I am not blocked from submitting a report.

#### Acceptance Criteria

1. WHEN the reporter types a community name that produces no matching results in the Combobox dropdown, THE Combobox SHALL display an "Add '[typed name]' as new community" option at the bottom of the dropdown.
2. WHEN the reporter selects the "Add new community" option, THE Form SHALL display an Inline_Form below the Combobox with optional text fields for `district` and `region`.
3. WHEN the reporter confirms the Inline_Form, THE Form SHALL insert a new row into the `communities` table with the typed `name`, the entered `district` (or `null` if blank), the entered `region` (or `null` if blank), and `is_user_suggested = true`.
4. WHEN the community insert succeeds, THE Form SHALL use the newly created community's `id` as the selected community and close the Inline_Form.
5. IF the community insert fails, THEN THE Form SHALL display a toast error message and keep the Inline_Form open so the reporter can retry.
6. WHEN the reporter cancels the Inline_Form, THE Form SHALL close the Inline_Form and clear the typed community name.

---

### Requirement 4: Location Combobox with Live Search

**User Story:** As a reporter, I want to search for a specific location by typing, so that I can quickly find it within the selected community.

#### Acceptance Criteria

1. THE Form SHALL replace the location `SelectInput` with a Combobox that contains a text input for live search.
2. WHEN a community is selected, THE Location_Combobox SHALL fetch Location rows from the `locations` table filtered by `community_id` matching the selected community's `id`.
3. WHEN the reporter types in the Location_Combobox, THE Location_Combobox SHALL filter and display matching Location rows where the `name` contains the typed text (case-insensitive).
4. WHILE locations are loading after a community is selected, THE Location_Combobox SHALL display a disabled state with a "Loading locations…" placeholder and SHALL exit the loading state immediately when the fetch completes.
5. WHEN the selected community changes, THE Location_Combobox SHALL clear the previously selected location and re-fetch locations for the new community.
6. WHILE no community is selected, THE Location_Combobox SHALL remain disabled with a "Select community first" placeholder.

---

### Requirement 5: Suggest New Location Inline

**User Story:** As a reporter, I want to add a new location if it doesn't exist in the list, so that I am not blocked from submitting a report.

#### Acceptance Criteria

1. WHEN the reporter types a location name that produces no matching results in the Location_Combobox dropdown, THE Location_Combobox SHALL display an "Add '[typed name]' as new location" option at the bottom of the dropdown.
2. WHEN the reporter selects the "Add new location" option, THE Form SHALL display an Inline_Form below the Location_Combobox with optional text fields for `area_name` and `landmark`.
3. WHEN the reporter confirms the Inline_Form, THE Form SHALL insert a new row into the `locations` table with: `name` set to the typed name, `community_id` set to the selected community's `id`, `type` set to the current `location_type` form value, `latitude` and `longitude` set from captured GPS coordinates (or `0` if not captured), `status` set to `'pending_review'`, and `created_by` set to `profile.id`.
4. WHEN the location insert succeeds, THE Form SHALL use the newly created location's `id` as the selected location and close the Inline_Form.
5. IF the location insert fails, THEN THE Form SHALL display a toast error message and keep the Inline_Form open so the reporter can retry.
6. WHEN the reporter cancels the Inline_Form, THE Form SHALL close the Inline_Form and clear the typed location name.
7. IF `location_type` has not been selected when the reporter attempts to confirm the new location Inline_Form, THEN THE Form SHALL display a validation message instructing the reporter to select a location type first, and SHALL NOT submit the insert.

---

### Requirement 6: Preserve Existing Form Behaviour

**User Story:** As a reporter, I want the rest of the form to work exactly as before, so that the combobox change does not disrupt my existing workflow.

#### Acceptance Criteria

1. THE Form SHALL retain all existing validation logic for `issueType`, `severity`, `phone`, `community`, and `locationType` fields.
2. THE Form SHALL continue to resolve `community_id` and `location_id` from the selected community and location objects when building the `sanitation_reports` insert payload.
3. THE Form SHALL retain the `GeoSection`, `CameraSection`, `SectionLabel`, `ToggleRow`, `Field`, and `Divider` components without modification to their props or rendering logic.
4. THE Form SHALL retain the severity selector, anonymous toggle, health risk toggle, GPS capture, camera capture, photo upload, and `location_images` insert functionality.
5. THE Form SHALL retain the `reference_id` auto-generation logic, cancel navigation, and success navigation.

---

### Requirement 7: Admin Panel — Pending Suggestions Badge

**User Story:** As an admin, I want to see a count of pending community and location suggestions, so that I know when entries need my review.

#### Acceptance Criteria

1. WHEN the Admin_Panel page loads, THE Admin_Panel SHALL query the `communities` table for the count of rows where `is_user_suggested = true` and the `locations` table for the count of rows where `status = 'pending_review'`.
2. THE Admin_Panel SHALL display the total pending suggestion count as a visible badge or counter in the suggestions section header.
3. WHILE the pending counts are loading, THE Admin_Panel SHALL display a loading indicator in place of the badge.
4. WHEN there are zero pending suggestions, THE Admin_Panel SHALL display the badge showing a count of zero.

---

### Requirement 8: Admin Panel — Review Suggested Communities

**User Story:** As an admin, I want to approve or reject user-suggested communities, so that the community list stays accurate and trustworthy.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a list of all Suggested_Community rows (where `is_user_suggested = true`), showing at minimum the community `name`, `district`, `region`, and the date it was created.
2. WHEN an admin approves a Suggested_Community, THE Admin_Panel SHALL update that community row by setting `is_user_suggested = false`.
3. WHEN an admin rejects a Suggested_Community, THE Admin_Panel SHALL delete that community row from the `communities` table.
4. IF a community being rejected has associated Location rows, THEN THE Admin_Panel SHALL display a confirmation warning before deleting, informing the admin that associated locations will also be affected.
5. WHEN an approve or reject action succeeds, THE Admin_Panel SHALL remove the community from the pending list, update the badge count, and display a success confirmation message.
6. IF an approve or reject action fails, THEN THE Admin_Panel SHALL display a toast error message and leave the community in the pending list.

---

### Requirement 9: Admin Panel — Review Suggested Locations

**User Story:** As an admin, I want to approve or reject user-suggested locations, so that the location list stays accurate and trustworthy.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a list of all Suggested_Location rows (where `status = 'pending_review'`), showing at minimum the location `name`, `type`, `area_name`, `landmark`, the parent community name, and the `created_by` profile identifier.
2. WHEN an admin approves a Suggested_Location, THE Admin_Panel SHALL update that location row by setting `status = 'operational'`.
3. WHEN an admin rejects a Suggested_Location, THE Admin_Panel SHALL delete that location row from the `locations` table.
4. WHEN an approve or reject action succeeds, THE Admin_Panel SHALL remove the location from the pending list, update the badge count, and display a success confirmation message.
5. IF an approve or reject action fails, THEN THE Admin_Panel SHALL display a toast error message and leave the location in the pending list. Previously displayed error messages MAY remain visible after subsequent successful actions.
