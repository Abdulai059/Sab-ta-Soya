# Requirements Document

## Introduction

SaniTrack Climate is a climate-resilient sanitation monitoring platform built for Northern Ghana, developed for the UNICEF Startup Lab hackathon under the theme "Safely Managed Sanitation." The current codebase has a fully operational GIS map, incident reporting system, and admin analytics dashboard, but five role-based dashboards (district-officer, health-officer, ngo, operator, community-officer) serve only hardcoded placeholder data. Additionally, the climate events table, schools table, and sanitation value chain concept have no corresponding UI.

This feature set closes those gaps by delivering five interconnected capabilities evaluated against the hackathon criteria of Innovation, Scalability, Impact, Feasibility, Climate Resilience, and Differentiation:

1. **Live Role-Based Dashboards** — wire all five stub dashboards to real Supabase queries
2. **Climate Risk Alert System** — UI for logging climate events and propagating alerts
3. **Sanitation Value Chain Tracker** — visual pipeline status per community
4. **School WASH Monitor** — school sanitation status with climate-event flags
5. **Community Behavior Change Module** — open defecation tracking and pledge progress

All features are implemented in Next.js 15 App Router using the existing `supabase` client, `@tanstack/react-query` for data fetching, Tailwind CSS for styling, and the established RBAC system in `lib/permissions.js`.

---

## Glossary

- **Dashboard**: A role-scoped page under `app/(dashboard)/[role]/page.js` that displays live operational metrics for a specific user role.
- **Supabase**: The PostgreSQL-backed backend service providing database, authentication, Row-Level Security (RLS), and Realtime WebSocket capabilities.
- **RLS**: Row-Level Security — Supabase database policies that restrict data access per authenticated user role at the database layer.
- **RBAC**: Role-Based Access Control — the permission system defined in `lib/permissions.js` that gates UI routes and components by role.
- **Climate Event**: A record in the `climate_events` table representing a discrete climate hazard (flood, drought, heavy rain, windstorm, contamination) affecting a geographic area.
- **Climate Alert**: A UI notification derived from an active Climate Event, surfaced on role-specific dashboards and the GIS map.
- **Sanitation Value Chain**: The sequential stages through which human waste is safely managed: Capture → Containment → Emptying → Transport → Treatment → Disposal.
- **Chain Stage**: One of the six stages of the Sanitation Value Chain, each with a status (operational, degraded, failed, unknown) per community.
- **School WASH**: Water, Sanitation, and Hygiene facilities at a school, tracked via the `schools` table — including functional toilet count, handwashing station status, and MHM (Menstrual Hygiene Management) infrastructure.
- **MHM**: Menstrual Hygiene Management — the availability of private, functional facilities for adolescent girls at schools.
- **Open Defecation (OD)**: The practice of defecating in open spaces rather than designated sanitation facilities; tracked as a community-level behavior change indicator.
- **Community Pledge**: A recorded commitment by a community or community group to eliminate open defecation and adopt improved sanitation practices.
- **Behavior Change Progress**: A composite metric per community reflecting the reduction in OD reports and increase in pledge fulfillment over time.
- **District Officer**: A user with role `district_officer` responsible for district-wide sanitation oversight.
- **Health Officer**: A user with role `health_officer` responsible for health-risk monitoring and sanitation inspections.
- **NGO**: A user with role `ngo` representing a partner organization tracking project reach and impact.
- **Operator**: A user with role `operator` responsible for managing and resolving assigned sanitation reports.
- **Community Officer**: A user with role `community_officer` responsible for community-level field reporting and behavior change facilitation.
- **useQuery Hook**: The `@tanstack/react-query` hook used throughout the codebase for data fetching with caching and background refetch.
- **Realtime Subscription**: A Supabase WebSocket channel established via `lib/realtime.js` that pushes database change events to the client without polling.
- **QueryClient**: The `@tanstack/react-query` client instance in `lib/queryClient.js` used to invalidate cached queries on realtime events.

---

## Requirements

### Requirement 1: Live Role-Based Dashboards

**User Story:** As a district officer, health officer, NGO partner, operator, or community officer, I want my dashboard to display real counts and recent activity drawn from the live database, so that I can make informed operational decisions without relying on stale placeholder data.

#### Acceptance Criteria

1. WHEN the District Officer Dashboard page loads, THE Dashboard SHALL query the `sanitation_reports` table and display the total report count, active (pending) case count, response rate percentage, and district coverage percentage scoped to the authenticated user's district.

2. WHEN the Health Officer Dashboard page loads, THE Dashboard SHALL query the `sanitation_reports` table filtered by `health_risk = true` and display the active health-risk report count, the count of inspections completed in the current calendar month, and the count of reports resolved in the current calendar month.

3. WHEN the NGO Dashboard page loads, THE Dashboard SHALL query the `sanitation_reports` table and the `communities` table and display the count of active NGO-linked projects, the total number of beneficiaries reached across associated communities, and a computed impact score based on the ratio of resolved to total reports.

4. WHEN the Operator Dashboard page loads, THE Dashboard SHALL query the `sanitation_reports` table filtered to reports assigned to the authenticated operator and display the total assigned incident count for the current month, the count of reports with status `pending` or `assigned`, and the count of reports resolved today.

5. WHEN the Community Officer Dashboard page loads, THE Dashboard SHALL query the `sanitation_reports` table filtered by the authenticated user's community and display the count of reports filed this month, the count of reports with pending actions, and the count of reports resolved today.

6. WHILE a dashboard is displayed, THE Dashboard SHALL refresh its displayed metrics automatically when a new record is inserted or updated in the `sanitation_reports` table via a Supabase Realtime subscription, without requiring a full page reload.

7. WHEN a Supabase query returns an error during dashboard load, THE Dashboard SHALL display an error state message identifying which data failed to load, and SHALL provide a retry action that re-executes the failed query.

8. WHILE a dashboard query is in flight, THE Dashboard SHALL display a loading skeleton that matches the layout of the metric cards, preventing layout shift when data arrives.

9. THE Dashboard SHALL use the `useQuery` hook from `@tanstack/react-query` with query keys namespaced by role (e.g., `['dashboard', 'district-officer']`) to enable cache invalidation from Realtime subscription callbacks.

---

### Requirement 2: Climate Risk Alert System

**User Story:** As a district officer or health officer, I want to log active climate events and see which sanitation infrastructure is at risk, so that I can prioritize emergency response before conditions worsen.

#### Acceptance Criteria

1. WHEN a district officer or health officer navigates to the Climate Risk section, THE Climate Risk Alert System SHALL display a list of all active climate events from the `climate_events` table, showing event type, affected area, start date, and severity level.

2. WHEN a district officer submits a new climate event form with event type, affected community, severity, and description, THE Climate Risk Alert System SHALL insert a new record into the `climate_events` table and display a success confirmation within 3 seconds of submission.

3. IF the climate event form is submitted with any required field (event type, affected community, severity) left empty, THEN THE Climate Risk Alert System SHALL display an inline validation error on each empty required field and SHALL NOT submit the record to the database.

4. WHEN a new climate event record is inserted into the `climate_events` table, THE Climate Risk Alert System SHALL propagate a visible alert banner to the dashboards of all district officers and health officers currently viewing their dashboard pages, without requiring a page reload.

5. WHEN a climate event is active, THE Climate Risk Alert System SHALL display a count of sanitation infrastructure locations (from the `locations` table) within the affected community on the event detail view.

6. WHEN a district officer marks a climate event as resolved, THE Climate Risk Alert System SHALL update the event record status to `resolved` in the `climate_events` table and SHALL remove the corresponding alert banner from all active dashboard sessions within 5 seconds.

7. WHERE the GIS map is displayed, THE Climate Risk Alert System SHALL render active climate events as a distinct map layer with color-coded markers differentiated by event type (flood, drought, contamination, windstorm, heavy rain).

8. WHILE a climate event is active, THE Climate Risk Alert System SHALL display a highlighted warning indicator on the dashboards of community officers whose assigned community matches the affected community of the event.

---

### Requirement 3: Sanitation Value Chain Tracker

**User Story:** As a district officer or NGO partner, I want to see the operational status of each sanitation value chain stage per community, so that I can identify bottlenecks and direct resources to the weakest links in the chain.

#### Acceptance Criteria

1. WHEN a user with the `district_officer` or `ngo` role navigates to the Sanitation Value Chain Tracker, THE Value Chain Tracker SHALL display a visual pipeline for each community showing the six stages: Capture, Containment, Emptying, Transport, Treatment, and Disposal.

2. THE Value Chain Tracker SHALL render each stage as a distinct visual node with a status indicator using four states: operational (green), degraded (amber), failed (red), and unknown (grey).

3. WHEN the Value Chain Tracker loads, THE Value Chain Tracker SHALL derive stage status from the `sanitation_reports` table by mapping issue types to chain stages: reports with issue type `overflowing latrine` map to Containment, `blocked drain` maps to Transport, `contaminated water source` maps to Treatment, and unresolved reports of any type increment the failure risk score of their associated stage.

4. WHEN a user selects a specific community in the Value Chain Tracker, THE Value Chain Tracker SHALL filter the pipeline view to show only the chain stages and associated open reports for that community.

5. WHEN a chain stage has one or more unresolved reports linked to it, THE Value Chain Tracker SHALL display the count of open reports as a badge on that stage node and SHALL provide a drill-down action that navigates to the filtered reports list for that stage and community.

6. WHEN a chain stage status is `failed`, THE Value Chain Tracker SHALL visually break the pipeline connection between that stage and the next stage to indicate a chain disruption.

7. WHILE a climate event is active for a community, THE Value Chain Tracker SHALL display a climate risk overlay on all chain stages for that community, indicating that stage statuses may be affected by the ongoing event.

8. THE Value Chain Tracker SHALL update stage statuses without a full page reload when the underlying `sanitation_reports` data changes, using the existing `@tanstack/react-query` cache invalidation mechanism.

---

### Requirement 4: School WASH Monitor

**User Story:** As a health officer or district officer, I want to see the WASH facility status of schools in my district, so that I can ensure children have access to functional sanitation — especially during and after climate events.

#### Acceptance Criteria

1. WHEN a user with the `health_officer` or `district_officer` role navigates to the School WASH Monitor, THE School WASH Monitor SHALL display a list of all schools from the `schools` table, showing school name, community, functional toilet count, handwashing station status, and MHM facility status.

2. THE School WASH Monitor SHALL assign a status badge to each school using three levels: Adequate (all facilities functional), At Risk (one or more facilities degraded), and Critical (one or more facilities non-functional or absent).

3. WHEN a user applies a filter by community in the School WASH Monitor, THE School WASH Monitor SHALL display only schools belonging to the selected community within 500 milliseconds of filter selection.

4. WHILE a climate event is active for a community, THE School WASH Monitor SHALL display a climate risk flag on every school record belonging to that community, indicating potential facility impact from the ongoing event.

5. WHEN a headteacher submits a WASH status update for their school, THE School WASH Monitor SHALL update the corresponding record in the `schools` table and reflect the new status on the monitor view within 3 seconds.

6. WHEN the School WASH Monitor loads, THE School WASH Monitor SHALL display a summary row showing the total number of schools, the count of schools with Adequate status, the count of schools At Risk, and the count of schools in Critical status across the district.

7. IF the `schools` table returns zero records for the authenticated user's district, THEN THE School WASH Monitor SHALL display an empty state message indicating no school records are available and SHALL provide a link to the incident reporting form.

8. WHERE the GIS map is displayed, THE School WASH Monitor SHALL contribute a toggleable school layer showing school locations with status-coded markers (green, amber, red) matching the Adequate, At Risk, and Critical status levels.

---

### Requirement 5: Community Behavior Change Module

**User Story:** As a community officer or NGO partner, I want to track open defecation reports and community pledge progress per community, so that I can measure behavior change outcomes and report impact to stakeholders.

#### Acceptance Criteria

1. WHEN a user with the `community_officer` or `ngo` role navigates to the Community Behavior Change Module, THE Behavior Change Module SHALL display a list of communities showing, for each community: the count of open defecation reports in the last 30 days, the total number of community pledges recorded, and a behavior change progress indicator.

2. THE Behavior Change Module SHALL compute the behavior change progress indicator as the percentage reduction in open defecation reports over the trailing 30-day period compared to the preceding 30-day period, displayed as a percentage value with a directional trend arrow.

3. WHEN a community officer submits a new community pledge record with community name, pledge type, and participant count, THE Behavior Change Module SHALL insert the record into the database and display the updated pledge count for that community within 3 seconds.

4. IF the pledge submission form is submitted with the community name or participant count field empty, THEN THE Behavior Change Module SHALL display an inline validation error on each empty required field and SHALL NOT insert the record.

5. WHEN a community officer submits an open defecation report through the existing incident reporting form with issue type `Open defecation`, THE Behavior Change Module SHALL count that report in the OD report tally for the associated community on the next data refresh.

6. THE Behavior Change Module SHALL display a district-level summary showing the total OD report count across all communities, the total pledge count, and the aggregate behavior change progress percentage for the district.

7. WHEN a user selects a specific community in the Behavior Change Module, THE Behavior Change Module SHALL display a detail view showing the monthly OD report trend as a bar chart for the trailing 6 months and the list of recorded pledges with dates and participant counts.

8. WHILE a climate event is active for a community, THE Behavior Change Module SHALL display a contextual note on that community's row indicating that OD rates may be elevated due to the active climate event, to prevent misinterpretation of trend data.

9. THE Behavior Change Module SHALL use the existing `sanitation_reports` table to source OD report counts by filtering on `issue_type = 'Open defecation'`, requiring no new database tables for the core tracking functionality.
