-- Fix and upgrade the risk assessment trigger.
-- Computes the actual risk score automatically when a report is submitted.
--
-- Scoring weights (matches RISK_WEIGHTS in components/admin/constants.js):
--   near_school          = 15 pts
--   near_water_source    = 15 pts
--   flood_zone           = 10 pts
--   drought_zone         = 10 pts
--   repeated_incident    = 10 pts
--   escalation_required  =  5 pts
--   per child            =  2 pts (capped at 20)
--
-- Tier thresholds:
--   >= 50  → critical
--   >= 30  → high
--   >= 15  → medium
--    < 15  → low
--
-- Risk flags are derived from the report itself:
--   near_school         → severity = 'critical' or 'high'
--   near_water_source   → health_risk = true
--   flood_zone          → community.flood_risk_level IS NOT NULL
--   drought_zone        → community.drought_risk_level IS NOT NULL
--   repeated_incident   → another report for same location in last 30 days
--   escalation_required → composite score >= 50 (critical tier)
--
-- Run this in Supabase SQL Editor.

-- Step 1: Drop the broken trigger and function
DROP TRIGGER IF EXISTS trg_auto_risk_assessment ON public.sanitation_reports;
DROP FUNCTION IF EXISTS public.fn_auto_risk_assessment();

-- Step 2: Create the smart trigger function
CREATE OR REPLACE FUNCTION public.fn_auto_risk_assessment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_near_school         boolean := false;
  v_near_water_source   boolean := false;
  v_flood_zone          boolean := false;
  v_drought_zone        boolean := false;
  v_repeated_incident   boolean := false;
  v_escalation_required boolean := false;
  v_affected_children   integer := 0;
  v_flag_score          integer := 0;
  v_children_score      integer := 0;
  v_composite_score     integer := 0;
  v_priority_level      text    := 'low';
  v_community           record;
  v_repeat_count        integer := 0;
BEGIN
  -- 1. near_school: report is high or critical severity
  IF NEW.severity IN ('high', 'critical') THEN
    v_near_school := true;
  END IF;

  -- 2. near_water_source: report has health_risk flag
  IF NEW.health_risk = true THEN
    v_near_water_source := true;
  END IF;

  -- 3. flood_zone / drought_zone: from community climate data
  IF NEW.community_id IS NOT NULL THEN
    SELECT flood_risk_level, drought_risk_level
    INTO v_community
    FROM public.communities
    WHERE id = NEW.community_id;

    IF v_community.flood_risk_level IS NOT NULL AND v_community.flood_risk_level != '' THEN
      v_flood_zone := true;
    END IF;

    IF v_community.drought_risk_level IS NOT NULL AND v_community.drought_risk_level != '' THEN
      v_drought_zone := true;
    END IF;
  END IF;

  -- 4. repeated_incident: same location reported in last 30 days
  IF NEW.location_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_repeat_count
    FROM public.sanitation_reports
    WHERE location_id = NEW.location_id
      AND id != NEW.id
      AND created_at >= NOW() - INTERVAL '30 days';

    IF v_repeat_count > 0 THEN
      v_repeated_incident := true;
    END IF;
  END IF;

  -- 5. affected_children_count from the report
  v_affected_children := COALESCE(NEW.affected_children_count, 0);

  -- 6. Compute composite score
  v_flag_score :=
    (CASE WHEN v_near_school        THEN 15 ELSE 0 END) +
    (CASE WHEN v_near_water_source  THEN 15 ELSE 0 END) +
    (CASE WHEN v_flood_zone         THEN 10 ELSE 0 END) +
    (CASE WHEN v_drought_zone       THEN 10 ELSE 0 END) +
    (CASE WHEN v_repeated_incident  THEN 10 ELSE 0 END);

  v_children_score := LEAST(v_affected_children * 2, 20);
  v_composite_score := v_flag_score + v_children_score;

  -- 7. escalation_required: critical tier (score >= 50)
  IF v_composite_score >= 50 THEN
    v_escalation_required := true;
    v_composite_score := v_composite_score + 5; -- add escalation weight
  END IF;

  -- 8. Determine priority level
  IF v_composite_score >= 50 THEN
    v_priority_level := 'critical';
  ELSIF v_composite_score >= 30 THEN
    v_priority_level := 'high';
  ELSIF v_composite_score >= 15 THEN
    v_priority_level := 'medium';
  ELSE
    v_priority_level := 'low';
  END IF;

  -- 9. Insert risk assessment row
  INSERT INTO public.risk_assessments (
    report_id,
    risk_score,
    priority_level,
    near_school,
    near_water_source,
    flood_zone,
    drought_zone,
    repeated_incident,
    escalation_required,
    affected_children_count
  ) VALUES (
    NEW.id,
    v_composite_score,
    v_priority_level,
    v_near_school,
    v_near_water_source,
    v_flood_zone,
    v_drought_zone,
    v_repeated_incident,
    v_escalation_required,
    v_affected_children
  )
  ON CONFLICT (report_id) DO UPDATE SET
    risk_score              = EXCLUDED.risk_score,
    priority_level          = EXCLUDED.priority_level,
    near_school             = EXCLUDED.near_school,
    near_water_source       = EXCLUDED.near_water_source,
    flood_zone              = EXCLUDED.flood_zone,
    drought_zone            = EXCLUDED.drought_zone,
    repeated_incident       = EXCLUDED.repeated_incident,
    escalation_required     = EXCLUDED.escalation_required,
    affected_children_count = EXCLUDED.affected_children_count;

  RETURN NEW;
END;
$$;

-- Step 3: Attach the trigger
CREATE TRIGGER trg_auto_risk_assessment
  AFTER INSERT ON public.sanitation_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_risk_assessment();
