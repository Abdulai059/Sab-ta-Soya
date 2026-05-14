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
        district,
        region
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

        // Generate color based on incident count
        const color = getColorBySeverity(count || 0);

        return {
          id: location.id,
          name: location.name,
          slug: location.name.toLowerCase().replace(/\s+/g, "-"),
          coords: [location.latitude, location.longitude],
          incidents: count || 0,
          color: color,
          type: location.type,
          status: location.status,
          district: location.district,
          region: location.region,
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
        community,
        created_at,
        status,
        location_id,
        locations (
          id,
          name
        )
      `
      )
      .in("status", ["pending", "assigned", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (reportsError) throw reportsError;

    // Fetch emergency alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("emergency_alerts")
      .select(
        `
        id,
        reference_id,
        alert_type,
        urgency,
        community,
        created_at,
        status,
        message,
        report_id
      `
      )
      .eq("status", "Active")
      .order("created_at", { ascending: false })
      .limit(5);

    if (alertsError) throw alertsError;

    // Combine and format incidents
    const formattedReports = reports.map((report) => ({
      id: report.id,
      title: formatIssueType(report.issue_type),
      location: report.locations?.name || report.community,
      locationId: report.location_id,
      time: getTimeAgo(report.created_at),
      severity: mapSeverity(report.severity),
      type: "report",
    }));

    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      title: `🚨 ${formatAlertType(alert.alert_type)}`,
      location: alert.community,
      locationId: null,
      time: getTimeAgo(alert.created_at),
      severity: mapUrgency(alert.urgency),
      type: "alert",
    }));

    // Combine and sort by time
    const allIncidents = [...formattedAlerts, ...formattedReports].sort(
      (a, b) => {
        // Alerts first, then by time
        if (a.type === "alert" && b.type !== "alert") return -1;
        if (a.type !== "alert" && b.type === "alert") return 1;
        return 0;
      }
    );

    return allIncidents.slice(0, 10);
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

/**
 * Subscribe to real-time updates for emergency alerts
 * @param {Function} callback - Function to call when data changes
 * @returns {Object} Subscription object
 */
export function subscribeToAlerts(callback) {
  const subscription = supabase
    .channel("emergency_alerts_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "emergency_alerts",
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

function mapUrgency(urgency) {
  const urgencyMap = {
    low: "low",
    medium: "medium",
    high: "high",
    critical: "high",
    immediate: "high",
  };
  return urgencyMap[urgency?.toLowerCase()] || "high";
}

function formatIssueType(issueType) {
  if (!issueType) return "Sanitation Issue";

  return issueType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatAlertType(alertType) {
  if (!alertType) return "Emergency Alert";

  return alertType
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
      .select("id, name, district, region, latitude, longitude, flood_risk_level, drought_risk_level")
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
    }));
  } catch (err) {
    console.error("[mapService] fetchCommunities:", err);
    return [];
  }
}

// ─── Geofences ────────────────────────────────────────────────────────────────

/**
 * Fetch all active geofences.
 */
export async function fetchGeofences() {
  try {
    const { data, error } = await supabase
      .from("geofences")
      .select("id, name, description, center_latitude, center_longitude, radius")
      .eq("is_active", true);

    if (error) throw error;

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
