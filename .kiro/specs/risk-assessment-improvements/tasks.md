# Implementation Plan: Risk Assessment Improvements

## Overview

Replace `RiskAssessmentChart` and `RiskScoringChart` with a unified Risk Intelligence Section. The work flows from constants → pure scoring functions → hook extension → new UI components → analytics page wiring, with property-based tests covering the scoring logic.

## Tasks

- [ ] 1. Add `RISK_WEIGHTS` constant to `constants.js`
  - Export a `RISK_WEIGHTS` object from `components/admin/constants.js` with the eight keys: `near_school` (15), `near_water_source` (15), `flood_zone` (10), `drought_zone` (10), `repeated_incident` (10), `escalation_required` (5), `per_child` (2), `per_child_cap` (20)
  - This is the single source of truth for all scoring weights; no other file should hard-code these values
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Implement pure scoring functions
  - [ ] 2.1 Implement `computeCompositeScore` and `scoreTier` in `useDashboardData.js`
    - Define `computeCompositeScore(row)` at the top of `useDashboardData.js` (above `fetchDashboard`): sum active boolean flag weights from `RISK_WEIGHTS`, add `Math.min((row.affected_children_count ?? 0) * RISK_WEIGHTS.per_child, RISK_WEIGHTS.per_child_cap)`, return the integer total
    - Define `scoreTier(score)`: return `"critical"` if score ≥ 50, `"high"` if ≥ 30, `"medium"` if ≥ 15, else `"low"`
    - Import `RISK_WEIGHTS` from `./constants`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2_

  - [ ]* 2.2 Write property-based test for `computeCompositeScore` — Property 1
    - **Property 1: Composite score equals weighted sum**
    - Use `fast-check` to generate arbitrary combinations of the six boolean flags and any non-negative `affected_children_count`; assert the returned value equals the manually computed weighted sum with the children cap applied
    - **Validates: Requirements 1.1, 1.2, 1.3, 5.1, 5.2**

  - [ ]* 2.3 Write property-based test for `scoreTier` — Property 2
    - **Property 2: Score tier thresholds are exhaustive and correct**
    - Use `fast-check` to generate arbitrary non-negative integers; assert the returned tier matches the threshold rules for every possible score value
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Write property-based test for scoring weight configurability — Property 5
    - **Property 5: Scoring weights are read exclusively from `RISK_WEIGHTS`**
    - Generate arbitrary valid `RISK_WEIGHTS` configurations (all values non-negative integers); assert `computeCompositeScore` output is consistent with those weights for any row where the corresponding flag is true
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 3. Extend `useDashboardData` hook
  - [ ] 3.1 Add `report_id` to the Supabase `risk_assessments` query
    - In `fetchDashboard`, update the `.select(...)` string for the `risk_assessments` query to prepend `"report_id, "` before the existing fields
    - _Requirements: 3.5_

  - [ ] 3.2 Compute `riskIntelligence` from scored rows
    - After the existing `riskPriority` / `riskScoring` derivations, map `rows` through `computeCompositeScore` + `scoreTier` to produce `scoredRows`
    - Accumulate `tierCounts` (`{ critical, high, medium, low }`), `totalScore`, and `totalChildren` in a single `forEach` pass
    - Derive `avgScore` as `parseFloat((totalScore / scoredRows.length).toFixed(1))` (or `0` when empty)
    - Build `topHighRisk`: sort `scoredRows` descending by `compositeScore` then `affected_children_count`, slice to 10, map each to `{ reportId, compositeScore, tier, affectedChildren, activeFactors }` using the `RISK_FACTOR_LABELS` map defined in the design
    - Assemble and return `riskIntelligence: { tierCounts, avgScore, totalChildren, topHighRisk, isEmpty }`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.3, 2.4, 3.2, 3.3, 3.5_

  - [ ] 3.3 Add `riskIntelligence` to the `EMPTY` fallback and hook return value
    - Add `riskIntelligence: { tierCounts: { critical: 0, high: 0, medium: 0, low: 0 }, avgScore: 0, totalChildren: 0, topHighRisk: [], isEmpty: true }` to the `EMPTY` constant
    - Add `riskIntelligence` to the `return` statement of `fetchDashboard` alongside the existing fields; do not remove `riskPriority` or `riskScoring`
    - _Requirements: 1.5, 2.5_

  - [ ]* 3.4 Write property-based test for aggregate consistency — Property 3
    - **Property 3: Aggregate stats are consistent with scored rows**
    - Generate arrays of arbitrary `risk_assessments` rows; assert `tierCounts`, `avgScore`, and `totalChildren` in `riskIntelligence` match values derived by independently mapping `computeCompositeScore` + `scoreTier` over the same array
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ]* 3.5 Write property-based test for top-list ordering and bound — Property 4
    - **Property 4: Top high-risk list is correctly sorted and bounded**
    - Generate arrays of scored rows; assert `topHighRisk` has at most 10 entries, every entry has `compositeScore` ≥ any omitted row's score, and ties are broken by descending `affectedChildren`
    - **Validates: Requirements 3.2, 3.3**

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create `RiskAggregateStats` component
  - [ ] 5.1 Implement `components/admin/RiskAggregateStats.js`
    - Render a 2×2 / 4-column grid of tier count tiles using `PRIORITY_COLORS` from `constants.js` for colour tinting (10% opacity background, full-colour number)
    - Render a summary row showing `avgScore` and `totalChildren`
    - When `isEmpty` is true, render `<p className="text-sm text-gray-400 py-6 text-center">No risk data yet</p>` instead
    - Props: `tierCounts`, `avgScore`, `totalChildren`, `isEmpty`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Create `TopHighRiskList` component
  - [ ] 6.1 Implement `components/admin/TopHighRiskList.js`
    - Render a labelled list of up to 10 report rows; each row is a Next.js `<Link href={"/reports/" + item.reportId}>` with a score bubble (coloured circle using `PRIORITY_COLORS[item.tier]`), report ID, tier badge, active factor tags, and children count
    - When `isEmpty` or `items.length === 0`, render `<p className="text-sm text-gray-400 py-4 text-center">No high-risk reports</p>`
    - Props: `items`, `isEmpty`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [ ] 7. Create `RiskIntelligenceSection` container component
  - [ ] 7.1 Implement `components/admin/RiskIntelligenceSection.js`
    - Import `Card` and `CardTitle` from `./DashboardCard`, `RiskAggregateStats` from `./RiskAggregateStats`, and `TopHighRiskList` from `./TopHighRiskList`
    - Render a `<Card>` with `<CardTitle>Risk intelligence</CardTitle>`, then `<RiskAggregateStats>`, a `<div className="border-t border-gray-100" />` divider, and `<TopHighRiskList>`
    - Props: `riskIntelligence` (the full object from `useDashboardData`)
    - _Requirements: 4.2, 4.3, 4.4_

- [ ] 8. Update analytics page
  - [ ] 8.1 Wire `RiskIntelligenceSection` into `app/(dashboard)/admin/analytics/page.js`
    - Remove imports for `RiskAssessmentChart` and `RiskScoringChart`
    - Add `import RiskIntelligenceSection from "@/components/admin/RiskIntelligenceSection"`
    - Destructure `riskIntelligence` from `useDashboardData()`
    - In the two-column grid that currently holds `<TrendChart>` and `<RiskAssessmentChart>`, replace `<RiskAssessmentChart>` with `<RiskIntelligenceSection riskIntelligence={riskIntelligence} />`
    - Remove the standalone `<RiskScoringChart riskScoring={riskScoring} />` row entirely
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- `riskPriority` and `riskScoring` are preserved in the hook return value so no other consumer breaks
- Property tests require `fast-check` — install with `npm install --save-dev fast-check` if not already present
- Scoring functions are co-located in `useDashboardData.js` (above `fetchDashboard`) as the design recommends; they can be moved to `utils.js` later without changing any other file

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4", "3.5"] },
    { "id": 5, "tasks": ["5.1", "6.1"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["8.1"] }
  ]
}
```
