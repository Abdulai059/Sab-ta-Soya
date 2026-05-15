import { supabase } from "./supabase";

/**
 * Fetch all locations with their incident counts
 * @returns {Promise<Array>} Array of location objects with coordinates and incident counts
 */
export async function fetchLocations() {
  try {
    const { data: locations, error } = await supabase
      .from("locations")
      .select(
        `
        id,
        name,
        latitude,
        longitude,
        type,
        status,
        climate_risk,
        water_access,
        area_name,
        landmark,
        community_id,
        communities (
          id,
          name,
          district,
          region
        ),
        location_images (
          image_url,
          image_type,
          caption
        )
      `
      )
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) throw error;

    // Get incident counts for each location
    const locationsWithIncidents = await Promise.all(
      locations.map(async (location) => {
        const { count } = await supabase
          .from("sanitation_reports")
          .select("*", { count: "exact", head: true })
          .eq("location_id", location.id)
          .in("status", ["pending", "assigned", "in_progress"]);

        const color = getColorBySeverity(count || 0);

        // Pick the first image (prefer 'primary' type, else first available)
        const images = location.location_images ?? [];
        const primaryImage =
          images.find((img) => img.image_type === "primary") ?? images[0] ?? null;

        return {
          id: location.id,
          name: location.name,
          slug: location.name.toLowerCase().replace(/\s+/g, "-"),
          coords: [location.latitude, location.longitude],
          incidents: count || 0,
          color,
          type: location.type,
          status: location.status,
          district: location.communities?.district,
          region: location.communities?.region,
          communityName: location.communities?.name,
          climateRisk: location.climate_risk,
          waterAccess: location.water_access,
          areaName: location.area_name,
          landmark: location.landmark,
          // Image fields
          imageUrl: primaryImage?.image_url ?? null,
          imageCaption: primaryImage?.caption ?? null,
          imageCount: images.length,
        };
      })
    );

    return locationsWithIncidents;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

/**
 * Fetch recent sanitation reports and emergency alerts
 * @returns {Promise<Array>} Array of incident objects
 */
export async function fetchRecentIncidents() {
  try {
    // Fetch sanitation reports
    const { data: reports, error: reportsError } = await supabase
      .from("sanitation_reports")
      .select(
        `
        id,
        reference_id,
        issue_type,
        severity,
        created_at,
        status,
        location_id,
        affected_people_count,
        health_risk,
        locations (
          id,
          name
        ),
        communities (
          id,
          name,
          district,
          region
        )
      `
      )
      .in("status", ["pending", "assigned", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (reportsError) throw reportsError;

    // Format incidents
    const formattedReports = reports.map((report) => ({
      id: report.id,
      referenceId: report.reference_id,
      title: formatIssueType(report.issue_type),
      location: report.locations?.name || report.communities?.name || "Unknown Location",
      locationId: report.location_id,
      community: report.communities?.name,
      district: report.communities?.district,
      region: report.communities?.region,
      time: getTimeAgo(report.created_at),
      severity: mapSeverity(report.severity),
      healthRisk: report.health_risk,
      affectedPeople: report.affected_people_count,
      type: "report",
      status: report.status,
    }));

    return formattedReports.slice(0, 10);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return [];
  }
}

/**
 * Subscribe to real-time updates for sanitation reports
 * @param {Function} callback - Function to call when data changes
 * @returns {Object} Subscription object
 */
export function subscribeToReports(callback) {
  const subscription = supabase
    .channel("sanitation_reports_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sanitation_reports",
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

// Helper functions

function getColorBySeverity(count) {
  if (count === 0) return "#00cc66"; // Green
  if (count === 1) return "#ffaa00"; // Orange
  if (count <= 3) return "#ff6600"; // Dark orange
  return "#ff4444"; // Red
}

function mapSeverity(severity) {
  const severityMap = {
    low: "low",
    medium: "medium",
    high: "high",
    critical: "high",
  };
  return severityMap[severity?.toLowerCase()] || "medium";
}

function formatIssueType(issueType) {
  if (!issueType) return "Sanitation Issue";

  return issueType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// ─── Communities ──────────────────────────────────────────────────────────────

/**
 * Fetch all communities that have coordinates.
 */
export async function fetchCommunities() {
  try {
    const { data, error } = await supabase
      .from("communities")
      .select("id, name, district, region, latitude, longitude, flood_risk_level, drought_risk_level, climate_status")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) throw error;

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      district: c.district,
      region: c.region,
      coords: [c.latitude, c.longitude],
      floodRisk: c.flood_risk_level,
      droughtRisk: c.drought_risk_level,
      climateStatus: c.climate_status,
    }));
  } catch (err) {
    console.error("[mapService] fetchCommunities:", err);
    return [];
  }
}

// ─── Climate Events ───────────────────────────────────────────────────────────

/**
 * Fetch recent climate events
 */
export async function fetchClimateEvents() {
  try {
    const { data, error } = await supabase
      .from("climate_events")
      .select("id, event_type, severity, region, start_date, end_date, impact_notes, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map((event) => ({
      id: event.id,
      eventType: event.event_type,
      severity: event.severity,
      region: event.region,
      startDate: event.start_date,
      endDate: event.end_date,
      impactNotes: event.impact_notes,
      createdAt: event.created_at,
    }));
  } catch (err) {
    console.error("[mapService] fetchClimateEvents:", err);
    return [];
  }
}

// ─── Location Images ──────────────────────────────────────────────────────────

/**
 * Fetch all images for a specific location.
 * @param {string} locationId
 * @returns {Promise<Array>} Array of image objects
 */
export async function fetchLocationImages(locationId) {
  try {
    const { data, error } = await supabase
      .from("location_images")
      .select("id, image_url, image_type, caption, created_at")
      .eq("location_id", locationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data.map((img) => ({
      id:        img.id,
      url:       img.image_url,
      type:      img.image_type,
      caption:   img.caption,
      createdAt: img.created_at,
    }));
  } catch (err) {
    console.error("[mapService] fetchLocationImages:", err);
    return [];
  }
}

// ─── Geofences ────────────────────────────────────────────────────────────────

/**
 * Fetch all active geofences (if table exists).
 * Note: geofences table is not in the provided schema, so this may not work.
 */
export async function fetchGeofences() {
  try {
    const { data, error } = await supabase
      .from("geofences")
      .select("id, name, description, center_latitude, center_longitude, radius")
      .eq("is_active", true);

    if (error) {
      // Table might not exist
      console.warn("[mapService] fetchGeofences: table may not exist", error.message);
      return [];
    }

    return data.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      center: [g.center_latitude, g.center_longitude],
      radius: g.radius,
    }));
  } catch (err) {
    console.error("[mapService] fetchGeofences:", err);
    return [];
  }
}
