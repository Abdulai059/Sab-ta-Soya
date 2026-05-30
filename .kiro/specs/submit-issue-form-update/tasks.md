# Implementation Plan: Submit Issue Form Update

## Overview

All changes are confined to `app/(dashboard)/reporteissue/page.js` and the `SelectInput` sub-component within it. The plan follows the six task areas in order: add `disabled` prop support to `SelectInput`, fetch communities on mount, fetch locations on community change, fix the insert payload, add photo upload + `location_images` insert, and auto-fill phone from profile.

## Tasks

- [ ] 1. Add `disabled` prop to `SelectInput`
  - Extend the `SelectInput` function signature to accept a `disabled` prop
  - Pass `disabled` to the underlying `<select>` element
  - Add `disabled:opacity-50 disabled:cursor-not-allowed` to the select's className so the UI reflects the disabled state
  - _Requirements: 1.2, 2.3_

- [ ] 2. Fetch communities from DB on mount
  - [ ] 2.1 Add `communities` and `communitiesLoading` state variables
    - `communities` initialises to `[]`; `communitiesLoading` initialises to `true`
    - _Requirements: 1.1, 1.2_

  - [ ] 2.2 Implement `fetchCommunities` and wire it to a mount `useEffect`
    - Query `supabase.from("communities").select("id, name").order("name")`
    - On success set `communities` to the returned rows; on error call `toast.error("Failed to load communities")`
    - Always set `communitiesLoading` to `false` in a `finally` block
    - Replace the hardcoded `COMMUNITIES` constant usage in the community `SelectInput` with `communities.map(c => c.name)`
    - Pass `disabled={communitiesLoading}` and `placeholder={communitiesLoading ? "Loading communities…" : "Select community…"}` to the community `SelectInput`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.3 Write property test for `reference_id` uniqueness and format
    - **Property 7: `reference_id` uniqueness and format**
    - **Validates: Requirements 8.4**
    - Install `fast-check@3.22.0` as a dev dependency if not present
    - Generate `n` IDs (n drawn from `fc.integer({ min: 2, max: 20 })`), assert each matches `/^SR-[A-Z0-9]+-[A-Z0-9]{4}$/` and all are distinct

- [ ] 3. Fetch locations from DB on community change
  - [ ] 3.1 Add `locations` and `locationsLoading` state variables
    - `locations` initialises to `[]`; `locationsLoading` initialises to `false`
    - _Requirements: 2.1, 2.3_

  - [ ] 3.2 Implement `fetchLocations` and wire it to a `useEffect` that depends on `form.community`
    - When `form.community` changes, clear `form.location` (call `set("location")("")`) and reset `locations` to `[]`
    - Resolve the selected community's `id` from the `communities` array already in state (no extra DB call)
    - Query `supabase.from("locations").select("id, name").eq("community_id", communityId).order("name")`
    - On success set `locations` to the returned rows; on error call `toast.error("Failed to load locations")`
    - Always set `locationsLoading` to `false` in a `finally` block
    - Replace the hardcoded location options in the location `SelectInput` with `locations.map(l => l.name)`
    - Pass `disabled={locationsLoading}` and `placeholder={locationsLoading ? "Loading locations…" : "Select location…"}` to the location `SelectInput`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Fix insert payload
  - [ ] 4.1 Add `locationType` and `affectedChildren` to form state; remove `reportedBy`
    - Add `locationType: ""` and `affectedChildren: ""` to the initial `form` object
    - Remove `reportedBy` from the initial `form` object
    - _Requirements: 3.2, 3.4, 4.1, 7.2_

  - [ ] 4.2 Add `location_type` text input to the Incident Details section
    - Render a `<Field label="Location type" required>` with a plain text `<input>` bound to `form.locationType`
    - Place it in the Incident Details grid alongside the existing fields
    - _Requirements: 3.2_

  - [ ] 4.3 Add `affected_children_count` numeric input to the Incident Details section
    - Render a `<Field label="Children affected">` with a numeric `<input>` bound to `form.affectedChildren`
    - Place it in the Incident Details grid
    - _Requirements: 4.1_

  - [ ] 4.4 Remove the free-text "Reported by" input from the Reporter section
    - Delete the `<Field label="Reported by (optional)">` block and its `<input>` from the JSX
    - _Requirements: 7.2_

  - [ ] 4.5 Update `handleSubmit` with corrected payload and new validations
    - Add validation: if `form.locationType` is empty, call `toast.error("Please enter a location type")` and return
    - Add validation: if `form.affectedChildren` is non-empty and `parseInt(form.affectedChildren) < 0`, call `toast.error("Affected children count cannot be negative")` and return
    - Remove the `climate_events` lookup block entirely
    - Remove `climate_event_id` from the insert object
    - Add `location_type: form.locationType` to the insert object
    - Add `affected_children_count: form.affectedChildren ? parseInt(form.affectedChildren) : null` to the insert object
    - Change `reported_by` to use `profile?.id || null` (already correct, but ensure `reportedBy` free-text is gone)
    - Keep the community/location ID resolution logic that is already present
    - _Requirements: 3.1, 3.3, 3.4, 4.2, 4.3, 7.1, 7.3_

  - [ ]* 4.6 Write property test for `location_type` round-trip
    - **Property 1: `location_type` round-trip**
    - **Validates: Requirements 3.4**
    - Use `fc.string({ minLength: 1 })` to generate arbitrary location type strings; render form, fill field, submit, assert insert payload `location_type` equals the generated string

  - [ ]* 4.7 Write property test for `affected_children_count` integer parsing
    - **Property 2: `affected_children_count` integer parsing**
    - **Validates: Requirements 4.2**
    - Use `fc.integer({ min: 0, max: 10000 })`; render form, set field to `String(count)`, submit, assert payload `affected_children_count === count`

  - [ ]* 4.8 Write property test for `reported_by` equals `profile.id`
    - **Property 6: `reported_by` equals `profile.id`**
    - **Validates: Requirements 7.1**
    - Use `fc.uuid()` to generate profile IDs; render form with that profile, submit, assert payload `reported_by === profileId`

- [ ] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Add photo upload to Supabase Storage and `location_images` insert
  - [ ] 6.1 Implement `uploadPhotos` helper inside `handleSubmit`
    - For each base64 data-URL in `photos`, convert it to a `Blob` (`fetch(dataUrl).then(r => r.blob())`)
    - Upload to `supabase.storage.from("report-images")` with path `reports/{referenceId}/{Date.now()}-{index}.jpg` and `contentType: "image/jpeg"`
    - On upload success, retrieve the public URL via `supabase.storage.from("report-images").getPublicUrl(path).data.publicUrl`
    - On upload failure, log the error with `console.error` and skip that photo; do not abort submission
    - Collect all successfully uploaded public URLs into an array
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 6.2 Insert rows into `location_images` after a successful report insert
    - After the `sanitation_reports` insert succeeds, check if `locationId` is non-null and `uploadedUrls` is non-empty
    - If both conditions are met, call `supabase.from("location_images").insert(rows)` where each row has `location_id`, `image_url`, `image_type: "report"`, `uploaded_by: profile?.id`
    - On insert error, log with `console.error` and do not rethrow — report submission is already complete
    - If `locationId` is null, skip the insert silently
    - _Requirements: 5.3, 5.5_

  - [ ]* 6.3 Write property test for all photos uploaded
    - **Property 3: All photos are uploaded**
    - **Validates: Requirements 5.1**
    - Use `fc.array(fc.constant("data:image/jpeg;base64,/9j/4AAQ"), { minLength: 1, maxLength: 4 })`; mock `supabase.storage.upload`; submit form; assert upload called exactly `photos.length` times with distinct paths

  - [ ]* 6.4 Write property test for one `location_images` row per photo
    - **Property 4: One `location_images` row per photo when location is resolved**
    - **Validates: Requirements 5.3**
    - Use `fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 4 })` for photo URLs and `fc.uuid()` for `locationId`; mock upload to return those URLs; assert `location_images` insert called with exactly that many rows

- [ ] 7. Auto-fill phone from profile
  - [ ] 7.1 Add a mount `useEffect` that pre-fills `form.phone` from `profile.phone`
    - When `profile?.phone` is truthy, call `set("phone")(profile.phone)`
    - Run only once on mount (dependency array: `[profile]`)
    - If `profile.phone` is absent, leave the field blank
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 7.2 Write property test for phone field round-trip
    - **Property 5: Phone field round-trip**
    - **Validates: Requirements 6.3**
    - Use `fc.string({ minLength: 1 })`; render form, set phone field to generated string, submit, assert payload `reporter_phone` equals that string

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All changes are confined to `app/(dashboard)/reporteissue/page.js` (and the `SelectInput` sub-component defined within it)
- No new files, routes, or server actions are introduced
- `fast-check@3.22.0` must be installed as a dev dependency before running property tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "4.3", "4.4"] },
    { "id": 3, "tasks": ["4.5", "6.1"] },
    { "id": 4, "tasks": ["6.2", "2.3", "4.6", "4.7", "4.8", "7.2"] },
    { "id": 5, "tasks": ["6.3", "6.4"] }
  ]
}
```
