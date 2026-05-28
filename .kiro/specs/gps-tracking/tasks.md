# Implementation Plan: GPS Tracking — Database Migration

## Overview

The frontend is already complete. The only implementation work is verifying the migration SQL file is correct and running it in Supabase. All tasks below are database-layer only — no frontend changes are needed.

## Tasks

- [ ] 1. Verify the migration file is correct
  - [ ] 1.1 Review `migrations/gps_tracking_location_history.sql` for correctness
    - Confirm `location_history` table DDL matches the design: all columns present with correct types, PK, FK to `profiles(id)`, and composite index on `(user_id, timestamp DESC)`
    - Confirm `fn_sync_location_history` is `SECURITY DEFINER`, fires `AFTER INSERT OR UPDATE FOR EACH ROW` on `user_locations`, and copies all required fields from `NEW`
    - Confirm `trg_sync_location_history` is dropped and recreated for idempotency
    - Confirm RLS is enabled on both `user_locations` and `location_history`
    - Confirm all four `user_locations` policies are present: worker INSERT, worker UPDATE, viewer SELECT all, worker SELECT own
    - Confirm both `location_history` policies are present: viewer SELECT all, worker SELECT own
    - Confirm no direct INSERT policy exists for end users on `location_history`
    - Confirm all DDL uses idempotency guards (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP … IF EXISTS`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.2 Write smoke-test SQL queries to validate the migration post-run
    - Write a query to confirm `location_history` exists with all required columns and correct data types (query `information_schema.columns`)
    - Write a query to confirm the FK constraint `location_history.user_id → profiles.id` exists (query `information_schema.table_constraints` and `information_schema.key_column_usage`)
    - Write a query to confirm the composite index `idx_location_history_user_id_timestamp` exists (query `pg_indexes`)
    - Write a query to confirm RLS is enabled on both `user_locations` and `location_history` (query `pg_tables` or `pg_class`)
    - Write a query to confirm the trigger `trg_sync_location_history` exists and is `AFTER INSERT OR UPDATE FOR EACH ROW` (query `information_schema.triggers`)
    - Write a query to confirm no direct INSERT policy exists for authenticated users on `location_history` (query `pg_policies`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4, 3.1, 4.4, 4.5, 5.2_

- [ ] 2. Run the migration in Supabase

  > **Instructions for running the migration:**
  >
  > 1. Open your Supabase project dashboard at [https://supabase.com/dashboard](https://supabase.com/dashboard)
  > 2. Select your project
  > 3. In the left sidebar, click **SQL Editor**
  > 4. Click **New query** (or the `+` button)
  > 5. Open `migrations/gps_tracking_location_history.sql` in your editor and copy the entire file contents
  > 6. Paste the SQL into the Supabase SQL Editor
  > 7. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
  > 8. Confirm the output shows no errors — each statement should complete with a success message
  > 9. If you created smoke-test queries in task 1.2, run them now in a new SQL Editor tab to validate the migration
  > 10. The migration is idempotent — it is safe to re-run if needed without affecting existing data
  >
  > **Expected outcome:** The `location_history` table, `fn_sync_location_history` trigger function, `trg_sync_location_history` trigger, and all RLS policies will be created. GPS fixes upserted to `user_locations` will automatically be logged to `location_history`.
  >
  > _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 3. Final checkpoint — Confirm migration applied successfully
  - Ensure all smoke-test queries pass (if written), ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster path to running the migration
- The migration file is already written and idempotent — it can be re-run safely at any time
- No frontend code changes are required at any point
- All RLS policy role checks use `public.profiles` joined on `auth.uid()`, consistent with existing project conventions

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] }
  ]
}
```
