-- ============================================================
-- Create location_history table for GPS route tracking
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.location_history (
  id          uuid    NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  accuracy    double precision,
  heading     double precision,
  speed       double precision,
  timestamp   timestamp with time zone DEFAULT now(),
  created_at  timestamp with time zone DEFAULT now(),
  CONSTRAINT location_history_pkey PRIMARY KEY (id)
);

-- Index for fast per-user time-range queries (used by route tracking)
CREATE INDEX IF NOT EXISTS idx_location_history_user_timestamp
  ON public.location_history (user_id, timestamp DESC);

-- ── Trigger: auto-save to history on every user_locations upsert ──────────────

CREATE OR REPLACE FUNCTION save_location_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.location_history (
    user_id, latitude, longitude, accuracy, heading, speed, timestamp
  ) VALUES (
    NEW.user_id, NEW.latitude, NEW.longitude,
    NEW.accuracy, NEW.heading, NEW.speed, NEW.timestamp
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_save_location_history ON public.user_locations;
CREATE TRIGGER trigger_save_location_history
  AFTER INSERT OR UPDATE ON public.user_locations
  FOR EACH ROW EXECUTE FUNCTION save_location_history();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all history (field supervisors need this)
CREATE POLICY "Authenticated users can view location history"
  ON public.location_history FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own history
CREATE POLICY "Users can insert own location history"
  ON public.location_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ── Optional: auto-clean history older than 30 days ──────────────────────────
-- You can schedule this with pg_cron or run manually

-- SELECT cron.schedule('cleanup-location-history', '0 2 * * *',
--   'DELETE FROM public.location_history WHERE timestamp < now() - interval ''30 days''');

-- ── Done ──────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE 'location_history table created successfully';
  RAISE NOTICE 'Trigger: user_locations → location_history (auto-save on upsert)';
  RAISE NOTICE 'RLS enabled with authenticated read + own-insert policies';
END $$;
