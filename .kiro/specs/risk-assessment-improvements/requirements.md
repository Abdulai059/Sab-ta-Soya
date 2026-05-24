# Requirements Document

## Introduction

This feature replaces the two existing risk visualisation components on the Santrack admin analytics dashboard — `RiskAssessmentChart` (donut + resolution gauge) and `RiskScoringChart` (horizontal bar chart) — with a single, unified **Risk Intelligence Section**. The new section introduces a weighted composite risk score per report, incorporates `affected_children_count` as an additional weighted factor, and surfaces both aggregate statistics and an actionable top high-risk reports list so administrators can prioritise interventions immediately.

## Glossary

- **Dashboard**: The admin analytics page rendered at `app/(dashboard)/admin/analytics/page.js`.
- **Risk Intelligence Section**: The new unified UI section that replaces `RiskAssessmentChart` and `RiskScoringChart`.
- **Composite Risk Score**: A numeric value computed per risk assessment row as the weighted sum of all boolean risk flags plus a weighted contribution from `affected_children_count`.
- **Risk Tier**: A colour-coded classification derived from the Composite Risk Score. Four tiers are defined: Critical, High, Medium, and Low.
- **Risk Factor**: One of the six boolean fields on a `risk_assessments` row: `near_school`, `near_water_source`, `flood_zone`, `drought_zone`, `repeated_incident`, `escalation_required`.
- **Affected Children Weight**: The per-child point contribution applied to `affected_children_count` when computing the Composite Risk Score.
- **Aggregate Stats Panel**: The upper sub-section of the Risk Intelligence Section displaying summary statistics across all assessed reports.
- **Top High-Risk Reports List**: The lower sub-section listing the 5–10 individual reports with the highest Composite Risk Scores.
- **useDashboardData**: The React Query hook in `components/admin/useDashboardData.js` responsible for fetching and transforming dashboard data.
- **PRIORITY_COLORS**: The colour map defined in `components/admin/constants.js` mapping priority levels to hex colour values.

---

## Requirements

### Requirement 1: Composite Risk Score Computation

**User Story:** As an admin, I want each risk assessment to carry a single numeric score that reflects all contributing factors, so that I can compare reports on a consistent scale.

#### Acceptance Criteria

1. THE `useDashboardData` hook SHALL compute a Composite Risk Score for each `risk_assessments` row using the following factor weights: `near_school` = 15 pts, `near_water_source` = 15 pts, `flood_zone` = 10 pts, `drought_zone` = 10 pts, `repeated_incident` = 10 pts, `escalation_required` = 5 pts.
2. WHEN `affected_children_count` is greater than 0, THE `useDashboardData` hook SHALL add `affected_children_count × 2` points to the Composite Risk Score for that row, capped at a maximum contribution of 20 points.
3. IF a `risk_assessments` row contains no boolean flags set to true and `affected_children_count` equals 0, THEN THE `useDashboardData` hook SHALL assign a Composite Risk Score of 0 to that row.
4. THE `useDashboardData` hook SHALL assign a Risk Tier to each row according to the following thresholds: Composite Risk Score ≥ 50 → Critical; 30–49 → High; 15–29 → Medium; 0–14 → Low.
5. THE `useDashboardData` hook SHALL expose the computed scores and tiers as part of the returned data object without altering the existing `riskPriority` or `riskScoring` fields, so that no other dashboard component is broken.

---

### Requirement 2: Aggregate Stats Panel

**User Story:** As an admin, I want a summary view of score distribution, average score, and children-at-risk count, so that I can understand the overall risk landscape at a glance.

#### Acceptance Criteria

1. THE Risk Intelligence Section SHALL display the Aggregate Stats Panel as the upper sub-section, rendered before the Top High-Risk Reports List.
2. THE Aggregate Stats Panel SHALL display the count of assessed reports in each Risk Tier (Critical, High, Medium, Low) using the corresponding colour from `PRIORITY_COLORS`.
3. THE Aggregate Stats Panel SHALL display the average Composite Risk Score across all assessed reports in the current 30-day window, rounded to one decimal place.
4. THE Aggregate Stats Panel SHALL display the total `affected_children_count` summed across all assessed reports in the current 30-day window.
5. WHEN the 30-day window contains zero assessed reports, THE Aggregate Stats Panel SHALL display a "No risk data yet" message in place of all numeric values.

---

### Requirement 3: Top High-Risk Reports List

**User Story:** As an admin, I want to see the highest-scoring individual reports listed below the aggregate stats, so that I can act on the most critical cases immediately.

#### Acceptance Criteria

1. THE Risk Intelligence Section SHALL display the Top High-Risk Reports List as the lower sub-section, rendered after the Aggregate Stats Panel.
2. THE Top High-Risk Reports List SHALL display between 5 and 10 reports, sorted in descending order by Composite Risk Score, with ties broken by descending `affected_children_count`.
3. WHEN fewer than 5 assessed reports exist in the 30-day window, THE Top High-Risk Reports List SHALL display all available reports without padding.
4. THE Top High-Risk Reports List SHALL display the following fields for each entry: report identifier, Composite Risk Score, Risk Tier badge (colour-coded using `PRIORITY_COLORS`), `affected_children_count`, and the active Risk Factors as a compact tag list.
5. THE `useDashboardData` hook SHALL fetch the `report_id` field from the `risk_assessments` table and include it in the data exposed to the Top High-Risk Reports List.
6. WHEN an admin clicks a report entry in the Top High-Risk Reports List, THE Dashboard SHALL navigate to the report detail page at `/reports/[id]`.

---

### Requirement 4: Unified Risk Intelligence Section Layout

**User Story:** As an admin, I want the risk section to be a single cohesive panel rather than two separate charts, so that the dashboard feels organised and the risk story is told in one place.

#### Acceptance Criteria

1. THE Dashboard SHALL remove the `RiskAssessmentChart` component and the `RiskScoringChart` component from the analytics page layout.
2. THE Dashboard SHALL render a single `RiskIntelligenceSection` component in the position previously occupied by the two removed components.
3. THE `RiskIntelligenceSection` component SHALL be placed within the existing `max-w-[1400px]` page container and SHALL be responsive across mobile (single-column) and desktop (multi-column) breakpoints.
4. THE `RiskIntelligenceSection` component SHALL use the `Card` and `CardTitle` primitives from `components/admin/DashboardCard.js` to maintain visual consistency with the rest of the dashboard.
5. WHILE data is loading, THE Dashboard SHALL display the existing `DashboardSkeleton` component in place of the Risk Intelligence Section, with no layout shift upon data arrival.

---

### Requirement 5: Scoring Weight Configurability

**User Story:** As a developer, I want the scoring weights defined in a single constants location, so that future adjustments require changes in only one place.

#### Acceptance Criteria

1. THE `useDashboardData` hook SHALL read all Risk Factor point values and the Affected Children Weight from a dedicated `RISK_WEIGHTS` constant exported from `components/admin/constants.js`.
2. WHEN the `RISK_WEIGHTS` constant is updated, THE `useDashboardData` hook SHALL automatically apply the new weights to all Composite Risk Score computations without requiring changes to any other file.
3. THE `RISK_WEIGHTS` constant SHALL define weights for all six Risk Factors and the per-child weight, with the initial values: `near_school` = 15, `near_water_source` = 15, `flood_zone` = 10, `drought_zone` = 10, `repeated_incident` = 10, `escalation_required` = 5, `per_child` = 2, `per_child_cap` = 20.
