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
    updateInterval = 6000,
    onUpdate = null,
    onError = null,
  } = options;

  if (!navigator?.geolocation) {
    onError?.(new Error("Geolocation not supported"));
    return { stop: () => {} };
  }

  // More aggressive GPS options for better accuracy
  const geoOpts = { 
    enableHighAccuracy: true,  // Force GPS, not IP location
    maximumAge: 0,             // Don't use cached position
    timeout: 30000             // Wait up to 30 seconds for GPS lock
  };
  
  let watchId = null;
  let intervalId = null;
  let lastUpdate = 0;

  async function push(position) {
    const { latitude, longitude, accuracy, heading, speed } = position.coords;
    
    // Log to console for debugging
    console.log(`📍 GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | Accuracy: ${accuracy?.toFixed(0)}m | Speed: ${speed?.toFixed(1)}m/s`);
    
    // Only update if accuracy is reasonable (less than 1000m) or if it's been a while
    const now = Date.now();
    if (accuracy > 1000 && (now - lastUpdate) < 30000) {
      console.warn(`⚠️ Low accuracy (${accuracy}m), waiting for better GPS lock...`);
      return;
    }
    
    lastUpdate = now;
    
    try {
      const { error } = await supabase.from("user_locations").upsert(
        {
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          latitude,
          longitude,
          accuracy,
          heading,
          speed,
          timestamp: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      
      console.log("✅ Location saved to database");
      onUpdate?.({ latitude, longitude, accuracy, heading, speed });
    } catch (err) {
      console.error("[tracking] push error:", err);
      onError?.(err);
    }
  }

  function handleError(err) {
    console.error("❌ GPS Error:", err.message);
    if (err.code === 1) {
      console.error("Permission denied - user blocked location access");
    } else if (err.code === 2) {
      console.error("Position unavailable - GPS not available");
    } else if (err.code === 3) {
      console.error("Timeout - GPS took too long to respond");
    }
    onError?.(err);
  }

  // Start watching position
  console.log("🎯 Starting GPS tracking with high accuracy mode...");
  watchId = navigator.geolocation.watchPosition(push, handleError, geoOpts);
  
  // Also force refresh at intervals
  intervalId = setInterval(
    () => {
      console.log("🔄 Forcing GPS refresh...");
      navigator.geolocation.getCurrentPosition(push, handleError, geoOpts);
    },
    updateInterval
  );

  return {
    stop: async () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      await supabase
        .from("user_locations")
        .update({ is_active: false })
        .eq("user_id", userId);
      console.log("🛑 GPS tracking stopped");
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
