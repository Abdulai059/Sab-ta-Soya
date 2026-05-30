# Design Document — Analytics Data Correctness

## Overview

The Santrack admin analytics page (`/admin/analytics`) has nine identified data-correctness bugs spread across four files. All fixes are pure logic and label changes — no new dependencies, no schema changes, no new components. The goal is to make every number, label, and chart faithfully represent the underlying Supabase data.

### Files in scope

| File | Requirements addressed |
|---|---|
| `components/admin/useDashboardData.js` | Reqs 1, 3, 5, 6, 7 |
| `app/(dashboard)/admin/analytics/page.js` | Reqs 2, 3, 4, 6, 8, 9 |
| `components/ui/Securitychart.js` | Req 3 (label rename) |
| `components/admin/RiskComplianceWidget.js` | Reqs 8, 9 |

---

## Architecture

The data flow is a straight pipeline with no cycles:

```
Supabase DB
    │
    ▼
useDashboardData (hook)
    │  metrics, statusSnap, issueTypes, riskPriority, recentReports
    ▼
analytics/page.js (orchestrator)
    │  scorePct, assessmentAvgPct, sprsData, widgetData, assetData
    ├──▶ MetricCard ×4
    ├──▶ SecurityDashboard (Securitychart.js)
    │       └──▶ ScoreBar (label fix)
    ├──▶ RiskComplianceWidget
    │       ├──▶ DonutChart (center % fix)
    │       └──▶ GaugeChart (label fix)
    └──▶ RiskScoringChart
```

All nine bugs live in the computation or labelling layers — either in the hook (wrong filters, wrong limits) or in the page/components (wrong formulas, wrong labels, wrong data sources). No structural changes to the pipeline are needed.

---

## Components and Interfaces

### `useDashboardData(windowDays?: number)`

**Current signature:** `useDashboardData()` — no parameters.  
**New signature:** `useDashboardData(windowDays = 30)`

The `windowDays` parameter is threaded through to `fetchDashboard` and then to `fetchReports`, replacing the hardcoded `daysAgo(30)` call.

```js
// Hook export
export function useDashboardData(windowDays = 30) { … }

// Internal orchestrator
async function fetchDashboard(windowDays) {
  const windowStart = daysAgo(windowDays);   // was: daysAgo(30)
  const sevenDaysAgo = daysAgo(7);
  const yesterday    = daysAgo(1);
  const [reports, riskRows, resolvedReports, recentReports] = await Promise.all([
    fetchReports(windowStart),               // unchanged call shape
    fetchRiskAssessments(),
    fetchResolvedReports(),
    fetchRecentReports(),                    // limit changed to 10
  ]);
  return {
    metrics:      buildMetrics(reports, sevenDaysAgo, yesterday),
    windowDays,   // ← new: passed back so the page can render "Last N days"
    …
  };
}
```

The hook's return shape gains one field:

```ts
{
  metrics: {
    total, open, resolved, avgResponseHours,
    totalInLastWeek, openSinceYesterday, resolvedInLastWeek
  },
  windowDays: number,   // ← new
  issueTypes, statusSnap, riskPriority, riskScoring,
  recentReports, loading
}
```

### `analytics/page.js`

Consumes `windowDays` from the hook and passes `"Last ${windowDays} days"` as the `subtitle` prop to the two affected MetricCards. Also replaces the local `STATUS_MAP` with a derivation from `STATUS_CONFIG`.

```js
const { …, windowDays } = useDashboardData();
```

### `MetricCard`

No change to the component itself. The `subtitle` prop already exists (it renders below the delta line). The page just needs to pass it.

> **Note:** Looking at the current `MetricCard` source, there is no `subtitle` prop rendered. The component only renders `label`, `value`, and `delta`. The fix is to add a `subtitle` prop to `MetricCard` that renders a small grey line below the value, or alternatively reuse the existing `delta` slot. The cleanest approach is to add an optional `subtitle` prop.

```js
// MetricCard — new optional prop
export default function MetricCard({ …, subtitle }) {
  return (
    <Card …>
      …
      <p className="text-3xl font-semibold …">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      {delta && <p …>{delta}</p>}
    </Card>
  );
}
```

---

## Data Models

### Terminology (from requirements glossary)

| Term | Definition |
|---|---|
| Open_Incident | status ∈ `{pending, assigned, in_progress}` |
| Resolved_Report | status ∈ `{disposed, verified}` |
| Terminal_Status | status ∈ `{disposed, verified, cancelled}` |
| Active_Status | status ∈ `{pending, assigned, in_progress}` |

### `buildMetrics` — changed fields

```js
// BEFORE
const DONE_STATUSES = ["disposed", "verified"];
const isDone    = (r) => DONE_STATUSES.includes(normalizeStatus(r));
const isPending = (r) => normalizeStatus(r) === "pending";

// AFTER
const TERMINAL_STATUSES = ["disposed", "verified", "cancelled"];   // Req 7
const ACTIVE_STATUSES   = ["pending", "assigned", "in_progress"];  // Req 1

const isTerminal = (r) => TERMINAL_STATUSES.includes(normalizeStatus(r));
const isActive   = (r) => ACTIVE_STATUSES.includes(normalizeStatus(r));
const isDone     = (r) => ["disposed", "verified"].includes(normalizeStatus(r)); // resolved = disposed|verified only
```

Field-by-field changes inside `buildMetrics`:

| Field | Before | After |
|---|---|---|
| `open` | `isPending` filter | `isActive` filter (Req 1) |
| `openSinceYesterday` | `isPending` + date filter | `isActive` + date filter (Req 1) |
| `resolved` | `isDone` (disposed+verified) | unchanged — resolved stays disposed+verified |
| `avgResponseHours` | `isDone` filter | `isTerminal` filter, only rows where `updated_at > created_at` (Req 7) |

```js
function buildMetrics(reports, sevenDaysAgo, yesterday) {
  const total    = reports.length;
  const open     = reports.filter(isActive).length;                          // Req 1
  const resolved = reports.filter(isDone).length;

  const totalInLastWeek    = reports.filter((r) => new Date(r.created_at) >= sevenDaysAgo).length;
  const openSinceYesterday = reports.filter(
    (r) => isActive(r) && new Date(r.created_at) >= yesterday               // Req 1
  ).length;
  const resolvedInLastWeek = reports.filter(
    (r) => isDone(r) && new Date(r.created_at) >= sevenDaysAgo
  ).length;

  const responseTimes = reports
    .filter(isTerminal)                                                       // Req 7: was isDone
    .map((r) => (new Date(r.updated_at) - new Date(r.created_at)) / 36e5)
    .filter((h) => h > 0);                                                   // Req 7: updated_at > created_at

  const avgResponseHours = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
    : 0;

  return { total, open, resolved, avgResponseHours, totalInLastWeek, openSinceYesterday, resolvedInLastWeek };
}
```

### `fetchRecentReports` — limit change (Req 5)

```js
// BEFORE
.limit(2)

// AFTER
.limit(10)
```

### `assessmentAvgPct` formula (Req 3)

Computed in `analytics/page.js`:

```js
// BEFORE
const assessmentAvgPct = metrics.total > 0
  ? Math.round((metrics.resolvedInLastWeek / Math.max(metrics.totalInLastWeek, 1)) * 100)
  : 0;

// AFTER — remove the outer total>0 guard; Math.max already handles the zero case
const assessmentAvgPct = Math.round(
  (metrics.resolvedInLastWeek / Math.max(metrics.totalInLastWeek, 1)) * 100
);
```

### `sprsData` derivation (Req 4)

```js
// BEFORE — hardcoded STATUS_MAP in page.js (5 entries, missing "assigned")
const STATUS_MAP = [
  { name: "Pending",     key: "pending",     color: "#94a3b8" },
  { name: "In Progress", key: "in_progress", color: "#f97316" },
  { name: "Disposed",    key: "disposed",    color: "#22c55e" },
  { name: "Verified",    key: "verified",    color: "#3b82f6" },
  { name: "Cancelled",   key: "cancelled",   color: "#ef4444" },
];
const sprsData = STATUS_MAP.map(({ name, key, color }) => ({
  name, value: getSnapCount(key), color,
}));

// AFTER — derived from STATUS_CONFIG (6 entries, authoritative colors)
import { STATUS_CONFIG } from "@/components/admin/constants";

const sprsData = STATUS_CONFIG.map((s) => ({
  name:  s.label,
  value: getSnapCount(s.keys[0]),
  color: s.color,
}));
```

Zero-count entries naturally remain in the array with `value: 0`. Recharts renders a zero-value arc as invisible, satisfying the "appears in legend, invisible arc" requirement.

### `widgetData.gauge` mapping (Req 9)

```js
// BEFORE
gauge: {
  total:        getSnapCount("verified") + getSnapCount("disposed"),
  compliant:    getSnapCount("verified"),
  pending:      getSnapCount("disposed"),
  nonCompliant: getSnapCount("cancelled"),
},

// AFTER — same values, but the semantics are now correct:
// compliant = verified, pending = disposed, nonCompliant = cancelled
// (no code change needed here — the mapping was already correct;
//  the bug is in the GAUGE_FILTERS labels and stat-row labels in RiskComplianceWidget)
```

### `DonutChart` center text (Req 8)

The `DonutChart` in `RiskComplianceWidget.js` currently receives pre-computed percentage values (`d.value` is already a `%` integer) and hardcodes `"100%"` as the center text.

**New contract:** `DonutChart` receives raw counts and computes percentages internally. The center text shows the percentage of the highest-count segment.

```js
// New DonutChart props shape
// segments: Array<{ label: string, value: number /* raw count */, color: string }>

function DonutChart({ segments }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const pctOf = (v) => Math.round((v / total) * 100);

  // Highest segment percentage for center text
  const maxValue  = Math.max(...segments.map((s) => s.value), 0);
  const centerPct = pctOf(maxValue) + "%";

  // Arc computation uses pctOf(s.value) instead of s.value directly
  const circumference = 2 * Math.PI * r;
  const slices = segments.map((s) => {
    const dash = (pctOf(s.value) / 100) * circumference;
    …
  });

  return (
    <svg …>
      {slices.map(…)}
      <text …>{centerPct}</text>   {/* was hardcoded "100%" */}
      <text …>overall</text>
    </svg>
  );
}
```

**Corresponding change in `analytics/page.js`:** `widgetData.donut` must pass raw counts instead of pre-computed percentages:

```js
// BEFORE
donut: riskPriority.map((r) => ({
  label: r.name,
  value: Math.round((r.value / riskTotal) * 100),   // pre-computed %
  color: r.color,
})),

// AFTER
donut: riskPriority.map((r) => ({
  label: r.name,
  value: r.value,   // raw count — DonutChart computes % internally
  color: r.color,
})),
```

### `GAUGE_FILTERS` and stat-row labels (Req 9)

```js
// BEFORE
const GAUGE_FILTERS = [
  { key: "compliant",    label: "Verified",  color: "text-green-500" },
  { key: "pending",      label: "Resolved",  color: "text-amber-400" },  // ← wrong label
  { key: "nonCompliant", label: "Cancelled", color: "text-red-500"   },
];

// AFTER
const GAUGE_FILTERS = [
  { key: "compliant",    label: "Verified",  color: "text-green-500" },
  { key: "pending",      label: "Disposed",  color: "text-amber-400" },  // ← fixed
  { key: "nonCompliant", label: "Cancelled", color: "text-red-500"   },
];
```

Stat rows beneath the gauge (currently hardcoded strings in JSX):

```jsx
// BEFORE
<div className="text-xs text-gray-400">Verified · {pct(gauge.compliant)}</div>
<div className="text-xs text-gray-400">Resolved · {pct(gauge.pending)}</div>   {/* wrong */}
<div className="text-xs text-gray-400">Cancelled · {pct(gauge.nonCompliant)}</div>

// AFTER
<div className="text-xs text-gray-400">Verified · {pct(gauge.compliant)}</div>
<div className="text-xs text-gray-400">Disposed · {pct(gauge.pending)}</div>   {/* fixed */}
<div className="text-xs text-gray-400">Cancelled · {pct(gauge.nonCompliant)}</div>
```

### `ScoreBar` label rename (Req 3)

In `components/ui/Securitychart.js`, inside the `ScoreBar` function:

```jsx
// BEFORE
ASSESSMENT AVG

// AFTER
WEEKLY RATE
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Active status filter correctness

*For any* array of reports with arbitrary status values, `metrics.open` SHALL equal the count of reports whose status is in `{pending, assigned, in_progress}`, and `metrics.openSinceYesterday` SHALL equal the count of those same reports whose `created_at` is on or after the yesterday boundary.

**Validates: Requirements 1.1, 1.2**

### Property 2: Score percentage formula

*For any* non-negative integers `resolved` and `total` where `resolved ≤ total`, `scorePct` SHALL equal `Math.round((resolved / total) * 100)`, and when `total = 0`, `scorePct` SHALL equal `0`.

**Validates: Requirements 2.1**

### Property 3: Weekly rate formula

*For any* non-negative integers `resolvedInLastWeek` and `totalInLastWeek`, `assessmentAvgPct` SHALL equal `Math.round((resolvedInLastWeek / Math.max(totalInLastWeek, 1)) * 100)`, and when `totalInLastWeek = 0`, the result SHALL be `0` (not a division-by-zero error).

**Validates: Requirements 3.2**

### Property 4: sprsData mirrors STATUS_CONFIG

*For any* `STATUS_CONFIG` array, `sprsData` SHALL have the same length as `STATUS_CONFIG`, and for each entry the `name` SHALL equal `STATUS_CONFIG[i].label` and the `color` SHALL equal `STATUS_CONFIG[i].color`. Entries with zero matching reports SHALL still appear with `value: 0`.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: windowDays controls fetch window and subtitle

*For any* positive integer `windowDays`, the reports query SHALL use a `since` date of exactly `windowDays` days before the current time, and the MetricCard subtitles for Total Reports and Open Incidents SHALL display the string `"Last ${windowDays} days"`.

**Validates: Requirements 6.1, 6.2**

### Property 6: avgResponseHours includes all terminal statuses with valid timestamps

*For any* array of reports containing a mix of `disposed`, `verified`, and `cancelled` reports, `avgResponseHours` SHALL be computed from all three terminal statuses, and SHALL exclude any report where `updated_at ≤ created_at`.

**Validates: Requirements 7.1, 7.2**

### Property 7: DonutChart center shows highest-segment percentage

*For any* array of donut segments with raw count values, the center text of `DonutChart` SHALL equal `Math.round((maxCount / totalCount) * 100) + "%"` where `maxCount` is the largest `value` in the array and `totalCount` is the sum of all values. When all values are zero, the center SHALL show `"0%"`.

**Validates: Requirements 8.2, 8.3**

### Property 8: gauge mapping correctness

*For any* `statusSnap` containing known counts for `verified`, `disposed`, and `cancelled`, `widgetData.gauge.compliant` SHALL equal the `verified` count, `widgetData.gauge.pending` SHALL equal the `disposed` count, and `widgetData.gauge.nonCompliant` SHALL equal the `cancelled` count.

**Validates: Requirements 9.3**

---

## Error Handling

All changes are pure in-memory computations or label strings. No new error surfaces are introduced.

- **Division by zero:** All percentage formulas already guard with `Math.max(…, 1)` or an explicit `total > 0` check. The `assessmentAvgPct` fix removes a redundant outer guard while keeping the `Math.max` inner guard.
- **Missing status keys:** `getSnapCount` returns `0` for unknown keys, so new statuses in `sprsData` derived from `STATUS_CONFIG` degrade gracefully to zero-count entries.
- **Empty recentReports:** The `RiskComplianceWidget` already renders a "No recent reports" fallback when `alerts.length === 0`.
- **Negative response times:** The `h > 0` filter in `buildMetrics` already excludes rows where `updated_at ≤ created_at`. This filter is preserved and now applies to all terminal statuses.

---

## Testing Strategy

### Unit tests (example-based)

These cover specific, deterministic checks that are not universal across all inputs:

- `ScoreBar` renders the text `"WEEKLY RATE"` and does not render `"ASSESSMENT AVG"` (Req 3.1)
- `fetchRecentReports` Supabase query uses `.limit(10)` (Req 5.1)
- `GAUGE_FILTERS[1].label` equals `"Disposed"` (Req 9.1)
- Stat row labels in `RiskComplianceWidget` are `"Verified"`, `"Disposed"`, `"Cancelled"` (Req 9.2)
- `DonutChart` does not render the hardcoded text `"100%"` (Req 8.1)
- When `recentReports` has 10 items, all 10 appear in the alerts panel (Req 5.2)

### Property-based tests

Property-based testing is appropriate here because the core bugs are in pure filtering and arithmetic functions that operate over variable-length arrays and numeric inputs. The library of choice is **fast-check** (already common in JS/TS projects; no new dependency if the project uses it, otherwise add `fast-check` as a dev dependency).

Each property test runs a minimum of **100 iterations**.

Tag format: `Feature: analytics-data-correctness, Property {N}: {property_text}`

| Property | Test description | Generators |
|---|---|---|
| P1 | Active status filter correctness | `fc.array(fc.record({ status: fc.constantFrom(...all 6 statuses), created_at: fc.date() }))` |
| P2 | Score percentage formula | `fc.integer({ min: 0, max: 1000 })` for total; `fc.integer({ min: 0 })` for resolved ≤ total |
| P3 | Weekly rate formula | `fc.nat()` for both resolvedInLastWeek and totalInLastWeek |
| P4 | sprsData mirrors STATUS_CONFIG | `fc.array(fc.constantFrom(...all 6 status keys))` for report statuses |
| P5 | windowDays controls fetch window | `fc.integer({ min: 1, max: 365 })` for windowDays |
| P6 | avgResponseHours terminal statuses | `fc.array(fc.record({ status: fc.constantFrom('disposed','verified','cancelled'), created_at: fc.date(), updated_at: fc.date() }))` |
| P7 | DonutChart center highest-segment % | `fc.array(fc.record({ value: fc.nat(), color: fc.hexaString(), label: fc.string() }), { minLength: 1 })` |
| P8 | gauge mapping correctness | `fc.record({ verified: fc.nat(), disposed: fc.nat(), cancelled: fc.nat() })` |

### Integration tests

Not required for this feature — all changes are in-memory logic with no new external service calls. The existing Supabase integration is unchanged except for the `limit(10)` bump in `fetchRecentReports`.
