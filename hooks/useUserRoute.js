import { useState, useEffect, useRef, useCallback } from "react";
import { fetchUserLocationHistory } from "@/lib/trackingService";

/**
 * useUserRoute — manages the user's live GPS route for map display.
 *
 * Strategy (Google Maps-style):
 *  1. On tracking start, load today's history from DB as the base trail.
 *  2. As new GPS positions arrive via the `onPositionUpdate` callback,
 *     append them to the route immediately — no DB round-trip needed.
 *  3. Periodically sync with DB to fill any gaps (e.g. after a page reload).
 *
 * @param {string|null}  userId          - Authenticated user ID
 * @param {boolean}      isTracking      - Whether GPS tracking is active
 * @param {Object|null}  latestPosition  - Most recent GPS fix { latitude, longitude }
 * @returns {{ userRoute: Array, currentPosition: Object|null }}
 */
export function useUserRoute(userId, isTracking, latestPosition = null) {
  const [userRoute, setUserRoute] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const syncIntervalRef = useRef(null);
  const lastSyncRef = useRef(0);

  // ── Load history from DB when tracking starts ──────────────────────────
  const loadHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const history = await fetchUserLocationHistory(userId, {
        startDate: startOfDay,
        limit: 200,
      });

      if (history.length > 0) {
        // history comes back newest-first, reverse to oldest-first for polyline
        const coords = [...history].reverse().map((p) => p.coords);
        setUserRoute(coords);
      }
    } catch (err) {
      console.error("[useUserRoute] loadHistory:", err);
    }
  }, [userId]);

  // ── Append a new live GPS fix to the route immediately ─────────────────
  useEffect(() => {
    if (!isTracking || !latestPosition) return;

    const { latitude, longitude } = latestPosition;
    if (!latitude || !longitude) return;

    const newCoord = [latitude, longitude];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPosition(latestPosition);
    setUserRoute((prev) => {
      // Avoid duplicate consecutive points
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last[0] === newCoord[0] && last[1] === newCoord[1]) return prev;
      }
      return [...prev, newCoord];
    });
  }, [latestPosition, isTracking]);

  // ── Lifecycle: load history on start, clear on stop ────────────────────
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!userId || !isTracking) {
      setUserRoute([]);
      setCurrentPosition(null);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Load existing history immediately
    loadHistory();

    // Periodic DB sync every 30s (fills gaps, not the primary update path)
    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastSyncRef.current > 25000) {
        lastSyncRef.current = now;
        loadHistory();
      }
    }, 30000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [userId, isTracking, loadHistory]);

  return { userRoute, currentPosition };
}
