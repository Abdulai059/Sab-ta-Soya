# Design Document: Submit Issue Form Update

## Overview

This update fixes the data-flow layer of the existing `ReportForm` page (`app/(dashboard)/reporteissue/page.js`) without touching any UI component, layout, or visual style. The changes are confined to:

1. Replacing the hardcoded `COMMUNITIES` array with a live Supabase query on mount.
2. Adding a dependent `locations` query that re-runs whenever the selected community changes.
3. Removing the non-existent `climate_event_id` column from the insert payload and replacing it with a `location_type` text field.
4. Adding an `affected_children_count` numeric field to the Incident Details section.
5. Uploading captured photos (base64 data-URLs) to the `report-images` Supabase Storage bucket and linking them to `location_images` after a successful report insert.
6. Auto-filling `reporter_phone` from `profile.phone` on mount and deriving `reported_by` from `profile.id` instead of a free-text input.

All existing sub-components (`GeoSection`, `CameraSection`, `SectionLabel`, `ToggleRow`, `SelectInput`, `Field`, `Divider`) and all navigation, severity, toggle, and GPS logic remain untouched.

---

## Architecture

The form is a single Next.js Client Component. No new pages, routes, or server actions are introduced. All data access goes through the existing `supabase` singleton from `@/lib/supabase`.

```
ReportForm (page.js)
│
├── useEffect → fetchCommunities()          [on mount]
├── useEffect → fetchLocations(communityId) [on community change]
├── useEffect → set phone from profile      [on mount]
│
├── handleSubmit()
│   ├── validate()
│   ├── uploadPhotos()   → supabase.storage.from("report-images")
│   ├── insertReport()   → supabase.from("sanitation_reports").insert()
│   └── insertImages()   → supabase.from("location_images").insert()
│
└── [all existing sub-components unchanged]
```

The form does **not** introduce a custom hook file. All new state and async logic lives inside `ReportForm` to keep the diff minimal and the component self-contained, consistent with the existing pattern in the file.

---

## Components and Interfaces

### Unchanged sub-components

`GeoSection`, `CameraSection`, `SectionLabel`, `FieldLabel`, `Field`, `SelectInput`, `ToggleRow`, `Divider` — props and rendering logic are not modified.

### `ReportForm` state additions

| State variable         | Type                        | Purpose                                              |
|------------------------|-----------------------------|------------------------------------------------------|
| `communities`          | `Array<{id, name}>`         | Rows fetched from `communities` table                |
| `communitiesLoading`   | `boolean`                   | Controls disabled state of community dropdown        |
| `locations`            | `Array<{id, name}>`         | Rows fetched from `locations` for selected community |
| `locationsLoading`     | `boolean`                   | Controls disabled state of location dropdown         |

### `form` state additions / removals

| Field              | Change   | Notes                                                  |
|--------------------|----------|--------------------------------------------------------|
| `locationType`     | Added    | Maps to `location_type` column                         |
| `affectedChildren` | Added    | Maps to `affected_children_count` column               |
| `reportedBy`       | Removed  | Replaced by `profile.id` at submit time                |
| `phone`            | Kept     | Pre-filled from `profile.phone` on mount               |

### `SelectInput` usage for community / location

The existing `SelectInput` component is reused as-is. The `options` prop is now derived from the fetched arrays (`communities.map(c => c.name)` and `locations.map(l => l.name)`). The `disabled` prop is added to `SelectInput`'s underlying `<select>` element — but since `SelectInput` already passes all props through, this requires no change to the component itself; the `disabled` attribute is passed via the wrapper `<div>` pattern already in place.

> **Note:** `SelectInput` does not currently accept a `disabled` prop. The implementation will add `disabled` to the `<select>` element inside `SelectInput` by extending its props — this is a one-line addition to the component that does not alter its visual output when not disabled.

---

## Data Models

### `communities` table (read-only)

```
id   uuid  PK
name text
```

Query: `supabase.from("communities").select("id, name").order("name")`

### `locations` table (read-only)

```
id           uuid  PK
name         text
community_id uuid  FK → communities.id
```

Query: `supabase.from("locations").select("id, name").eq("community_id", communityId).order("name")`

### `sanitation_reports` insert payload (corrected)

```js
{
  reference_id:           string,          // SR-{base36timestamp}-{random4}
  issue_type:             string,
  severity:               string,
  description:            string | null,
  health_risk:            boolean,
  reporter_phone:         string,          // from form.phone (pre-filled or edited)
  affected_people_count:  number | null,
  affected_children_count: number | null,  // NEW — was missing
  location_type:          string,          // NEW — replaces climate_event_id
  is_anonymous:           boolean,
  status:                 "pending",
  community_id:           uuid | null,
  location_id:            uuid | null,
  reported_by:            uuid | null,     // profile.id, not free text
  // climate_event_id REMOVED — column does not exist
}
```

### `report-images` Storage bucket

- Bucket name: `report-images`
- File path pattern: `reports/{referenceId}/{Date.now()}-{index}.jpg`
- Content type: `image/jpeg`
- Each photo is a base64 data-URL captured by `CameraSection`; it must be converted to a `Blob` before upload.

### `location_images` table insert (per photo)

```js
{
  location_id: uuid,       // resolved location_id from the report insert
  image_url:   string,     // public URL from storage
  image_type:  "report",
  uploaded_by: uuid,       // profile.id
}
```

Only inserted when `location_id` is non-null. Skipped silently otherwise.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: `location_type` round-trip

*For any* non-empty string entered as `location_type`, submitting the form SHALL produce an insert payload whose `location_type` field equals that exact string.

**Validates: Requirements 3.4**

---

### Property 2: `affected_children_count` integer parsing

*For any* non-negative integer string entered in the `affected_children_count` field, submitting the form SHALL produce an insert payload whose `affected_children_count` field equals `parseInt` of that string.

**Validates: Requirements 4.2**

---

### Property 3: All photos are uploaded

*For any* non-empty array of photos (1–4 base64 data-URLs), submitting the form SHALL call `supabase.storage.from("report-images").upload` exactly once per photo, each with a distinct file path.

**Validates: Requirements 5.1**

---

### Property 4: One `location_images` row per photo when location is resolved

*For any* non-empty array of successfully uploaded photos and a resolved `location_id`, submitting the form SHALL insert exactly one row into `location_images` per photo, each containing the correct `location_id`, `image_url`, `image_type: "report"`, and `uploaded_by`.

**Validates: Requirements 5.3**

---

### Property 5: Phone field round-trip

*For any* phone string (whether pre-filled from `profile.phone` or typed manually), submitting the form SHALL produce an insert payload whose `reporter_phone` field equals that exact string.

**Validates: Requirements 6.3**

---

### Property 6: `reported_by` equals `profile.id`

*For any* authenticated profile with a non-null `id`, submitting the form SHALL produce an insert payload whose `reported_by` field equals `profile.id`.

**Validates: Requirements 7.1**

---

### Property 7: `reference_id` uniqueness and format

*For any* two independent form submissions, each SHALL produce a `reference_id` that (a) matches the pattern `/^SR-[A-Z0-9]+-[A-Z0-9]{4}$/` and (b) is distinct from all other generated IDs.

**Validates: Requirements 8.4**

---

## Error Handling

| Scenario                              | Behaviour                                                                                  |
|---------------------------------------|--------------------------------------------------------------------------------------------|
| `communities` fetch error             | `toast.error("Failed to load communities")`, dropdown left empty, submit still possible    |
| `locations` fetch error               | `toast.error("Failed to load locations")`, dropdown left empty                             |
| `location_type` empty on submit       | `toast.error("Please enter a location type")`, submit aborted                              |
| `affected_children_count` negative    | `toast.error("Affected children count cannot be negative")`, submit aborted                |
| Photo upload failure (individual)     | `console.error(err)`, photo skipped, submission continues                                  |
| `sanitation_reports` insert error     | `toast.error("Failed to submit report. Please try again.")`, `setSubmitting(false)`        |
| `location_images` insert error        | `console.error(err)`, silently skipped — does not block report submission                  |
| `profile.phone` unavailable on mount  | Phone field left blank, user must enter manually                                           |
| `profile.id` unavailable on submit    | `reported_by` set to `null`                                                                |

All existing error handling for GPS, camera, and form validation is preserved unchanged.

---

## Testing Strategy

### Unit / Example-based tests (Vitest + @testing-library/react)

The project already has Vitest and `@testing-library/react` installed. Tests live in a `__tests__` directory co-located with the page or in a top-level `tests/` folder.

Key example tests:

- **Community loading state**: mock `supabase.from("communities").select()` to hang; assert dropdown is disabled with "Loading communities…" placeholder.
- **Community error state**: mock to return `{ error: { message: "DB error" } }`; assert `toast.error` called, dropdown empty.
- **Location cascade**: select community → mock locations fetch → assert location dropdown populated; change community → assert location cleared and re-fetched.
- **`climate_event_id` absent**: submit valid form; assert insert payload has no `climate_event_id` key.
- **`location_type` validation**: submit with empty `location_type`; assert `toast.error` called, insert not called.
- **`affected_children_count` null on blank**: submit with blank field; assert payload has `null`.
- **`affected_children_count` negative validation**: submit with `-1`; assert `toast.error` called.
- **Photo upload skipped on no location_id**: submit with photos but no location selected; assert `location_images` insert not called.
- **`reported_by` free-text input absent**: render form; assert no input labelled "Reported by" is present.
- **`reported_by` null when no profile**: render with `profile = null`; submit; assert payload `reported_by` is `null`.
- **Phone pre-fill**: render with `profile.phone = "+233501234567"`; assert phone input value equals that string.
- **Cancel navigation**: click Cancel; assert `router.push("/reports")` or `dashCtx.goBack()` called.

### Property-based tests (Vitest + fast-check)

`fast-check` is not yet installed. Add it as a dev dependency:

```bash
npm install --save-dev fast-check@3.22.0
```

Each property test runs a minimum of **100 iterations** (fast-check default is 100).

Tag format used in test comments: `Feature: submit-issue-form-update, Property {N}: {property_text}`

**Property 1 — `location_type` round-trip**
```
// Feature: submit-issue-form-update, Property 1: location_type round-trip
fc.assert(fc.property(
  fc.string({ minLength: 1 }),
  async (locationType) => {
    // render form, fill location_type, submit, capture insert call args
    // assert args.location_type === locationType
  }
))
```

**Property 2 — `affected_children_count` integer parsing**
```
// Feature: submit-issue-form-update, Property 2: affected_children_count integer parsing
fc.assert(fc.property(
  fc.integer({ min: 0, max: 10000 }),
  async (count) => {
    // render form, set affected_children_count to String(count), submit
    // assert args.affected_children_count === count
  }
))
```

**Property 3 — All photos uploaded**
```
// Feature: submit-issue-form-update, Property 3: all photos are uploaded
fc.assert(fc.property(
  fc.array(fc.constant("data:image/jpeg;base64,/9j/..."), { minLength: 1, maxLength: 4 }),
  async (photos) => {
    // render form with photos in state, submit
    // assert upload called photos.length times with distinct paths
  }
))
```

**Property 4 — One `location_images` row per photo**
```
// Feature: submit-issue-form-update, Property 4: one location_images row per photo
fc.assert(fc.property(
  fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 4 }),
  fc.uuid(),
  async (photoUrls, locationId) => {
    // mock upload to return photoUrls, mock report insert to return locationId
    // assert location_images insert called with photoUrls.length rows
  }
))
```

**Property 5 — Phone field round-trip**
```
// Feature: submit-issue-form-update, Property 5: phone field round-trip
fc.assert(fc.property(
  fc.string({ minLength: 1 }),
  async (phone) => {
    // render form, set phone field to phone, submit
    // assert args.reporter_phone === phone
  }
))
```

**Property 6 — `reported_by` equals `profile.id`**
```
// Feature: submit-issue-form-update, Property 6: reported_by equals profile.id
fc.assert(fc.property(
  fc.uuid(),
  async (profileId) => {
    // render form with profile.id = profileId, submit
    // assert args.reported_by === profileId
  }
))
```

**Property 7 — `reference_id` uniqueness and format**
```
// Feature: submit-issue-form-update, Property 7: reference_id uniqueness and format
fc.assert(fc.property(
  fc.integer({ min: 2, max: 20 }),
  (n) => {
    const ids = Array.from({ length: n }, generateReferenceId);
    const pattern = /^SR-[A-Z0-9]+-[A-Z0-9]{4}$/;
    return ids.every(id => pattern.test(id)) && new Set(ids).size === ids.length;
  }
))
```

### Integration tests

Not required for this update. All Supabase interactions are tested via mocks in unit/property tests. End-to-end verification is done manually against the staging Supabase project.
