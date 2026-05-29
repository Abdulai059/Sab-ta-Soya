# Implementation Plan: community-location-suggest-create

## Overview

Implement the suggest-and-create pattern for community and location fields in the ReportForm. This involves a DB migration, a reusable `SuggestCombobox` component, two new hooks, targeted changes to `ReportForm`, and a new Pending Suggestions section in the admin panel. All new hooks follow the existing TanStack Query pattern established by `useUserManagement`.

## Tasks

- [ ] 1. DB migration — add `is_user_suggested` to communities
  - [ ] 1.1 Create migration SQL file
    - Create `supabase/migrations/add_is_user_suggested_to_communities.sql`
    - Add `ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_user_suggested boolean NOT NULL DEFAULT false;`
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Install fast-check and configure Vitest
  - [ ] 2.1 Add fast-check dev dependency and verify Vitest config
    - Run `npm install --save-dev fast-check@3`
    - Confirm `vitest.config.js` (or equivalent) is set up with jsdom environment and `@testing-library/react`
    - Create `vitest.config.js` if it does not exist, pointing to jsdom and including `@vitejs/plugin-react`
    - _Requirements: (testing infrastructure for all property tests)_

- [ ] 3. Implement `SuggestCombobox` component
  - [ ] 3.1 Create `components/ui/SuggestCombobox.js` with core structure
    - Implement controlled input with `inputValue`, `isOpen`, `showInlineForm`, `inlineFields`, `creating` internal state
    - Render text input with `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`
    - Render dropdown list with `role="listbox"` and each option with `role="option"`
    - Wire `useOutsideClick` hook (already in `hooks/useOutsideClick.js`) to close dropdown on outside click
    - Apply `disabled` and `loading` prop behaviour (disabled input, loading placeholder)
    - _Requirements: 2.1, 2.3, 4.1, 4.4, 4.6_

  - [ ] 3.2 Implement filtering, "Add new" option, and item selection
    - Filter items client-side: `item.name.toLowerCase().includes(inputValue.toLowerCase())`
    - Append "Add '[inputValue]' as new [entityLabel]" option when filtered results are empty and `inputValue.trim()` is non-empty
    - Selecting a real item calls `onChange({id, name})` and closes dropdown
    - Clearing input (backspace to empty) calls `onChange(null)`
    - Keyboard navigation: arrow keys move focus, Enter selects focused option
    - _Requirements: 2.2, 2.4, 2.5, 3.1, 4.3, 5.1_

  - [ ] 3.3 Implement inline create form
    - Show inline form when "Add new" option is selected (hides dropdown)
    - Render `createFields` as labelled text inputs
    - "Confirm" button calls `onCreateNew(inputValue, inlineFields)`, sets `creating=true` while pending
    - On `onCreateNew` success: call `onChange` with returned `{id, name}`, close form, clear `inputValue`
    - On `onCreateNew` failure: set `creating=false`, keep form open (do not call `onChange`)
    - "Cancel" button clears `inputValue` and hides form
    - _Requirements: 3.2, 3.4, 3.5, 3.6, 5.2, 5.4, 5.5, 5.6_

  - [ ]* 3.4 Write property test for filtering (Property 1)
    - **Property 1: Combobox filtering is case-insensitive and exact**
    - **Validates: Requirements 2.2, 4.3**
    - Use `fc.array(fc.record({id: fc.uuid(), name: fc.string()}))` and `fc.string()` as arbitraries
    - Assert result contains exactly those items whose `name` contains the query (case-insensitive)
    - File: `components/ui/__tests__/SuggestCombobox.test.js`

  - [ ]* 3.5 Write property test for "Add new" visibility (Property 2)
    - **Property 2: "Add new" option appears if and only if no items match**
    - **Validates: Requirements 3.1, 5.1**
    - Use same item array + non-empty query string arbitraries
    - Assert `showAddNew === (filteredItems.length === 0)`
    - File: `components/ui/__tests__/SuggestCombobox.test.js`

  - [ ]* 3.6 Write property test for onChange payload (Property 3)
    - **Property 3: Selecting any item calls onChange with that item's exact id and name**
    - **Validates: Requirements 2.5**
    - Use `fc.array(fc.record({id: fc.uuid(), name: fc.string()}), {minLength: 1})` and pick a random index
    - Simulate click on item, assert `onChange` called with `{id: items[i].id, name: items[i].name}`
    - File: `components/ui/__tests__/SuggestCombobox.test.js`

  - [ ]* 3.7 Write unit tests for SuggestCombobox
    - Test `loading=true` → input disabled, loading placeholder shown
    - Test `disabled=true` → input disabled
    - Test selecting "Add new" → inline form appears with correct `createFields`
    - Test confirming inline form with mock `onCreateNew` success → `onChange` called, form closes
    - Test confirming inline form with mock `onCreateNew` failure → form stays open, `onChange` not called
    - Test cancelling inline form → form closes, input cleared
    - File: `components/ui/__tests__/SuggestCombobox.test.js`

- [ ] 4. Checkpoint — SuggestCombobox complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement `usePendingSuggestions` hook
  - [ ] 5.1 Create `hooks/usePendingSuggestions.js`
    - Use `useQuery` with query key `["pending-suggestions"]`
    - Fetch `communities` where `is_user_suggested = true`, select `id, name, district, region, created_at`
    - Fetch `locations` where `status = 'pending_review'`, select `id, name, type, area_name, landmark, created_by, created_at, community:communities(name)`
    - Run both queries in parallel via `Promise.all`
    - Return `{ pendingCommunities, pendingLocations, totalCount, loading }`
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 9.1_

  - [ ]* 5.2 Write property test for badge count (Property 8)
    - **Property 8: Pending badge count equals sum of pending communities and locations**
    - **Validates: Requirements 7.1, 7.2**
    - Use `fc.nat()` for community count and `fc.nat()` for location count as arbitraries
    - Render badge component with those counts, assert displayed number equals `c + l`
    - File: `hooks/__tests__/usePendingSuggestions.test.js`

  - [ ]* 5.3 Write property test for pending list display fields (Property 11)
    - **Property 11: Pending list rows contain all required display fields**
    - **Validates: Requirements 8.1, 9.1**
    - Use `fc.record({id: fc.uuid(), name: fc.string(), district: fc.string(), region: fc.string(), created_at: fc.date().map(d => d.toISOString())})` for community rows
    - Render community row, assert `name`, `district`, `region`, and `created_at` are all present in output
    - File: `hooks/__tests__/usePendingSuggestions.test.js`

- [ ] 6. Implement `useSuggestionActions` hook
  - [ ] 6.1 Create `hooks/useSuggestionActions.js`
    - Implement `approveCommunity(id)`: `UPDATE communities SET is_user_suggested = false WHERE id = id`
    - Implement `rejectCommunity(id)`: `DELETE FROM communities WHERE id = id`
    - Implement `approveLocation(id)`: `UPDATE locations SET status = 'operational' WHERE id = id`
    - Implement `rejectLocation(id)`: `DELETE FROM locations WHERE id = id`
    - Each action uses `useMutation` with optimistic update (remove item from pending list immediately)
    - On error: roll back optimistic update, show `toast.error`
    - On success: show `toast.success`, invalidate `["pending-suggestions"]` query
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 6.2 Write property test for approve mutations (Property 9)
    - **Property 9: Approve community sets `is_user_suggested = false`; approve location sets `status = 'operational'`**
    - **Validates: Requirements 8.2, 9.2**
    - Use `fc.uuid()` for id as arbitrary
    - Mock Supabase update, call `approveCommunity(id)`, assert update called with `{is_user_suggested: false}` and correct id
    - Repeat for `approveLocation(id)` → `{status: 'operational'}`
    - File: `hooks/__tests__/useSuggestionActions.test.js`

  - [ ]* 6.3 Write property test for reject removes from list (Property 10)
    - **Property 10: Reject removes the item from the pending list**
    - **Validates: Requirements 8.3, 8.5, 9.3, 9.4**
    - Use `fc.array(fc.record({id: fc.uuid(), name: fc.string()}), {minLength: 1})` as arbitrary
    - Pick random item, call reject, assert item no longer in list and count decreased by 1
    - File: `hooks/__tests__/useSuggestionActions.test.js`

  - [ ]* 6.4 Write unit tests for useSuggestionActions
    - Test approve failure → `toast.error` shown, item remains in list
    - Test reject failure → `toast.error` shown, item remains in list
    - File: `hooks/__tests__/useSuggestionActions.test.js`

- [ ] 7. Checkpoint — hooks complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Update `ReportForm` state shape and wire `SuggestCombobox`
  - [ ] 8.1 Refactor state shape in `app/(dashboard)/reporteissue/page.js`
    - Remove `community` and `location` keys from the `form` useState object
    - Add `const [selectedCommunity, setSelectedCommunity] = useState(null)` outside `form`
    - Add `const [selectedLocation, setSelectedLocation] = useState(null)` outside `form`
    - Add `const [communityQuery, setCommunityQuery] = useState("")` and `const [locationQuery, setLocationQuery] = useState("")` for search
    - Update community fetch to filter by `communityQuery` (debounced or on change)
    - Update location fetch to filter by `locationQuery` and depend on `selectedCommunity?.id` instead of `form.community`
    - _Requirements: 2.1, 4.1, 4.2, 4.5, 6.1, 6.2_

  - [ ] 8.2 Replace community `SelectInput` with `SuggestCombobox`
    - Import `SuggestCombobox` from `@/components/ui/SuggestCombobox`
    - Wire `items`, `value={selectedCommunity}`, `onChange`, `onSearch={setCommunityQuery}`, `loading`, `placeholder`, `entityLabel="community"`, `createFields` (district, region), and `onCreateNew` as specified in the design
    - `onChange` handler: call `setSelectedCommunity(item)` and `setSelectedLocation(null)` to clear location on community change
    - `onCreateNew`: insert into `communities` with `is_user_suggested: true`, return `{id, name}`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 8.3 Replace location `SelectInput` with `SuggestCombobox`
    - Wire `items`, `value={selectedLocation}`, `onChange={setSelectedLocation}`, `onSearch={setLocationQuery}`, `loading`, `disabled={!selectedCommunity}`, `placeholder`, `entityLabel="location"`, `createFields` (area_name, landmark), and `onCreateNew` as specified in the design
    - `onCreateNew`: guard `!form.locationType` → `toast.error` + throw; insert into `locations` with `status: 'pending_review'`, `created_by: profile.id`, `community_id: selectedCommunity.id`, GPS coords from `geoData`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 8.4 Update `handleSubmit` validation and payload
    - Change `if (!form.community)` → `if (!selectedCommunity)`
    - Replace name→id lookup with `communityId = selectedCommunity.id`
    - Replace name→id lookup with `locationId = selectedLocation?.id ?? null`
    - Remove now-unused `communities.find` and `locations.find` lookup calls
    - _Requirements: 6.1, 6.2_

  - [ ]* 8.5 Write property test for community insert payload (Property 4)
    - **Property 4: Community insert payload always includes `is_user_suggested = true`**
    - **Validates: Requirements 3.3**
    - Use `fc.string()` for name, `fc.option(fc.string())` for district/region as arbitraries
    - Mock Supabase insert, call `onCreateNew`, assert payload has `is_user_suggested: true` and null coercion for blank strings
    - File: `app/(dashboard)/reporteissue/__tests__/ReportForm.suggest.test.js`

  - [ ]* 8.6 Write property test for location insert payload (Property 5)
    - **Property 5: Location insert payload always includes `status = 'pending_review'` and `created_by = profile.id`**
    - **Validates: Requirements 5.3**
    - Use `fc.string()` for name, `fc.option(fc.record({lat: fc.float(), lng: fc.float()}))` for geoData as arbitraries
    - Mock Supabase insert, assert `status: 'pending_review'` and `created_by: profile.id` always present
    - File: `app/(dashboard)/reporteissue/__tests__/ReportForm.suggest.test.js`

  - [ ]* 8.7 Write property test for locationType guard (Property 6)
    - **Property 6: Location creation is blocked when `locationType` is empty**
    - **Validates: Requirements 5.7**
    - Use `fc.string()` for name and any extra fields as arbitraries
    - Set `locationType = ""`, call `onCreateNew`, assert Supabase insert is never called
    - File: `app/(dashboard)/reporteissue/__tests__/ReportForm.suggest.test.js`

  - [ ]* 8.8 Write property test for submit payload ids (Property 7)
    - **Property 7: Submit payload uses selected community and location ids directly**
    - **Validates: Requirements 6.2**
    - Use `fc.record({id: fc.uuid(), name: fc.string()})` for community and location as arbitraries
    - Mock Supabase insert, call `handleSubmit`, assert `community_id === selectedCommunity.id` and `location_id === selectedLocation.id`
    - File: `app/(dashboard)/reporteissue/__tests__/ReportForm.suggest.test.js`

  - [ ]* 8.9 Write unit tests for ReportForm suggest behaviour
    - Test submit with missing community → toast "Please select a community"
    - Test submit with missing issueType, severity, phone, locationType → correct toast per field
    - File: `app/(dashboard)/reporteissue/__tests__/ReportForm.suggest.test.js`

- [ ] 9. Checkpoint — ReportForm wiring complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Add Pending Suggestions section to admin panel
  - [ ] 10.1 Create `components/admin/PendingSuggestions.js` component
    - Accept `pendingCommunities`, `pendingLocations`, `totalCount`, `loading`, and action callbacks as props
    - Render section header with "Pending Suggestions" title and badge showing `totalCount` (dash `—` while loading)
    - Render "Communities (N)" sub-section: table/list rows showing `name`, `district`, `region`, `created_at` with Approve and Reject buttons per row
    - Render "Locations (N)" sub-section: table/list rows showing `name`, `type`, `area_name`, `landmark`, parent community name, `created_by` with Approve and Reject buttons per row
    - Show loading indicator while `loading` is true
    - Show error message if query is in error state
    - _Requirements: 7.2, 7.3, 7.4, 8.1, 9.1_

  - [ ] 10.2 Wire confirmation dialog for community rejection with associated locations
    - Before calling `rejectCommunity`, check if the community has associated location rows (from `pendingLocations` list or a count query)
    - If associated locations exist, show a confirmation dialog warning the admin that associated locations will also be affected
    - Proceed with delete only after confirmation
    - _Requirements: 8.4_

  - [ ] 10.3 Integrate `PendingSuggestions` into `app/(dashboard)/admin/page.js`
    - Import `usePendingSuggestions` and `useSuggestionActions` hooks
    - Import `PendingSuggestions` component
    - Add `PendingSuggestions` section below the existing User Management section, guarded by `canViewUsers` (same admin permission check)
    - Pass hook data and action callbacks as props
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.2, 8.3, 8.4, 8.5, 8.6, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 10.4 Write unit tests for admin panel suggestions section
    - Test admin panel renders loading indicator while `usePendingSuggestions` is loading
    - Test admin panel shows confirmation dialog when rejecting community with associated locations
    - Test badge shows `—` while loading, correct count when loaded, `0` when no pending items
    - File: `app/(dashboard)/admin/__tests__/AdminPanel.suggestions.test.js`

- [ ] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- `fast-check@3` must be installed before running property tests (`npm install --save-dev fast-check@3`)
- Each property test references the design document property number for traceability
- The `useOutsideClick` hook at `hooks/useOutsideClick.js` is already available — use it in `SuggestCombobox`
- Community rejection cascade behaviour depends on the FK constraint definition in Supabase; verify `ON DELETE CASCADE` or implement a two-step delete (locations first, then community) during task 10.2
- All hooks follow the TanStack Query pattern established by `useUserManagement` in `components/admin/useUserManagement.js`
- The `supabase/migrations/` directory may need to be created if it does not exist

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3"] },
    { "id": 3, "tasks": ["3.4", "3.5", "3.6", "3.7", "5.1", "6.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.2", "6.3", "6.4", "8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3"] },
    { "id": 6, "tasks": ["8.4", "8.5", "8.6", "8.7", "8.8", "8.9", "10.1"] },
    { "id": 7, "tasks": ["10.2"] },
    { "id": 8, "tasks": ["10.3", "10.4"] }
  ]
}
```
