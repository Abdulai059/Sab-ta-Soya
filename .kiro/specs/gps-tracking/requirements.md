# Requirements Document

## Introduction

Santrack is a sanitation field worker tracking system. The GPS tracking feature enables field workers (sanitation workers and operators) to broadcast their live location, while supervisory roles (admin, district officer, supervisor) can monitor all active workers on a map in real time.

The frontend implementation is complete. This feature spec covers the missing database layer: the `location_history` table, the trigger that populates it automatically from `user_locations` upserts, and the Row Level Security (RLS) policies that enforce access control for both tables. The deliverable is a single SQL migration file executable in the Supabase SQL editor.

## Glossary

- **Database**: The Supabase PostgreSQL database backing the Santrack application.
- **Migration**: A single SQL file containing all DDL and policy statements, executable in the Supabase SQL editor.
- **user_locations**: The existing table that stores each worker's current live position (one row per user, upserted on every GPS fix).
- **location_history**: The append-only table to be created, logging every GPS fix for route trail display.
- **Trigger**: A PostgreSQL trigger function that fires on INSERT or UPDATE of `user_locations` and appends a row to `location_history`.
- **RLS**: Row Level Security — Supabase/PostgreSQL mechanism that restricts which rows a database role can read or write.
- **Worker**: A user with role `sanitation_worker` or `operator` who actively broadcasts their GPS position.
- **Viewer**: A user with role `admin`, `district_officer`, or `supervisor` who has read-only access to all worker locations.
- **GPS Fix**: A single recorded position containing latitude, longitude, accuracy, heading, speed, and timestamp.
- **profiles**: The existing table containing user profiles, including the `role` column used for RLS policy evaluation.

## Requirements

### Requirement 1: location_history Table

**User Story:** As a system, I want an append-only log of every GPS fix, so that the frontend can display a worker's route trail for the current day.

#### Acceptance Criteria

1. THE Database SHALL contain a `location_history` table with columns: `id` (UUID primary key, default `gen_random_uuid()`), `user_id` (UUID, not null), `latitude` (double precision, not null), `longitude` (double precision, not null), `accuracy` (double precision), `heading` (double precision), `speed` (double precision), `timestamp` (timestamptz, not null), `created_at` (timestamptz, default `now()`).
2. THE `location_history` table SHALL have a foreign key constraint on `user_id` referencing `profiles(id)`.
3. THE `location_history` table SHALL have an index on `(user_id, timestamp DESC)` to support efficient per-user time-ordered queries.
4. THE Migration SHALL enable Row Level Security on the `location_history` table.

### Requirement 2: Auto-Population Trigger

**User Story:** As a system, I want every upsert to `user_locations` to automatically append a record to `location_history`, so that the route trail is built without any frontend changes.

#### Acceptance Criteria

1. THE Database SHALL contain a trigger function named `fn_sync_location_history` that executes after INSERT or UPDATE on `user_locations`.
2. WHEN a row is inserted into `user_locations`, THE Trigger SHALL insert a corresponding row into `location_history` with the same `user_id`, `latitude`, `longitude`, `accuracy`, `heading`, `speed`, and `timestamp` values.
3. WHEN a row is updated in `user_locations`, THE Trigger SHALL insert a new row into `location_history` with the updated `user_id`, `latitude`, `longitude`, `accuracy`, `heading`, `speed`, and `timestamp` values.
4. THE Trigger SHALL fire once per row (`FOR EACH ROW`) and SHALL be defined as an `AFTER INSERT OR UPDATE` trigger on `user_locations`.
5. THE Trigger function SHALL use `NEW` record values when inserting into `location_history`.

### Requirement 3: RLS Policies for user_locations

**User Story:** As a system, I want row-level security on `user_locations` so that workers can only write their own row and viewers can read all active workers.

#### Acceptance Criteria

1. THE Migration SHALL enable Row Level Security on the `user_locations` table.
2. WHEN a user with role `sanitation_worker` or `operator` performs an INSERT on `user_locations`, THE Database SHALL permit the operation only if the `user_id` column equals the authenticated user's `auth.uid()`.
3. WHEN a user with role `sanitation_worker` or `operator` performs an UPDATE on `user_locations`, THE Database SHALL permit the operation only if the `user_id` column equals the authenticated user's `auth.uid()`.
4. WHEN a user with role `admin`, `district_officer`, or `supervisor` performs a SELECT on `user_locations`, THE Database SHALL permit reading all rows.
5. WHEN a user with role `sanitation_worker` or `operator` performs a SELECT on `user_locations`, THE Database SHALL permit reading only the row where `user_id` equals the authenticated user's `auth.uid()`.
6. THE RLS policies SHALL determine the authenticated user's role by querying the `profiles` table using `auth.uid()`.

### Requirement 4: RLS Policies for location_history

**User Story:** As a system, I want row-level security on `location_history` so that workers can only insert their own history and viewers can read all history.

#### Acceptance Criteria

1. WHEN a user with role `sanitation_worker` or `operator` performs an INSERT on `location_history`, THE Database SHALL permit the operation only if the `user_id` column equals the authenticated user's `auth.uid()`.
2. WHEN a user with role `admin`, `district_officer`, or `supervisor` performs a SELECT on `location_history`, THE Database SHALL permit reading all rows.
3. WHEN a user with role `sanitation_worker` or `operator` performs a SELECT on `location_history`, THE Database SHALL permit reading only rows where `user_id` equals the authenticated user's `auth.uid()`.
4. THE RLS policies for `location_history` SHALL determine the authenticated user's role by querying the `profiles` table using `auth.uid()`.
5. THE `location_history` table SHALL NOT have a direct INSERT policy for end users because all inserts are performed by the trigger function running with `SECURITY DEFINER` privileges.
6. WHEN a user holds both a viewer role (`admin`, `district_officer`, or `supervisor`) and a worker role (`sanitation_worker` or `operator`), THE Database SHALL apply the most permissive matching policy and permit reading all rows.
7. IF an RLS policy check fails to evaluate due to a database error, THEN THE Database SHALL deny access to the requested rows.

### Requirement 5: Migration File Deliverable

**User Story:** As a developer, I want a single SQL migration file, so that I can apply all database changes in one step via the Supabase SQL editor.

#### Acceptance Criteria

1. THE Migration SHALL be a single `.sql` file containing all DDL statements, trigger definitions, and RLS policy statements required by Requirements 1 through 4.
2. THE Migration SHALL be idempotent — using `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `DROP TRIGGER IF EXISTS`, and `CREATE POLICY` with `DROP POLICY IF EXISTS` guards so it can be re-run without error.
3. THE Migration SHALL NOT modify any existing table schema (no `ALTER TABLE` on `user_locations` columns).
4. THE Migration SHALL NOT require any changes to frontend code.
5. IF the `location_history` table already exists, THEN THE Migration SHALL complete without error and leave the existing data intact.
6. THE Migration SHALL NOT apply schema modifications to `location_history` that would destroy existing data if the table already exists.
