# Requirements Document

## Introduction

The Santrack admin analytics page (`/admin/analytics`) currently contains several data correctness issues that cause metrics, charts, and labels to display inaccurate or misleading information. This feature addresses nine identified bugs across the `useDashboardData` hook, the analytics page component, and the `RiskComplianceWidget` component. The goal is to ensure every number, label, and chart on the analytics page faithfully represents the underlying Supabase data.

## Glossary

- **Analytics_Page**: The Next.js page rendered at `/admin/analytics` (`app/(dashboard)/admin/analytics/page.js`).
- **Dashboard_Hook**: The `useDashboardData` custom hook in `components/admin/useDashboardData.js` that fetches and transforms Supabase data for the analytics page.
- **Open_Incident**: A sanitation report whose status is `pending`, `assigned`, or `in_progress` — i.e., any report that has not yet reached a terminal state (`disposed`, `verified`, or `cancelled`).
- **Resolved_Report**: A sanitation report whose status is `disposed` or `verified`.
- **Terminal_Status**: One of `disposed`, `verified`, or `cancelled` — statuses from which no further workflow action is expected.
- **Active_Status**: One of `pending`, `assigned`, or `in_progress` — statuses representing work still in progress.
- **Resolution_Rate**: The percentage of all-time reports (or reports within a defined window) that have reached a Resolved_Report status.
- **Sanitation_Health_Score**: The visual score bar displayed on the analytics page representing the Resolution_Rate.
- **Assessment_Avg_Marker**: The dashed marker on the Sanitation_Health_Score bar that provides a secondary reference point for comparison.
- **STATUS_MAP**: The array in `analytics/page.js` that maps status keys to display names and colors for the Response Status Breakdown donut chart.
- **STATUS_CONFIG**: The authoritative status configuration array in `components/admin/constants.js`, which includes six statuses: `pending`, `assigned`, `in_progress`, `disposed`, `verified`, `cancelled`.
- **RiskComplianceWidget**: The component in `components/admin/RiskComplianceWidget.js` that renders the Risk Assessment Breakdown donut, the Resolution Rate gauge, and the Recent Alerts panel.
- **Resolution_Rate_Gauge**: The half-donut gauge inside `RiskComplianceWidget` that shows the breakdown of `verified`, `disposed`, and `cancelled` report counts.
- **Recent_Alerts_Panel**: The panel inside `RiskComplianceWidget` that lists the most recently created sanitation reports.
- **Metric_Card**: One of the four summary cards at the top of the Analytics_Page showing Total Reports, Open Incidents, Resolved, and Avg Response.
- **Avg_Response_Time**: The average number of hours between `created_at` and `updated_at` for reports that have reached a terminal state.

---

## Requirements

### Requirement 1: Open Incidents Count Includes All Active Statuses

**User Story:** As an admin, I want the "Open Incidents" metric card to reflect all reports that are still being worked on, so that I can accurately understand the current workload.

#### Acceptance Criteria

1. THE Dashboard_Hook SHALL define Open_Incident as any report whose status is `pending`, `assigned`, or `in_progress`.
2. WHEN the Dashboard_Hook computes `metrics.open`, THE Dashboard_Hook SHALL count all reports matching any Active_Status.
3. WHEN the Dashboard_Hook computes `metrics.openSinceYesterday`, THE Dashboard_Hook SHALL count all reports created since yesterday whose status is any Active_Status, including every matching report regardless of how many exist.
4. THE Analytics_Page SHALL display `metrics.open` in the "Open Incidents" Metric_Card.

---

### Requirement 2: Sanitation Health Score Uses a Clearly Defined Resolution Rate

**User Story:** As an admin, I want the Sanitation Health Score bar to show a meaningful and clearly labelled resolution rate, so that I can assess overall sanitation performance at a glance.

#### Acceptance Criteria

1. THE Analytics_Page SHALL compute `scorePct` as `Math.round((metrics.resolved / metrics.total) * 100)` where `metrics.total` is the count of reports fetched within the configured time window.
2. THE Securitychart component SHALL label the score marker as "RESOLUTION RATE" (already correct — this criterion confirms the label must not be changed to a different term).
3. WHEN `metrics.total` is zero, THE Analytics_Page SHALL set `scorePct` to `0` to avoid division-by-zero. WHEN `metrics.resolved` exceeds `metrics.total` due to data inconsistency, THE Analytics_Page SHALL allow the calculation to proceed and display the mathematically correct percentage.
4. THE Analytics_Page SHALL display a subtitle beneath the Sanitation_Health_Score bar that states the time window used (e.g., "Last 30 days").

---

### Requirement 3: Assessment Avg Marker Is Accurately Labelled

**User Story:** As an admin, I want the dashed "Assessment Avg" marker on the health score bar to represent a meaningful and correctly labelled metric, so that I am not misled by a confusingly named data point.

#### Acceptance Criteria

1. THE Dashboard_Hook SHALL compute a `weeklyResolutionRate` as `Math.round((resolvedInLastWeek / Math.max(totalInLastWeek, 1)) * 100)`.
2. THE Analytics_Page SHALL pass `weeklyResolutionRate` to the `assessmentAvgPct` prop of the Securitychart component.
3. THE Securitychart component SHALL label the dashed marker "WEEKLY RATE" instead of "ASSESSMENT AVG" to accurately describe what the value represents.
4. WHEN `totalInLastWeek` is zero, THE Dashboard_Hook SHALL set `weeklyResolutionRate` to `0`.

---

### Requirement 4: Response Status Breakdown Chart Includes All Six Statuses

**User Story:** As an admin, I want the Response Status Breakdown donut chart to show all possible report statuses, so that I can see the complete distribution of reports across the workflow.

#### Acceptance Criteria

1. THE Analytics_Page STATUS_MAP SHALL include entries for all six statuses defined in STATUS_CONFIG: `pending`, `assigned`, `in_progress`, `disposed`, `verified`, and `cancelled`.
2. WHEN the Analytics_Page builds `sprsData`, THE Analytics_Page SHALL include a data point for the `assigned` status with a distinct color.
3. THE Analytics_Page SHALL derive STATUS_MAP entries from STATUS_CONFIG so that any future status additions in constants are automatically reflected in the chart.
4. WHEN a status has a count of zero, THE Analytics_Page SHALL still include it in `sprsData` with a value of `0` so the legend remains consistent; the donut chart SHALL render zero-value segments as invisible (zero-length arc) while still showing the status in the legend.

---

### Requirement 5: Recent Alerts Panel Shows a Meaningful Number of Reports

**User Story:** As an admin, I want the Recent Alerts panel to show enough recent reports to be useful, so that I can quickly identify the latest sanitation incidents.

#### Acceptance Criteria

1. THE Dashboard_Hook `fetchRecentReports` function SHALL fetch the most recent 10 sanitation reports ordered by `created_at` descending.
2. THE RiskComplianceWidget Recent_Alerts_Panel SHALL render up to 10 alert items when data is available.
3. WHEN fewer than 10 reports exist in the database, THE Recent_Alerts_Panel SHALL render all available reports.
4. IF no reports exist, THEN THE Recent_Alerts_Panel SHALL display the message "No recent reports".

---

### Requirement 6: Total and Open Metrics Scope Is Clearly Communicated

**User Story:** As an admin, I want to know whether the Total Reports and Open Incidents counts reflect all-time data or a rolling window, so that I can correctly interpret the numbers.

#### Acceptance Criteria

1. THE Analytics_Page SHALL display a visible label near the "Total Reports" and "Open Incidents" Metric_Cards indicating the active time window (e.g., "Last 30 days").
2. WHERE a configurable time window is supported, THE Dashboard_Hook SHALL accept a `windowDays` parameter (defaulting to `30`) that controls the `fetchReports` date filter.
3. WHEN `windowDays` changes, THE Dashboard_Hook SHALL re-fetch reports using the new window.
4. THE Analytics_Page SHALL pass the active `windowDays` value to the Dashboard_Hook and display it in the scope label.

---

### Requirement 7: Average Response Time Includes All Terminal-Status Reports

**User Story:** As an admin, I want the "Avg Response" metric to reflect the response time across all closed reports including cancelled ones, so that the average is not artificially skewed by excluding a subset of terminal statuses.

#### Acceptance Criteria

1. THE Dashboard_Hook `buildMetrics` function SHALL compute `avgResponseHours` using all reports whose status is any Terminal_Status (`disposed`, `verified`, or `cancelled`).
2. WHEN computing `avgResponseHours`, THE Dashboard_Hook SHALL only include reports where `updated_at` is after `created_at` (response time is positive).
3. WHEN no terminal-status reports exist, THE Dashboard_Hook SHALL set `avgResponseHours` to `0`.
4. THE Analytics_Page SHALL display `avgResponseHours` in the "Avg Response" Metric_Card with an "h" suffix.

---

### Requirement 8: Risk Assessment Breakdown Donut Displays Accurate Percentages

**User Story:** As an admin, I want the Risk Assessment Breakdown donut chart to show the real percentage for each priority level, so that I can correctly assess the distribution of risk across assessments.

#### Acceptance Criteria

1. THE RiskComplianceWidget DonutChart component SHALL compute the center label as the percentage of the currently selected or dominant segment relative to the total of all segments.
2. THE RiskComplianceWidget DonutChart component SHALL NOT hardcode the center text as "100%".
3. WHEN all segment values are zero, THE RiskComplianceWidget DonutChart component SHALL display "0%" in the center.
4. THE Analytics_Page SHALL pass `riskPriority` data to `widgetData.donut` such that each entry's `value` is the raw count of assessments at that priority level, and the DonutChart SHALL compute percentages internally.

---

### Requirement 9: Resolution Rate Gauge Labels Are Semantically Correct

**User Story:** As an admin, I want the Resolution Rate gauge labels to accurately describe what each segment represents, so that I am not confused by mismatched status names and UI labels.

#### Acceptance Criteria

1. THE Analytics_Page `widgetData.gauge` SHALL map `gauge.compliant` to the count of reports with status `verified`.
2. THE Analytics_Page `widgetData.gauge` SHALL map `gauge.pending` to the count of reports with status `disposed`.
3. THE Analytics_Page `widgetData.gauge` SHALL map `gauge.nonCompliant` to the count of reports with status `cancelled`.
4. THE RiskComplianceWidget GAUGE_FILTERS SHALL use labels that match the status they represent: `verified` → "Verified", `disposed` → "Disposed", `cancelled` → "Cancelled".
5. THE RiskComplianceWidget stat display beneath the gauge SHALL label each row with the correct status name: "Verified", "Disposed", and "Cancelled" respectively.
6. WHEN a gauge segment is selected via the filter buttons, THE RiskComplianceWidget SHALL display the percentage of that segment relative to the total of all three segments in the gauge center.
