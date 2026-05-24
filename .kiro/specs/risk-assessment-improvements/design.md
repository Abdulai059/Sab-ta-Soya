# Design Document

## Risk Assessment Improvements

---

## Overview

This design replaces the two existing risk visualisation components (`RiskAssessmentChart` and `RiskScoringChart`) with a single unified **Risk Intelligence Section**. The change introduces a weighted composite risk score computed per `risk_assessments` row, exposes aggregate statistics and a ranked top-risk list through the existing `useDashboardData` hook, and wires everything into the admin analytics page with no breaking changes to other consumers.

The implementation touches four layers:

1. **Constants** — new `RISK_WEIGHTS` object in `constants.js`
2. **Pure scoring logic** — `computeCompositeScore` and `scoreTier` functions (co-located with the hook or in `utils.js`)
3. **Data hook** — `useDashboardData` gains a `riskIntelligence` field; existing `riskPriority` and `riskScoring` fields are preserved
4. **UI components** — `RiskIntelligenceSection` (container) → `RiskAggregateStats` + `TopHighRiskList` (sub-components)

---

## Architecture

```
analytics/page.js
  └─ useDashboardData()          ← returns { ..., riskIntelligence }
       └─ fetchDashboard()
            └─ computeCompositeScore(row)   ← pure, reads RISK_WEIGHTS
            └─ scoreTier(score)             ← pure

  └─ <RiskIntelligenceSection riskIntelligence={...} />
       ├─ <RiskAggregateStats stats={...} />
       └─ <TopHighRiskList items={...} />
```

No new network calls are introduced. The existing `risk_assessments` Supabase query is extended to also select `report_id`.

---

## Components and Interfaces

### 1. `RISK_WEIGHTS` — `components/admin/constants.js`

A single exported constant that is the single source of truth for all scoring weights.

```js
export const RISK_WEIGHTS = {
  near_school:            15,
  near_water_source:      15,
  flood_zone:             10,
  drought_zone:           10,
  repeated_incident:      10,
  escalation_required:     5,
  per_child:               2,
  per_child_cap:          20,
};
```

All six boolean risk factors and the two children-count parameters are defined here. Updating any value automatically propagates to every computation without touching other files.

---

### 2. Pure Scoring Functions

These are stateless, side-effect-free functions. They can live in `utils.js` or be defined at the top of `useDashboardData.js` — either location works; co-locating with the hook is preferred to keep the scoring logic close to its only consumer.

#### `computeCompositeScore(row)`

```js
/**
 * Computes the weighted composite risk score for a single risk_assessments row.
 * @param {object} row  - A row from the risk_assessments table
 * @returns {number}    - Integer score ≥ 0
 */
export function computeCompositeScore(row) {
  const w = RISK_WEIGHTS;
  const flagScore =
    (row.near_school          ? w.near_school          : 0) +
    (row.near_water_source    ? w.near_water_source    : 0) +
    (row.flood_zone           ? w.flood_zone           : 0) +
    (row.drought_zone         ? w.drought_zone         : 0) +
    (row.repeated_incident    ? w.repeated_incident    : 0) +
    (row.escalation_required  ? w.escalation_required  : 0);

  const childrenScore = Math.min(
    (row.affected_children_count ?? 0) * w.per_child,
    w.per_child_cap
  );

  return flagScore + childrenScore;
}
```

#### `scoreTier(score)`

```js
/**
 * Maps a composite score to a named risk tier.
 * @param {number} score
 * @returns {'critical'|'high'|'medium'|'low'}
 */
export function scoreTier(score) {
  if (score >= 50) return "critical";
  if (score >= 30) return "high";
  if (score >= 15) return "medium";
  return "low";
}
```

Both functions are pure and have no dependencies on React or Supabase, making them straightforward to unit-test and property-test in isolation.

---

### 3. Updated `useDashboardData` Hook

#### Supabase Query Change

The existing `risk_assessments` select string gains `report_id`:

```js
supabase
  .from("risk_assessments")
  .select(
    "report_id, priority_level, risk_score, near_school, near_water_source, " +
    "flood_zone, drought_zone, repeated_incident, escalation_required, affected_children_count"
  )
  .gte("calculated_at", thirtyDaysAgo.toISOString())
```

#### New `riskIntelligence` Shape

After the existing `riskPriority` / `riskScoring` derivations, add:

```js
// ── Risk Intelligence (new) ───────────────────────────────────────────────
const scoredRows = rows.map((row) => {
  const score = computeCompositeScore(row);
  const tier  = scoreTier(score);
  return { ...row, compositeScore: score, tier };
});

// Aggregate stats
const tierCounts = { critical: 0, high: 0, medium: 0, low: 0 };
let totalScore = 0;
let totalChildren = 0;
scoredRows.forEach((r) => {
  tierCounts[r.tier] += 1;
  totalScore += r.compositeScore;
  totalChildren += r.affected_children_count ?? 0;
});
const avgScore = scoredRows.length
  ? parseFloat((totalScore / scoredRows.length).toFixed(1))
  : 0;

// Top high-risk list (up to 10, sorted desc by score then children)
const RISK_FACTOR_KEYS = [
  "near_school", "near_water_source", "flood_zone",
  "drought_zone", "repeated_incident", "escalation_required",
];
const RISK_FACTOR_LABELS = {
  near_school:         "Near School",
  near_water_source:   "Near Water",
  flood_zone:          "Flood Zone",
  drought_zone:        "Drought Zone",
  repeated_incident:   "Repeated",
  escalation_required: "Escalation",
};

const topHighRisk = [...scoredRows]
  .sort((a, b) =>
    b.compositeScore - a.compositeScore ||
    (b.affected_children_count ?? 0) - (a.affected_children_count ?? 0)
  )
  .slice(0, 10)
  .map((r) => ({
    reportId:             r.report_id,
    compositeScore:       r.compositeScore,
    tier:                 r.tier,
    affectedChildren:     r.affected_children_count ?? 0,
    activeFactors:        RISK_FACTOR_KEYS.filter((k) => r[k]).map((k) => RISK_FACTOR_LABELS[k]),
  }));

const riskIntelligence = {
  tierCounts,          // { critical, high, medium, low }
  avgScore,            // number, 1 decimal place
  totalChildren,       // integer
  topHighRisk,         // array of up to 10 items
  isEmpty: scoredRows.length === 0,
};
```

#### Return Value

```js
return {
  // ── existing fields (unchanged) ──
  metrics, severity, issueTypes, trend, statusSnap, workers,
  riskPriority,   // preserved — RiskAssessmentChart still works if needed
  riskScoring,    // preserved — RiskScoringChart still works if needed
  // ── new field ──
  riskIntelligence,
};
```

The `EMPTY` fallback object gains:

```js
riskIntelligence: {
  tierCounts: { critical: 0, high: 0, medium: 0, low: 0 },
  avgScore: 0,
  totalChildren: 0,
  topHighRisk: [],
  isEmpty: true,
},
```

---

### 4. `RiskIntelligenceSection` Component

**File:** `components/admin/RiskIntelligenceSection.js`

Container component. Receives the full `riskIntelligence` object and delegates to the two sub-components.

```jsx
import { Card, CardTitle } from "./DashboardCard";
import RiskAggregateStats from "./RiskAggregateStats";
import TopHighRiskList from "./TopHighRiskList";

export default function RiskIntelligenceSection({ riskIntelligence }) {
  return (
    <Card>
      <CardTitle>Risk intelligence</CardTitle>
      <div className="flex flex-col gap-6">
        <RiskAggregateStats
          tierCounts={riskIntelligence.tierCounts}
          avgScore={riskIntelligence.avgScore}
          totalChildren={riskIntelligence.totalChildren}
          isEmpty={riskIntelligence.isEmpty}
        />
        <div className="border-t border-gray-100" />
        <TopHighRiskList
          items={riskIntelligence.topHighRisk}
          isEmpty={riskIntelligence.isEmpty}
        />
      </div>
    </Card>
  );
}
```

Props:

| Prop | Type | Description |
|---|---|---|
| `riskIntelligence` | `object` | Full `riskIntelligence` shape from `useDashboardData` |

---

### 5. `RiskAggregateStats` Sub-component

**File:** `components/admin/RiskAggregateStats.js`

Displays the four tier counts, average score, and total children at risk.

```jsx
import { PRIORITY_COLORS } from "./constants";

const TIER_ORDER = ["critical", "high", "medium", "low"];
const TIER_LABEL = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };

export default function RiskAggregateStats({ tierCounts, avgScore, totalChildren, isEmpty }) {
  if (isEmpty) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">No risk data yet</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tier counts row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TIER_ORDER.map((tier) => (
          <div
            key={tier}
            className="flex flex-col items-center justify-center rounded-xl py-3 px-2"
            style={{ background: PRIORITY_COLORS[tier] + "18" }}  // 10% opacity tint
          >
            <span
              className="text-2xl font-bold"
              style={{ color: PRIORITY_COLORS[tier] }}
            >
              {tierCounts[tier]}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5">{TIER_LABEL[tier]}</span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>
          Avg score:{" "}
          <span className="font-semibold text-gray-800">{avgScore}</span>
        </span>
        <span>
          Children at risk:{" "}
          <span className="font-semibold text-gray-800">{totalChildren}</span>
        </span>
      </div>
    </div>
  );
}
```

Props:

| Prop | Type | Description |
|---|---|---|
| `tierCounts` | `{ critical, high, medium, low }` | Count per tier |
| `avgScore` | `number` | Average composite score, 1 decimal |
| `totalChildren` | `number` | Sum of `affected_children_count` |
| `isEmpty` | `boolean` | Show empty state when true |

---

### 6. `TopHighRiskList` Sub-component

**File:** `components/admin/TopHighRiskList.js`

Renders the ranked list of up to 10 high-risk reports. Each row is a Next.js `<Link>` to `/reports/[id]`.

```jsx
import Link from "next/link";
import { PRIORITY_COLORS } from "./constants";

const TIER_LABEL = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };

export default function TopHighRiskList({ items, isEmpty }) {
  if (isEmpty || items.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">No high-risk reports</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
        Top high-risk reports
      </p>
      {items.map((item) => (
        <Link
          key={item.reportId}
          href={`/reports/${item.reportId}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors group"
        >
          {/* Score bubble */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
            style={{ background: PRIORITY_COLORS[item.tier] }}
          >
            {item.compositeScore}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-700 truncate">
                Report #{item.reportId}
              </span>
              {/* Tier badge */}
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  background: PRIORITY_COLORS[item.tier] + "20",
                  color: PRIORITY_COLORS[item.tier],
                }}
              >
                {TIER_LABEL[item.tier]}
              </span>
            </div>
            {/* Factor tags */}
            <div className="flex flex-wrap gap-1 mt-1">
              {item.activeFactors.map((f) => (
                <span
                  key={f}
                  className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Children count */}
          {item.affectedChildren > 0 && (
            <div className="text-right shrink-0">
              <span className="text-xs font-semibold text-rose-500">
                {item.affectedChildren}
              </span>
              <p className="text-[10px] text-gray-400">children</p>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
```

Props:

| Prop | Type | Description |
|---|---|---|
| `items` | `array` | Up to 10 scored report objects |
| `isEmpty` | `boolean` | Show empty state when true |

Each `item` shape:

```ts
{
  reportId:       string | number,
  compositeScore: number,
  tier:           'critical' | 'high' | 'medium' | 'low',
  affectedChildren: number,
  activeFactors:  string[],   // human-readable labels
}
```

---

### 7. Analytics Page Wiring

**File:** `app/(dashboard)/admin/analytics/page.js`

Changes:
- Remove imports for `RiskAssessmentChart` and `RiskScoringChart`
- Add import for `RiskIntelligenceSection`
- Destructure `riskIntelligence` from `useDashboardData()`
- Replace the two chart JSX blocks with a single `<RiskIntelligenceSection>`

```jsx
// Before (remove these two imports):
// import RiskAssessmentChart from "@/components/admin/RiskAssessmentChart";
// import RiskScoringChart from "@/components/admin/RiskScoringChart";

// Add:
import RiskIntelligenceSection from "@/components/admin/RiskIntelligenceSection";

// Hook destructuring — add riskIntelligence:
const { metrics, issueTypes, trend, statusSnap, riskPriority, riskScoring, riskIntelligence, loading } =
  useDashboardData();

// Replace the two grid blocks:
// BEFORE:
// <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//   <TrendChart trend={trend} />
//   <RiskAssessmentChart riskPriority={riskPriority} resolved={metrics.resolved} total={metrics.total} />
// </div>
// ...
// <RiskScoringChart riskScoring={riskScoring} />

// AFTER:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <TrendChart trend={trend} />
  <RiskIntelligenceSection riskIntelligence={riskIntelligence} />
</div>
```

The `TrendChart` stays in the same two-column grid. `RiskIntelligenceSection` occupies the right column on desktop and full width on mobile. The standalone `RiskScoringChart` row is removed entirely.

---

## Data Models

### `riskIntelligence` Object (returned by `useDashboardData`)

```ts
interface RiskIntelligence {
  tierCounts: {
    critical: number;
    high:     number;
    medium:   number;
    low:      number;
  };
  avgScore:      number;   // rounded to 1 decimal place
  totalChildren: number;   // integer sum
  topHighRisk:   TopHighRiskItem[];
  isEmpty:       boolean;
}

interface TopHighRiskItem {
  reportId:        string | number;
  compositeScore:  number;
  tier:            'critical' | 'high' | 'medium' | 'low';
  affectedChildren: number;
  activeFactors:   string[];  // e.g. ["Near School", "Flood Zone"]
}
```

### `RISK_WEIGHTS` Constant

```ts
interface RiskWeights {
  near_school:           number;  // 15
  near_water_source:     number;  // 15
  flood_zone:            number;  // 10
  drought_zone:          number;  // 10
  repeated_incident:     number;  // 10
  escalation_required:   number;  //  5
  per_child:             number;  //  2
  per_child_cap:         number;  // 20
}
```

---

## Error Handling

- **Supabase query failure**: The existing `if (error) throw error` pattern in `fetchDashboard` covers this. React Query surfaces the error to the page; no change needed.
- **Missing `report_id`**: If `report_id` is null (e.g. orphaned assessment row), the `TopHighRiskList` item will render "Report #" with no ID. The `<Link>` href becomes `/reports/null`, which the reports page handles as a not-found. This is acceptable for the current scope.
- **`affected_children_count` null/undefined**: Guarded with `?? 0` in both `computeCompositeScore` and the aggregation loop.
- **Empty 30-day window**: `isEmpty: true` propagates to both sub-components, which render their respective empty-state messages.

---

## Testing Strategy

### Pure Scoring Functions

`computeCompositeScore` and `scoreTier` are stateless, side-effect-free functions with no React or Supabase dependencies. They are the primary targets for automated testing.

**Property-based tests** (using a library such as `fast-check`) are the best fit here because the input space is large and the correctness properties are universal:

- **`computeCompositeScore`** — generate arbitrary combinations of the six boolean flags and any non-negative `affected_children_count`. Assert that the returned value equals the manually computed weighted sum with the children cap applied. This directly validates Properties 1 and 5.
- **`scoreTier`** — generate arbitrary non-negative integers and assert that the returned tier matches the threshold rules exhaustively. This validates Property 2.
- **Aggregate consistency** — generate arrays of arbitrary rows, compute `riskIntelligence` from them, and assert that `tierCounts`, `avgScore`, and `totalChildren` match values derived by independently mapping `computeCompositeScore` + `scoreTier` over the same array. This validates Property 3.
- **Top-list ordering and bound** — generate arrays of scored rows and assert that `topHighRisk` has at most 10 entries, is sorted descending by `compositeScore` (ties broken by `affectedChildren`), and that no omitted row has a higher score than the last included entry. This validates Property 4.

**Example-based unit tests** cover specific edge cases that property generators may not emphasise:

- A row with all flags false and `affected_children_count = 0` → score 0, tier `"low"`.
- A row with all flags true and `affected_children_count = 100` → score capped correctly.
- `affected_children_count` of exactly 10 (cap boundary: 10 × 2 = 20, no cap) vs. 11 (11 × 2 = 22, capped to 20).
- Score values at tier boundaries: 14 → `"low"`, 15 → `"medium"`, 29 → `"medium"`, 30 → `"high"`, 49 → `"high"`, 50 → `"critical"`.

### UI Components

`RiskAggregateStats` and `TopHighRiskList` are pure presentational components that receive fully-derived props. They are best tested with **example-based unit tests** using React Testing Library:

- **`RiskAggregateStats`**: render with a known `tierCounts` / `avgScore` / `totalChildren` and assert the correct numbers appear in the DOM; render with `isEmpty = true` and assert the "No risk data yet" message is shown.
- **`TopHighRiskList`**: render with a known `items` array and assert each report's score, tier badge, factor tags, and children count are visible; assert each row renders a link pointing to `/reports/[id]`; render with `isEmpty = true` and assert the empty-state message is shown.
- **`RiskIntelligenceSection`**: a shallow integration test that passes a complete `riskIntelligence` object and asserts both sub-components receive the correct props.

### Hook Integration

`useDashboardData` is tested at the integration level using a mocked Supabase client. A representative set of 3–5 `risk_assessments` rows is sufficient to verify that the hook correctly calls `computeCompositeScore`, builds `riskIntelligence`, and preserves the existing `riskPriority` and `riskScoring` fields unchanged.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Composite score equals weighted sum

For any `risk_assessments` row with arbitrary boolean flag values and any non-negative `affected_children_count`, `computeCompositeScore(row)` SHALL return exactly the sum of each active flag's weight from `RISK_WEIGHTS` plus `min(affected_children_count × per_child, per_child_cap)`.

**Validates: Requirements 1.1, 1.2, 1.3, 5.1, 5.2**

### Property 2: Score tier thresholds are exhaustive and correct

For any integer score in the range [0, ∞), `scoreTier(score)` SHALL return `"critical"` if score ≥ 50, `"high"` if 30 ≤ score < 50, `"medium"` if 15 ≤ score < 30, and `"low"` if score < 15. Every possible score maps to exactly one tier.

**Validates: Requirements 1.4**

### Property 3: Aggregate stats are consistent with scored rows

For any array of `risk_assessments` rows, the `tierCounts`, `avgScore`, and `totalChildren` values in `riskIntelligence` SHALL equal the values obtained by independently applying `computeCompositeScore` + `scoreTier` to each row and summing/averaging the results.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 4: Top high-risk list is correctly sorted and bounded

For any array of scored rows, `topHighRisk` SHALL contain at most 10 entries, every entry SHALL have a `compositeScore` ≥ the score of any entry not in the list, and for any two adjacent entries where scores are equal the one with the higher `affected_children_count` SHALL appear first.

**Validates: Requirements 3.2, 3.3**

### Property 5: Scoring weights are read exclusively from `RISK_WEIGHTS`

For any valid `RISK_WEIGHTS` configuration (all values non-negative integers), `computeCompositeScore` applied to any row SHALL produce a result consistent with those weights — i.e., changing a weight in `RISK_WEIGHTS` changes the output of `computeCompositeScore` for any row where the corresponding flag is true, without modifying any other file.

**Validates: Requirements 5.1, 5.2, 5.3**
