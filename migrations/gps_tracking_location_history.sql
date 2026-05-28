-- =============================================================================
-- Migration: GPS Tracking — location_history table, trigger, and RLS policies
-- Feature:   gps-tracking
-- Spec:      .kiro/specs/gps-tracking/
--
-- Deliverable: Single idempotent SQL file executable in the Supabase SQL editor.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP … IF EXISTS guards.
-- No existing table schemas are modified.
-- =============================================================================


-- =============================================================================
-- 1. location_history TABLE
--    Append-only log of every GPS fix.
--    Populated exclusively by the fn_sync_location_history trigger.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.location_history (
  id          uuid              NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid              NOT NULL,
  latitude    double precision  NOT NULL,
  longitude   double precision  NOT NULL,
  accuracy    double precision,
  heading     double precision,
  speed       double precision,
  timestamp   timestamptz       NOT NULL,
  created_at  timestamptz       NOT NULL DEFAULT now(),

  CONSTRAINT location_history_pkey
    PRIMARY KEY (id),

  CONSTRAINT location_history_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Index: supports per-user time-ordered queries used by fetchUserLocationHistory
CREATE INDEX IF NOT EXISTS idx_location_history_user_id_timestamp
  ON public.location_history (user_id, timestamp DESC);

-- Enable RLS (safe to call even if already enabled)
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- 2. TRIGGER FUNCTION: fn_sync_location_history
--    Fires AFTER INSERT OR UPDATE on user_locations.
--    Copies the NEW row's GPS fields into location_history.
--
--    SECURITY DEFINER: runs with the privileges of the function owner (postgres),
--    bypassing RLS on location_history so the trigger can always write history
--    regardless of the calling user's role.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_sync_location_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.location_history (
    user_id,
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
    timestamp
  ) VALUES (
    NEW.user_id,
    NEW.latitude,
    NEW.longitude,
    NEW.accuracy,
    NEW.heading,
    NEW.speed,
    NEW.timestamp
  );

  RETURN NEW;
END;
$$;

-- Attach the trigger to user_locations (drop first for idempotency)
DROP TRIGGER IF EXISTS trg_sync_location_history ON public.user_locations;

CREATE TRIGGER trg_sync_location_history
  AFTER INSERT OR UPDATE
  ON public.user_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_location_history();


-- =============================================================================
-- 3. RLS POLICIES: user_locations
--    Workers (sanitation_worker, operator) can read/write only their own row.
--    Viewers (admin, district_officer, supervisor) can read all rows.
-- =============================================================================

-- Enable RLS on user_locations (safe to call even if already enabled)
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- ── INSERT: workers may only insert their own row ────────────────────────────
DROP POLICY IF EXISTS "Workers can insert own location" ON public.user_locations;

CREATE POLICY "Workers can insert own location"
  ON public.user_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('sanitation_worker', 'operator')
    )
  );

-- ── UPDATE: workers may only update their own row ────────────────────────────
DROP POLICY IF EXISTS "Workers can update own location" ON public.user_locations;

CREATE POLICY "Workers can update own location"
  ON public.user_locations
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('sanitation_worker', 'operator')
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('sanitation_worker', 'operator')
    )
  );

-- ── SELECT (viewers): admins / district officers / supervisors read all rows ──
DROP POLICY IF EXISTS "Viewers can read all locations" ON public.user_locations;

CREATE POLICY "Viewers can read all locations"
  ON public.user_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'district_officer', 'supervisor')
    )
  );

-- ── SELECT (workers): workers read only their own row ────────────────────────
DROP POLICY IF EXISTS "Workers can read own location" ON public.user_locations;

CREATE POLICY "Workers can read own location"
  ON public.user_locations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('sanitation_worker', 'operator')
    )
  );


-- =============================================================================
-- 4. RLS POLICIES: location_history
--    No direct INSERT policy for end users — all inserts come from the
--    SECURITY DEFINER trigger fn_sync_location_history.
--    Viewers can read all history; workers can read only their own history.
-- =============================================================================

-- ── SELECT (viewers): admins / district officers / supervisors read all rows ──
DROP POLICY IF EXISTS "Viewers can read all location history" ON public.location_history;

CREATE POLICY "Viewers can read all location history"
  ON public.location_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'district_officer', 'supervisor')
    )
  );

-- ── SELECT (workers): workers read only their own history rows ───────────────
DROP POLICY IF EXISTS "Workers can read own location history" ON public.location_history;

CREATE POLICY "Workers can read own location history"
  ON public.location_history
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('sanitation_worker', 'operator')
    )
  );

-- =============================================================================
-- End of migration
-- =============================================================================
