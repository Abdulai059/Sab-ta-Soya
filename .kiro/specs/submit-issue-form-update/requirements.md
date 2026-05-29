# Requirements Document

## Introduction

The Submit Issue Form (`app/(dashboard)/reporteissue/page.js`) currently has several data-flow bugs that prevent reports from being saved correctly to the database. This feature update fixes those bugs by: fetching communities and locations dynamically from the database, removing the non-existent `climate_event_id` column and replacing it with the correct `location_type` text field, adding the missing `affected_children_count` field, uploading captured photos to Supabase Storage and linking them to `location_images`, and auto-filling reporter phone from the authenticated user's profile. All existing UI components, layout, and visual design are preserved.

## Glossary

- **Form**: The React page component at `app/(dashboard)/reporteissue/page.js` that collects and submits sanitation incident reports.
- **Supabase**: The backend-as-a-service platform providing the PostgreSQL database and object storage used by the application.
- **Report**: A row inserted into the `sanitation_reports` table representing a reported sanitation incident.
- **Community**: A row in the `communities` table with fields `id`, `name`, `district`, `region`, etc.
- **Location**: A row in the `locations` table with fields `id`, `name`, `type`, `community_id`, etc.
- **Profile**: A row in the `profiles` table representing an authenticated user, containing `id`, `phone`, and other fields.
- **Storage_Bucket**: The Supabase Storage bucket named `report-images` used to store uploaded photo files.
- **Location_Images**: The `location_images` table that links uploaded image URLs to a `location_id` and `uploaded_by` profile.
- **Reporter_Phone**: The `reporter_phone` column (NOT NULL) in `sanitation_reports`, sourced from the authenticated user's profile phone or entered manually.
- **Location_Type**: The `location_type` text column in `sanitation_reports` describing the type of location (e.g. "Public toilet", "Market drain").
- **Affected_Children_Count**: The `affected_children_count` integer column in `sanitation_reports`.

---

## Requirements

### Requirement 1: Dynamic Community List

**User Story:** As a reporter, I want to select a community from a live list fetched from the database, so that the community I choose always corresponds to a real record in the `communities` table.

#### Acceptance Criteria

1. WHEN the Form mounts, THE Form SHALL fetch all rows from the `communities` table and populate the community dropdown with their `name` values.
2. WHILE the community list is loading, THE Form SHALL display a disabled dropdown with a "Loading communities…" placeholder.
3. WHILE the community fetch has not yet completed and no error has occurred, THE Form SHALL treat the state as a loading state and keep the dropdown disabled until the fetch completes.
4. IF the community fetch returns an error, THEN THE Form SHALL display a toast error message and leave the dropdown empty.
5. THE Form SHALL NOT use the hardcoded `COMMUNITIES` constant for the community dropdown.

---

### Requirement 2: Dynamic Location List Filtered by Community

**User Story:** As a reporter, I want the location dropdown to show only locations that belong to the selected community, so that I cannot pick a location that is unrelated to my chosen community.

#### Acceptance Criteria

1. WHEN a community is selected, THE Form SHALL fetch all `locations` rows where `community_id` matches the selected community's `id` and populate the location dropdown.
2. WHEN the selected community changes, THE Form SHALL clear the previously selected location and re-fetch locations for the new community.
3. WHILE locations are loading after a community selection, THE Form SHALL enforce both a disabled dropdown state and display a "Loading locations…" placeholder text.
4. IF the location fetch returns an error, THEN THE Form SHALL display a toast error message and leave the location dropdown empty.
5. THE Form SHALL NOT use hardcoded location strings for the location dropdown.

---

### Requirement 3: Remove `climate_event_id` and Add `location_type`

**User Story:** As a developer, I want the form to submit only columns that exist in the `sanitation_reports` schema, so that insert operations do not fail due to unknown column references.

#### Acceptance Criteria

1. THE Form SHALL NOT include `climate_event_id` in the `sanitation_reports` insert payload.
2. THE Form SHALL include a `location_type` text input field that allows the reporter to describe the type of location (e.g. "Public toilet", "Market drain").
3. THE Form SHALL prevent submission if the `location_type` field is empty, displaying a validation error before sending the payload.
4. WHEN the form is submitted, THE Form SHALL include the `location_type` value in the `sanitation_reports` insert payload.
5. THE Form SHALL retain the climate event UI element for display purposes only, but SHALL NOT attempt to resolve it to a database ID or insert it.

---

### Requirement 4: Collect `affected_children_count`

**User Story:** As a reporter, I want to specify how many children are affected by the incident, so that the report captures child-specific impact data required by the schema.

#### Acceptance Criteria

1. THE Form SHALL include an `affected_children_count` numeric input field in the Incident Details section.
2. WHEN the form is submitted, THE Form SHALL include the `affected_children_count` value (parsed as an integer, including zero) in the `sanitation_reports` insert payload, and SHALL prevent submission of negative values by displaying a validation error.
3. IF `affected_children_count` is left blank, THEN THE Form SHALL submit `null` for that field.

---

### Requirement 5: Upload Photos to Supabase Storage and Link to `location_images`

**User Story:** As a reporter, I want photos I take to be uploaded and linked to the report's location, so that field evidence is permanently stored and accessible to reviewers.

#### Acceptance Criteria

1. WHEN the form is submitted with one or more photos, THE Form SHALL upload each photo as a JPEG file to the `report-images` Storage_Bucket using a unique file path.
2. WHEN a photo upload succeeds, THE Form SHALL retrieve the public URL of the uploaded file from the Storage_Bucket.
3. WHEN the `sanitation_reports` insert succeeds and a `location_id` is resolved, THE Form SHALL insert one row per uploaded photo into the `location_images` table with `location_id`, `image_url`, `image_type` set to `"report"`, and `uploaded_by` set to the authenticated user's profile `id`.
4. IF a photo upload fails, THEN THE Form SHALL log the error and continue submitting the report without blocking the overall submission.
5. IF no `location_id` is resolved, THEN THE Form SHALL skip the `location_images` insert and SHALL NOT throw an error.

---

### Requirement 6: Auto-fill Reporter Phone from Profile

**User Story:** As an authenticated reporter, I want my phone number pre-filled from my profile, so that I do not have to type it manually on every submission.

#### Acceptance Criteria

1. WHEN the Form mounts and `profile.phone` is available, THE Form SHALL pre-populate the `reporter_phone` field with `profile.phone`.
2. WHILE `profile.phone` is set, THE Form SHALL allow the reporter to edit the pre-filled phone number.
3. THE Form SHALL use the value in the `reporter_phone` field (whether pre-filled or manually entered) as the `reporter_phone` value in the insert payload.

---

### Requirement 7: Use `profile.id` for `reported_by`

**User Story:** As a developer, I want `reported_by` to be set from the authenticated user's profile ID rather than a free-text input, so that the foreign key constraint to `profiles` is always satisfied.

#### Acceptance Criteria

1. THE Form SHALL set `reported_by` in the insert payload to `profile.id` from the authenticated session.
2. THE Form SHALL NOT render a free-text "Reported by" input field for the `reported_by` column.
3. IF `profile.id` is not available, THEN THE Form SHALL submit `null` for `reported_by`.

---

### Requirement 8: Preserve Existing UI and Behaviour

**User Story:** As a user, I want the form's visual design, layout, and all existing interactive sections to remain unchanged, so that the update does not disrupt my familiar workflow.

#### Acceptance Criteria

1. THE Form SHALL retain the `GeoSection`, `CameraSection`, `SectionLabel`, `ToggleRow`, `SelectInput`, `Field`, and `Divider` components without modification to their props or rendering logic.
2. THE Form SHALL retain the severity selector, anonymous toggle, health risk toggle, GPS capture, and camera capture functionality.
3. THE Form SHALL retain the cancel and success navigation logic using `DashboardViewContext` and `useRouter`.
4. THE Form SHALL retain the `reference_id` auto-generation logic on submit.
