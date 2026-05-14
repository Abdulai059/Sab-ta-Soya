-- Real-Time GPS Tracking Tables
-- Run this SQL in your Supabase SQL Editor

-- 1. User Locations Table (Current positions)
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT to support anonymous IDs
  user_name TEXT, -- Store user name for anonymous users
  user_role TEXT, -- Store user role for anonymous users
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Location History Table (Track movements over time)
CREATE TABLE IF NOT EXISTS public.location_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT to support anonymous IDs
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Geofences Table (Define areas for alerts)
CREATE TABLE IF NOT EXISTS public.geofences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  center_latitude DOUBLE PRECISION NOT NULL,
  center_longitude DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL, -- in meters
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Geofence Events Table (Track when users enter/exit geofences)
CREATE TABLE IF NOT EXISTS public.geofence_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT to support anonymous IDs
  geofence_id UUID NOT NULL REFERENCES public.geofences(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL CHECK (event_type IN ('enter', 'exit')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_is_active ON public.user_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp ON public.user_locations(timestamp);

CREATE INDEX IF NOT EXISTS idx_location_history_user_id ON public.location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_timestamp ON public.location_history(timestamp);

CREATE INDEX IF NOT EXISTS idx_geofences_is_active ON public.geofences(is_active);

CREATE INDEX IF NOT EXISTS idx_geofence_events_user_id ON public.geofence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_geofence_id ON public.geofence_events(geofence_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_timestamp ON public.geofence_events(timestamp);

-- Function to automatically save location history
CREATE OR REPLACE FUNCTION save_location_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into history table
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
$$ LANGUAGE plpgsql;

-- Trigger to save history on location update
DROP TRIGGER IF EXISTS trigger_save_location_history ON public.user_locations;
CREATE TRIGGER trigger_save_location_history
  AFTER INSERT OR UPDATE ON public.user_locations
  FOR EACH ROW
  EXECUTE FUNCTION save_location_history();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_locations
DROP TRIGGER IF EXISTS trigger_user_locations_updated_at ON public.user_locations;
CREATE TRIGGER trigger_user_locations_updated_at
  BEFORE UPDATE ON public.user_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for geofences
DROP TRIGGER IF EXISTS trigger_geofences_updated_at ON public.geofences;
CREATE TRIGGER trigger_geofences_updated_at
  BEFORE UPDATE ON public.geofences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_locations
CREATE POLICY "Everyone can view all active locations"
  ON public.user_locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can update their own location"
  ON public.user_locations FOR UPDATE
  USING (true); -- Allow anyone to update (anonymous or authenticated)

CREATE POLICY "Anyone can insert location"
  ON public.user_locations FOR INSERT
  WITH CHECK (true); -- Allow anyone to insert (anonymous or authenticated)

-- RLS Policies for location_history
CREATE POLICY "Everyone can view all location history"
  ON public.location_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert location history"
  ON public.location_history FOR INSERT
  WITH CHECK (true);

-- RLS Policies for geofences
CREATE POLICY "Everyone can view active geofences"
  ON public.geofences FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage geofences"
  ON public.geofences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for geofence_events
CREATE POLICY "Everyone can view all geofence events"
  ON public.geofence_events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert geofence events"
  ON public.geofence_events FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for user_locations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_locations;

-- Optional: Clean up old location history (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_location_history()
RETURNS void AS $$
BEGIN
  DELETE FROM public.location_history
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- You can schedule this function to run daily using pg_cron or manually

-- Sample geofences (optional - for testing)
INSERT INTO public.geofences (name, description, center_latitude, center_longitude, radius, is_active)
VALUES 
  ('Tamale Central Office', 'Main office area', 9.4034, -0.8424, 500, true),
  ('Savelugu District', 'Savelugu district boundary', 9.6247, -0.8253, 2000, true),
  ('Emergency Zone', 'High priority response area', 9.4423, -0.0095, 1000, true)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.user_locations TO authenticated;
GRANT ALL ON public.location_history TO authenticated;
GRANT ALL ON public.geofences TO authenticated;
GRANT ALL ON public.geofence_events TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'GPS Tracking tables created successfully!';
  RAISE NOTICE 'Tables: user_locations, location_history, geofences, geofence_events';
  RAISE NOTICE 'Realtime enabled for user_locations';
  RAISE NOTICE 'RLS policies configured';
END $$;
