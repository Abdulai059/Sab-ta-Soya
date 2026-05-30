# Implementation Plan: Analytics Data Correctness

## Overview

Fix nine data-correctness bugs across four files. All changes are pure logic and label fixes — no new dependencies, no schema changes, no new components (except adding an optional `subtitle` prop to `MetricCard`). Tasks follow the data pipeline order: hook → page → components.

## Tasks

- [x] 1. Fix `useDashboardData.js` — active status filters and terminal status for avg response
  - [x] 1.1 Replace `isPending` with `isActive` filter in `buildMetrics`
    - Add `ACTIVE_STATUSES = ["pending", "assigned", "in_progress"]` constant
    - Add `isActive = (r) => ACTIVE_STATUSES.includes(normalizeStatus(r))` predicate
    - Change `open` computation from `reports.filter(isPending).length` to `reports.filter(isActive).length`
    - Change `openSinceYesterday` filter from `isPending(r)` to `isActive(r)`
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 1.2 Write property test for active status filter correctness
    - **Property 1: Active status filter correctness**
    - Generate arbitrary arrays of reports with status drawn from all six known statuses
    - Assert `metrics.open` equals count of reports with status in `{pending, assigned, in_progress}`
    - Assert `metrics.openSinceYesterday` equals count of those same active reports with `created_at >= yesterday`
    - **Validates: Requirements 1.1, 1.2**

  - [x] 1.3 Replace `isDone` with `isTerminal` filter in `avgResponseHours` computation
    - Add `TERMINAL_STATUSES = ["disposed", "verified", "cancelled"]` constant
    - Add `isTerminal = (r) => TERMINAL_STATUSES.includes(normalizeStatus(r))` predicate
    - Change `responseTimes` filter from `reports.filter(isDone)` to `reports.filter(isTerminal)`
    - Keep the existing `h > 0` guard (excludes rows where `updated_at <= created_at`)
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 1.4 Write property test for avgResponseHours terminal status inclusion
    - **Property 6: avgResponseHours includes all terminal statuses with valid timestamps**
    - Generate arrays of reports with status in `{disposed, verified, cancelled}` and arbitrary `created_at`/`updated_at` dates
    - Assert all three terminal statuses contribute to the average
    - Assert reports where `updated_at <= created_at` are excluded
    - **Validates: Requirements 7.1, 7.2**

  - [x] 1.5 Change `fetchRecentReports` limit from `2` to `10`
    - In `fetchRecentReports`, change `.limit(2)` to `.limit(10)`
    - _Requirements: 5.1, 5.2_

  - [x] 1.6 Add `windowDays` parameter to `useDashboardData` and `fetchDashboard`
    - Change `export function useDashboardData()` to `export function useDashboardData(windowDays = 30)`
    - Change `async function fetchDashboard()` to `async function fetchDashboard(windowDays)`
    - Replace `const thirtyDaysAgo = daysAgo(30)` with `const windowStart = daysAgo(windowDays)`
    - Pass `windowStart` to `fetchReports` instead of `thirtyDaysAgo`
    - Pass `windowDays` through to `queryFn: () => fetchDashboard(windowDays)`
    - Add `windowDays` to the returned object from `fetchDashboard` so the page can read it
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ]* 1.7 Write property test for windowDays fetch window
    - **Property 5: windowDays controls fetch window and subtitle**
    - Generate arbitrary positive integers for `windowDays` (1–365)
    - Assert the `since` date passed to `fetchReports` equals exactly `windowDays` days before now
    - **Validates: Requirements 6.1, 6.2**

- [x] 2. Checkpoint — verify hook changes compile and existing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Fix `analytics/page.js` — STATUS_MAP, assessmentAvgPct, donut values, and MetricCard subtitles
  - [x] 3.1 Replace hardcoded `STATUS_MAP` with `STATUS_CONFIG`-derived `sprsData`
    - Remove the `STATUS_MAP` constant from the file
    - Add `import { STATUS_CONFIG } from "@/components/admin/constants"`
    - Replace the `sprsData` derivation with:
      ```js
      const sprsData = STATUS_CONFIG.map((s) => ({
        name:  s.label,
        value: getSnapCount(s.keys[0]),
        color: s.color,
      }));
      ```
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 3.2 Write property test for sprsData mirrors STATUS_CONFIG
    - **Property 4: sprsData mirrors STATUS_CONFIG**
    - Generate arbitrary arrays of report statuses drawn from all six known keys
    - Assert `sprsData.length === STATUS_CONFIG.length`
    - Assert each entry's `name` equals `STATUS_CONFIG[i].label` and `color` equals `STATUS_CONFIG[i].color`
    - Assert zero-count statuses appear with `value: 0`
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x] 3.3 Fix `assessmentAvgPct` formula — remove redundant outer `total > 0` guard
    - Change:
      ```js
      const assessmentAvgPct = metrics.total > 0
        ? Math.round((metrics.resolvedInLastWeek / Math.max(metrics.totalInLastWeek, 1)) * 100)
        : 0;
      ```
      to:
      ```js
      const assessmentAvgPct = Math.round(
        (metrics.resolvedInLastWeek / Math.max(metrics.totalInLastWeek, 1)) * 100
      );
      ```
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ]* 3.4 Write property test for weekly rate formula
    - **Property 3: Weekly rate formula**
    - Generate arbitrary non-negative integers for `resolvedInLastWeek` and `totalInLastWeek`
    - Assert result equals `Math.round((resolvedInLastWeek / Math.max(totalInLastWeek, 1)) * 100)`
    - Assert result is `0` when `totalInLastWeek` is `0` (no division-by-zero)
    - **Validates: Requirements 3.2, 3.4**

  - [x] 3.5 Pass raw counts to `widgetData.donut` instead of pre-computed percentages
    - Change the `donut` mapping in `widgetData` from:
      ```js
      value: Math.round((r.value / riskTotal) * 100),
      ```
      to:
      ```js
      value: r.value,
      ```
    - Remove the `riskTotal` variable if it is no longer used elsewhere
    - _Requirements: 8.4_

  - [x] 3.6 Destructure `windowDays` from `useDashboardData` and pass `subtitle` to MetricCards
    - Add `windowDays` to the destructured return from `useDashboardData()`
    - Add `subtitle={`Last ${windowDays} days`}` prop to the "Total reports" `MetricCard`
    - Add `subtitle={`Last ${windowDays} days`}` prop to the "Open incidents" `MetricCard`
    - _Requirements: 6.1, 6.4_

  - [ ]* 3.7 Write property test for score percentage formula
    - **Property 2: Score percentage formula**
    - Generate arbitrary non-negative integers where `resolved <= total`
    - Assert `scorePct === Math.round((resolved / total) * 100)`
    - Assert `scorePct === 0` when `total === 0`
    - **Validates: Requirements 2.1, 2.3**

- [x] 4. Add `subtitle` prop to `MetricCard.js`
  - [x] 4.1 Add optional `subtitle` prop rendering to `MetricCard`
    - Add `subtitle` to the destructured props: `{ …, subtitle }`
    - Insert `{subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}` immediately after the `value` paragraph and before the `delta` paragraph
    - _Requirements: 6.1_

- [x] 5. Fix `Securitychart.js` — rename "ASSESSMENT AVG" label to "WEEKLY RATE"
  - [x] 5.1 Rename the dashed marker label in `ScoreBar`
    - In `components/ui/Securitychart.js`, inside the `ScoreBar` function, change the text content of the assessment avg marker div from `ASSESSMENT AVG` to `WEEKLY RATE`
    - _Requirements: 3.3_

- [ ] 6. Fix `RiskComplianceWidget.js` — DonutChart center text and gauge labels
  - [x] 6.1 Fix `DonutChart` to compute center percentage from raw counts
    - Add `const total = segments.reduce((s, d) => s + d.value, 0) || 1` inside `DonutChart`
    - Add `const pctOf = (v) => Math.round((v / total) * 100)` helper
    - Compute `centerPct` as the percentage of the highest-count segment:
      ```js
      const maxValue  = Math.max(...segments.map((s) => s.value), 0);
      const centerPct = pctOf(maxValue) + "%";
      ```
    - Update arc computation to use `pctOf(s.value)` instead of `s.value` directly when computing `dash`
    - Replace the hardcoded `"100%"` center `<text>` with `{centerPct}`
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 6.2 Write property test for DonutChart center percentage
    - **Property 7: DonutChart center shows highest-segment percentage**
    - Generate arrays of segments with arbitrary non-negative `value` integers (minLength: 1)
    - Assert center text equals `Math.round((maxValue / totalValue) * 100) + "%"`
    - Assert center text is `"0%"` when all segment values are zero
    - **Validates: Requirements 8.2, 8.3**

  - [x] 6.3 Fix `GAUGE_FILTERS` label for the `pending` (disposed) entry
    - Change `{ key: "pending", label: "Resolved", … }` to `{ key: "pending", label: "Disposed", … }`
    - _Requirements: 9.4_

  - [x] 6.4 Fix stat-row label beneath the gauge from "Resolved" to "Disposed"
    - In the JSX stat rows, change `Resolved · {pct(gauge.pending)}` to `Disposed · {pct(gauge.pending)}`
    - _Requirements: 9.5_

  - [ ]* 6.5 Write property test for gauge mapping correctness
    - **Property 8: gauge mapping correctness**
    - Generate arbitrary non-negative integers for `verified`, `disposed`, and `cancelled` counts
    - Assert `widgetData.gauge.compliant === verifiedCount`
    - Assert `widgetData.gauge.pending === disposedCount`
    - Assert `widgetData.gauge.nonCompliant === cancelledCount`
    - **Validates: Requirements 9.3**

- [x] 7. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** — add it as a dev dependency (`npm install --save-dev fast-check`) if not already present
- All changes are pure in-memory logic or label strings; no Supabase schema changes are needed
- The `widgetData.gauge` mapping in `page.js` was already semantically correct — the bugs for Req 9 are only in the label strings inside `RiskComplianceWidget.js`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "1.5", "1.6"] },
    { "id": 1, "tasks": ["1.2", "1.4", "1.7", "3.5", "4.1"] },
    { "id": 2, "tasks": ["3.1", "3.3", "3.6", "5.1", "6.1", "6.3", "6.4"] },
    { "id": 3, "tasks": ["3.2", "3.4", "3.7", "6.2", "6.5"] }
  ]
}
```
