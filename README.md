# Sab'ta Soya Climate
### Climate-Resilient Sanitation Monitoring & Emergency Response System — Northern Ghana

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Mapping-199900?logo=leaflet)](https://leafletjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-UI-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Executive Summary

SaniTrack Climate is a geospatial intelligence and incident response platform purpose-built for sanitation infrastructure monitoring in climate-vulnerable regions of Northern Ghana. The system provides district officers, NGO field teams, health authorities, and community agents with a unified operational picture — combining real-time GIS mapping, sanitation incident reporting, climate event tracking, and field worker coordination into a single deployable web application. Designed to operate in low-bandwidth environments and align with UNICEF WASH programme standards, SaniTrack Climate transforms fragmented, paper-based sanitation data into actionable intelligence that protects children's health and strengthens community resilience against floods, droughts, and contamination events.

---

## Problem Statement

Northern Ghana faces a compounding public health crisis at the intersection of climate change and inadequate sanitation infrastructure. The region experiences increasingly severe flood and drought cycles that systematically destroy latrines, contaminate water sources, and render school sanitation facilities non-functional — disproportionately affecting children under five and school-age girls.

Key data points framing the problem:

- **Open defecation rates** in Northern Ghana remain among the highest in West Africa, with rural coverage for improved sanitation below 15% in some districts (WHO/UNICEF JMP, 2023).
- **Flood events** in the Upper East and Upper West regions have increased in frequency by over 40% in the past decade, with each event destroying an estimated 20–35% of community latrine infrastructure.
- **No real-time monitoring system** exists at the district level to track sanitation asset status, report contamination events, or coordinate emergency WASH response.
- **School WASH gaps** leave millions of children without access to functional toilets during and after climate events, driving absenteeism — particularly among adolescent girls.
- **Response lag** between incident occurrence and field team deployment averages 72–96 hours due to manual, phone-based reporting chains.

The absence of geospatial situational awareness means that district health officers and NGO partners are making resource allocation decisions without reliable, current data — a gap SaniTrack Climate is designed to close.

---

## Solution Overview

SaniTrack Climate provides a layered operational platform with four core capabilities:

1. **Geospatial Infrastructure Registry** — A live GIS map of sanitation assets (latrines, water points, schools, community facilities) with status indicators, enabling district-level visibility of infrastructure health at a glance.

2. **Real-Time Incident Reporting** — Field agents and community reporters submit sanitation incidents (structural damage, contamination, overflow, non-functionality) directly through the platform. Reports are geotagged, severity-classified, and immediately visible to response coordinators.

3. **Field Worker Tracking & Dispatch** — GPS-enabled live tracking of field workers and response teams on the operational map, with route history and navigation support for efficient deployment to incident sites.

4. **Climate Event & Risk Dashboard** — Aggregated view of active climate events (floods, droughts, contamination alerts) overlaid on infrastructure data, enabling risk prioritization and pre-emptive resource positioning.

The system is role-aware, serving nine distinct user types from community agents to national administrators, with access controls enforced at both the application and database layers.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│   │  GIS Map UI  │   │  Dashboards  │   │  Mobile / PWA    │   │
│   │  (Leaflet +  │   │  (Role-based │   │  (Responsive     │   │
│   │   Next.js)   │   │   views)     │   │   Tailwind UI)   │   │
│   └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘   │
│          └──────────────────┴────────────────────┘             │
│                             │                                   │
│              Next.js App Router (SSR + CSR)                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS / WebSocket
┌─────────────────────────────▼───────────────────────────────────┐
│                      BACKEND LAYER (Supabase)                   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Auth &     │  │  PostgreSQL  │  │  Realtime Engine       │ │
│  │  Profiles   │  │  Database    │  │  (WebSocket pub/sub)   │ │
│  │  (JWT/RLS)  │  │  (PostGIS)   │  │  incidents · workers   │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐                             │
│  │  Storage    │  │  Row-Level   │                             │
│  │  (Images,   │  │  Security    │                             │
│  │   Reports)  │  │  Policies    │                             │
│  └─────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      DATA SOURCES                               │
│                                                                 │
│   OpenStreetMap tiles · GPS device streams · Field agent        │
│   mobile submissions · District health records                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data flow:** Field agents submit incidents or GPS positions via the web client. Supabase Realtime broadcasts changes over WebSocket to all connected dashboards simultaneously — no polling, no refresh required. Row-Level Security (RLS) policies ensure each role sees only the data they are authorized to access.

---

## Key Features

### GIS Risk Mapping
- Interactive Leaflet map centered on Northern Ghana with OpenStreetMap base tiles
- Toggleable layers: sanitation infrastructure, community boundaries, active incidents, field worker positions, geofenced zones
- Location deep-linking via URL parameters (`?lat=&lng=&name=`) for shareable incident coordinates
- Pinnable locations and turn-by-turn navigation routing for field deployment
- Severity-coded incident markers (Critical / High / Medium / Low) with visual clustering

### Real-Time Incident Reporting
- Geotagged sanitation incident submission with severity classification
- Incident types: structural damage, contamination, overflow, non-functionality, climate-related destruction
- Supabase Realtime subscriptions push new reports to all active dashboards within seconds
- Incident history panel with filtering by severity, location, and time window
- Photo attachment support via Supabase Storage

### Field Worker Tracking & Dispatch
- Live GPS tracking of field workers and response teams on the operational map
- Route history visualization (polyline trail) for accountability and coverage analysis
- Worker status indicators and last-known position timestamps
- Floating action button (FAB) for rapid worker panel access on mobile
- Tracking can be started/stopped by the worker; position updates are streamed in real time

### School Sanitation Monitoring
- Dedicated school layer showing WASH facility status per institution
- Headteacher role with scoped access to submit and view school-specific reports
- Tracks functional toilet count, handwashing facility status, and menstrual hygiene management (MHM) infrastructure
- Flags schools at risk during active climate events in the surrounding area

### Climate Event Tracking
- Log and visualize active climate events (floods, droughts, contamination plumes) on the map
- Associate infrastructure damage reports with specific climate events for impact attribution
- Timeline view of event progression and affected asset count
- Alert propagation to relevant district officers and NGO coordinators

### Role-Based Authority Dashboard
- Separate dashboard views for Admin, District Officer, NGO, and Operator roles
- Aggregate statistics: total incidents, active response teams, infrastructure at risk, open reports
- Exportable data for district health reporting and donor accountability
- Audit trail of all report submissions and status changes

---

## Data Model

| Table | Purpose |
|---|---|
| `profiles` | User accounts with role assignment, linked to Supabase Auth |
| `locations` | Sanitation infrastructure assets (latrines, water points, facilities) with coordinates and operational status |
| `communities` | Community boundaries and demographic metadata for geofenced zones |
| `sanitation_reports` | Field-submitted incident reports with severity, type, geolocation, and media attachments |
| `climate_events` | Logged climate events (floods, droughts, contamination) with affected area geometry |
| `schools` | School registry with WASH facility inventory and current operational status |
| `water_sources` | Water point registry with quality status, type, and contamination risk flags |
| `user_locations` | Real-time GPS position stream for field worker tracking and route history |

All geospatial data is stored as coordinate pairs compatible with PostGIS extension queries. Row-Level Security policies on Supabase enforce data access boundaries per role at the database layer — not just the application layer.

---

## User Roles & Permissions

| Role | Access Scope |
|---|---|
| `admin` | Full system access — user management, all data, configuration |
| `district_officer` | District-scoped read/write on incidents, locations, climate events, and reports |
| `health_officer` | Read access to all health-relevant data; can submit and close sanitation reports |
| `ngo` | Read access to locations and incidents; can submit reports and view field worker positions |
| `response_team` | GPS tracking enabled; can update incident status and log field actions |
| `operator` | Submit and manage sanitation reports for assigned locations |
| `headteacher` | School-scoped access — submit and view WASH reports for their institution |
| `community_agent` | Submit incident reports and view local infrastructure status |
| `visitor` | Read-only access to public map layers; no submission capability |

Role assignment is managed in the `profiles` table and enforced via Supabase RLS policies. The application layer additionally gates UI routes and components by role using the `AuthContext`.

---

## Technology Stack

| Technology | Role | Rationale |
|---|---|---|
| **Next.js 15** | Frontend framework | App Router enables hybrid SSR/CSR rendering — critical pages load fast even on slow connections; dynamic imports keep the Leaflet bundle client-only |
| **Supabase** | Backend, Auth, Database, Storage, Realtime | Eliminates the need for a custom API server; built-in Realtime WebSocket engine powers live incident and worker tracking without additional infrastructure |
| **PostgreSQL (via Supabase)** | Relational database | Mature, reliable, PostGIS-compatible; RLS policies enforce multi-tenant data isolation at the database layer |
| **Leaflet + OpenStreetMap** | GIS mapping | Open-source, lightweight, and works offline with tile caching — appropriate for low-bandwidth field environments; no API key or usage cost |
| **Tailwind CSS** | UI styling | Utility-first approach enables rapid, consistent UI development; responsive design is first-class, supporting both desktop dashboards and mobile field use |

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- A Supabase project (free tier sufficient for development)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Abdulai059/Santrack-fontend.git
cd Santrack-fontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and populate with your Supabase project credentials:

```bash
cp .env.example .env.local
```

See the [Environment Variables](#environment-variables) section below.

### 4. Set up the database

In your Supabase project, run the SQL migrations in `/supabase/migrations/` (in order) to create all required tables, RLS policies, and realtime publication settings.

Enable Realtime on the following tables in the Supabase dashboard:
- `sanitation_reports`
- `user_locations`
- `climate_events`

### 5. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 6. Production build

```bash
npm run build
npm start
```

The project is pre-configured for deployment on Vercel (`.vercel/project.json` included).

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: for server-side operations requiring elevated privileges
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Security note:** Never commit `.env` or `.env.local` to version control. The `.gitignore` in this repository excludes all `.env*` files by default. The `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client — use it only in server-side API routes or edge functions.

---

## Roadmap

The current system establishes the core operational platform. The following capabilities are planned for subsequent development phases:

**Phase 2 — Intelligence Layer**
- AI/ML risk prediction model: classify communities by flood/drought risk using historical climate data and infrastructure density
- Automated alert generation when climate event boundaries intersect with high-density sanitation infrastructure zones
- Predictive maintenance scoring for aging latrine infrastructure

**Phase 3 — Offline & Low-Connectivity Access**
- SMS/USSD incident reporting interface for feature phone users and areas without internet access
- Progressive Web App (PWA) with offline map tile caching and queued report submission
- WhatsApp Bot integration for community-level incident submission

**Phase 4 — Sensor Integration**
- IoT sensor integration for water quality monitoring (turbidity, pH, E. coli indicators)
- Automated contamination alerts triggered by sensor threshold breaches
- Integration with Ghana Meteorological Agency (GMet) API for real-time weather and flood warning data

**Phase 5 — Interoperability**
- DHIS2 data export for integration with Ghana Health Service national reporting systems
- OpenStreetMap contribution pipeline for verified infrastructure data
- API endpoints for third-party NGO and government system integration

---

## Impact

SaniTrack Climate directly addresses three of the most critical gaps in Northern Ghana's public health infrastructure:

**Child Health Protection**
Real-time visibility of school WASH facility status enables district health officers to prioritize repairs and ensure children have access to functional sanitation — reducing diarrheal disease transmission and keeping girls in school.

**Climate Resilience**
By mapping the intersection of climate events and sanitation infrastructure in real time, the platform enables pre-emptive resource positioning before floods peak — reducing the window between infrastructure failure and response from days to hours.

**WASH System Accountability**
A permanent, auditable record of infrastructure status, incident reports, and response actions creates the data foundation for evidence-based WASH investment decisions by district governments and international donors.

---

## Hackathon Alignment

**UNICEF Programme Areas**
- WASH (Water, Sanitation and Hygiene) — core programme alignment
- Climate and Environment — direct response to climate-driven sanitation risk
- Child Survival and Development — school WASH monitoring protects child health outcomes

**Sustainable Development Goals**
- **SDG 6** — Clean Water and Sanitation: real-time monitoring of sanitation infrastructure access
- **SDG 3** — Good Health and Well-Being: reducing disease burden from sanitation failure
- **SDG 13** — Climate Action: building community resilience to climate-driven WASH disruption
- **SDG 11** — Sustainable Cities and Communities: geospatial tools for resilient infrastructure planning

**Innovation Criteria**
- Open-source stack with zero proprietary licensing costs — deployable by any district government or NGO
- Designed for the actual operational context: low-bandwidth, mobile-first, multi-role
- Bridges the gap between community-level reporting and district-level decision-making in a single platform

---

## Contributing

This project was developed as part of a climate-tech hackathon and is open for contributions. Please open an issue before submitting a pull request for significant changes. All contributions should align with the project's public health and climate resilience mission.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*SaniTrack Climate — Built for the communities that need it most.*
