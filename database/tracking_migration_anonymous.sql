-- Migration: Add Anonymous User Support to GPS Tracking
-- Run this SQL in your Supabase SQL Editor if you already have the tracking tables

-- Step 1: Drop existing foreign key constraints
ALTER TABLE public.user_locations DROP CONSTRAINT IF EXISTS user_locations_user_id_fkey;
ALTER TABLE public.location_history DROP CONSTRAINT IF EXISTS location_history_user_id_fkey;
ALTER TABLE public.geofence_events DROP CONSTRAINT IF EXISTS geofence_events_user_id_fkey;

-- Step 2: Change user_id column type from UUID to TEXT
ALTER TABLE public.user_locations ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.location_history ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.geofence_events ALTER COLUMN user_id TYPE TEXT;

-- Step 3: Add new columns for anonymous users
ALTER TABLE public.user_locations ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.user_locations ADD COLUMN IF NOT EXISTS user_role TEXT;

-- Step 4: Drop old RLS policies
DROP POLICY IF EXISTS "Users can view all active locations" ON public.user_locations;
DROP POLICY IF EXISTS "Users can update their own location" ON public.user_locations;
DROP POLICY IF EXISTS "Users can insert their own location" ON public.user_locations;

DROP POLICY IF EXISTS "Users can view all location history" ON public.location_history;
DROP POLICY IF EXISTS "System can insert location history" ON public.location_history;

DROP POLICY IF EXISTS "Users can view all geofence events" ON public.geofence_events;
DROP POLICY IF EXISTS "System can insert geofence events" ON public.geofence_events;

-- Step 5: Create new RLS policies that allow anonymous access
CREATE POLICY "Everyone can view all active locations"
  ON public.user_locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can update their own location"
  ON public.user_locations FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert location"
  ON public.user_locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Everyone can view all location history"
  ON public.location_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert location history"
  ON public.location_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Everyone can view all geofence events"
  ON public.geofence_events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert geofence events"
  ON public.geofence_events FOR INSERT
  WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Anonymous user support added successfully!';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '- user_id changed from UUID to TEXT (supports anonymous IDs)';
  RAISE NOTICE '- Added user_name and user_role columns';
  RAISE NOTICE '- Updated RLS policies to allow anonymous access';
END $$;
