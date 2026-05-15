import { supabase } from "./supabase";

// ─── Live GPS Tracking ────────────────────────────────────────────────────────

/**
 * Start broadcasting the current user's GPS position.
 * Works for both authenticated users and anonymous visitors.
 *
 * @param {string} userId   - profile UUID or a generated anonymous string
 * @param {Object} options
 * @param {string} options.userName
 * @param {string} options.userRole
 * @param {number} options.updateInterval  ms between forced refreshes (default 6000)
 * @param {Function} options.onUpdate      called with { latitude, longitude, … }
 * @param {Function} options.onError       called with Error
 * @returns {{ stop: Function }}
 */
export function startTracking(userId, options = {}) {
  const {
    userName = "Anonymous",
    userRole = "visitor",
    onUpdate = null,
    onError = null,
  } = options;

  if (!navigator?.geolocation) {
    onError?.(new Error("Geolocation not supported"));
    return { stop: () => {} };
  }

  // Exact GPS options as recommended — forces real GPS chip, no cached/IP positions
  const geoOpts = {
    enableHighAccuracy: true, // Use GPS chip, not network/IP location
    maximumAge: 0,            // Always get a fresh position, never cached
    timeout: 10000,           // Wait up to 10s for a GPS fix
  };

  let watchId = null;
  let stopped = false;

  /**
   * Called by both getCurrentPosition (first fix) and watchPosition (updates).
   * Saves to DB and notifies the caller immediately.
   */
  async function push(position) {
    if (stopped) return;

    const { latitude, longitude, accuracy, heading, speed } = position.coords;

    const timestamp = new Date().toISOString();

    try {
      // Upsert current position — DB trigger writes to location_history automatically
      const { error } = await supabase.from("user_locations").upsert(
        {
          user_id:   userId,
          user_name: userName,
          user_role: userRole,
          latitude,
          longitude,
          accuracy,
          heading,
          speed,
          timestamp,
          is_active: true,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      // Notify hook immediately — route updates without waiting for DB poll
      onUpdate?.({ latitude, longitude, accuracy, heading, speed });
    } catch (err) {
      console.error("[tracking] push error:", err);
      onError?.(err);
    }
  }

  function handleError(err) {
    if (stopped) return;
    const messages = {
      1: "Permission denied — user blocked location access",
      2: "Position unavailable — GPS not available on this device",
      3: "Timeout — GPS took too long to get a fix",
    };
    console.error("[tracking]", messages[err.code] ?? err.message);
    onError?.(err);
  }

  // Step 1: Get an immediate first fix so the dot appears right away
  navigator.geolocation.getCurrentPosition(push, handleError, geoOpts);

  // Step 2: Watch for continuous real-time updates as the user moves
  watchId = navigator.geolocation.watchPosition(push, handleError, geoOpts);

  return {
    stop: async () => {
      stopped = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      // Mark user as inactive in DB
      await supabase
        .from("user_locations")
        .update({ is_active: false })
        .eq("user_id", userId);
    },
  };
}

// ─── Data Fetchers ────────────────────────────────────────────────────────────

/**
 * Fetch all currently active field workers.
 * Uses stored user_name/user_role from the table (no join needed).
 */
export async function fetchFieldWorkers() {
  try {
    const { data, error } = await supabase
      .from("user_locations")
      .select("*")
      .eq("is_active", true)
      .order("timestamp", { ascending: false });

    if (error) {
      // Table doesn't exist yet or other error
      if (error.code === 'PGRST200' || error.code === '42P01') {
        console.warn("[tracking] user_locations table not found. Run database/tracking_tables.sql first.");
        return [];
      }
      throw error;
    }

    return data.map((row) => ({
      id: row.user_id,
      name: row.user_name || "Anonymous",
      role: row.user_role || "visitor",
      phone: null,
      coords: [row.latitude, row.longitude],
      accuracy: row.accuracy,
      heading: row.heading,
      speed: row.speed ?? 0,
      isMoving: (row.speed ?? 0) > 0.5,
      lastSeen: timeAgo(row.timestamp),
      timestamp: row.timestamp,
    }));
  } catch (err) {
    console.error("[tracking] fetchFieldWorkers:", err);
    return [];
  }
}

/**
 * Subscribe to realtime changes on user_locations.
 * Calls callback with a fresh list of field workers on every change.
 */
export function subscribeToFieldWorkers(callback) {
  return supabase
    .channel("field_workers_live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_locations" },
      async () => {
        const workers = await fetchFieldWorkers();
        callback(workers);
      }
    )
    .subscribe();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// ─── Location History ─────────────────────────────────────────────────────────

/**
 * Fetch location history for a specific user
 * @param {string} userId - User ID to fetch history for
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of records (default: 100)
 * @param {Date} options.startDate - Start date for filtering
 * @param {Date} options.endDate - End date for filtering
 * @returns {Promise<Array>} Array of location history records
 */
export async function fetchUserLocationHistory(userId, options = {}) {
  const { limit = 200, startDate, endDate } = options;
  
  try {
    let query = supabase
      .from("location_history")
      .select("id, user_id, latitude, longitude, accuracy, heading, speed, timestamp")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit);
    
    if (startDate) query = query.gte("timestamp", startDate.toISOString());
    if (endDate)   query = query.lte("timestamp", endDate.toISOString());
    
    const { data, error } = await query;
    
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205") {
        // Table doesn't exist yet — fall back to current position from user_locations
        return await fetchCurrentPositionAsHistory(userId);
      }
      throw error;
    }
    
    return data.map((row) => ({
      id:        row.id,
      userId:    row.user_id,
      coords:    [row.latitude, row.longitude],
      latitude:  row.latitude,
      longitude: row.longitude,
      accuracy:  row.accuracy,
      heading:   row.heading,
      speed:     row.speed ?? 0,
      timestamp: row.timestamp,
    }));
  } catch (err) {
    console.error("[tracking] fetchUserLocationHistory:", err);
    return [];
  }
}

/**
 * Fallback when location_history table doesn't exist.
 * Returns the user's current position from user_locations as a single-point "history".
 */
async function fetchCurrentPositionAsHistory(userId) {
  try {
    const { data, error } = await supabase
      .from("user_locations")
      .select("user_id, latitude, longitude, accuracy, heading, speed, timestamp")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error || !data) return [];

    return [{
      id:        data.user_id,
      userId:    data.user_id,
      coords:    [data.latitude, data.longitude],
      latitude:  data.latitude,
      longitude: data.longitude,
      accuracy:  data.accuracy,
      heading:   data.heading,
      speed:     data.speed ?? 0,
      timestamp: data.timestamp,
    }];
  } catch {
    return [];
  }
}

/**
 * Fetch location history for all users within a date range
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date (required)
 * @param {Date} options.endDate - End date (default: now)
 * @param {number} options.limit - Maximum records per user
 * @returns {Promise<Array>} Array of location history records
 */
export async function fetchAllLocationHistory(options = {}) {
  const { startDate, endDate = new Date(), limit = 1000 } = options;
  
  if (!startDate) {
    throw new Error("startDate is required");
  }
  
  try {
    const { data, error } = await supabase
      .from("location_history")
      .select("*")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString())
      .order("timestamp", { ascending: false })
      .limit(limit);
    
    if (error) {
      if (error.code === '42P01') {
        console.warn("[tracking] location_history table not found");
        return [];
      }
      throw error;
    }
    
    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userRole: row.user_role,
      coords: [row.latitude, row.longitude],
      latitude: row.latitude,
      longitude: row.longitude,
      accuracy: row.accuracy,
      heading: row.heading,
      speed: row.speed ?? 0,
      timestamp: row.timestamp,
      timeAgo: timeAgo(row.timestamp),
    }));
  } catch (err) {
    console.error("[tracking] fetchAllLocationHistory:", err);
    return [];
  }
}

/**
 * Get location statistics for a user
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date for analysis
 * @returns {Promise<Object>} Statistics object
 */
export async function getUserLocationStats(userId, startDate) {
  try {
    const history = await fetchUserLocationHistory(userId, { 
      startDate, 
      limit: 10000 
    });
    
    if (history.length === 0) {
      return {
        totalPoints: 0,
        distanceTraveled: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        duration: 0,
      };
    }
    
    // Calculate distance traveled (Haversine formula)
    let totalDistance = 0;
    for (let i = 1; i < history.length; i++) {
      const prev = history[i];
      const curr = history[i - 1];
      totalDistance += calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
    }
    
    // Calculate speeds
    const speeds = history.map(h => h.speed).filter(s => s > 0);
    const averageSpeed = speeds.length > 0 
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
      : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
    
    // Calculate duration
    const firstTime = new Date(history[history.length - 1].timestamp);
    const lastTime = new Date(history[0].timestamp);
    const duration = (lastTime - firstTime) / 1000 / 60; // minutes
    
    return {
      totalPoints: history.length,
      distanceTraveled: totalDistance, // in kilometers
      averageSpeed: averageSpeed * 3.6, // convert m/s to km/h
      maxSpeed: maxSpeed * 3.6, // convert m/s to km/h
      duration, // in minutes
      firstLocation: history[history.length - 1],
      lastLocation: history[0],
    };
  } catch (err) {
    console.error("[tracking] getUserLocationStats:", err);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
