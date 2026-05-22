"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLocations,
  fetchRecentIncidents,
  fetchCommunities,
  fetchGeofences,
  subscribeToAlerts,
} from "../../lib/mapService";
import { fetchFieldWorkers, subscribeToFieldWorkers } from "../../lib/trackingService";
import { FALLBACK_LOCATION } from "../constants";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";

async function fetchAllMapData() {
  const [locs, incidents, comms, fences, workers] = await Promise.all([
    fetchLocations(),
    fetchRecentIncidents(),
    fetchCommunities(),
    fetchGeofences(),
    fetchFieldWorkers(),
  ]);

  return {
    locations:       locs.length > 0 ? locs : [FALLBACK_LOCATION],
    recentIncidents: incidents,
    communities:     comms,
    geofences:       fences,
    fieldWorkers:    workers,
  };
}

export function useMapsData() {
  const qc = useQueryClient();

  // Active location is pure UI state — not server data
  const [activeLocation, setActiveLocation] = useState(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.mapData,
    queryFn: fetchAllMapData,
  });

  // Set first location as active once data loads
  useEffect(() => {
    if (data?.locations?.length && !activeLocation) {
      setActiveLocation(data.locations[0]);
    }
  }, [data?.locations, activeLocation]);

  // Subscriptions that aren't covered by the global realtimeInvalidator:
  // - alerts table (not in the global invalidator)
  // - field workers (user_locations) — already in global invalidator but
  //   useMapsData also needs the fieldWorkers slice refreshed
  useEffect(() => {
    const alertsSub = subscribeToAlerts(() => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.mapData });
    });

    const workersSub = subscribeToFieldWorkers(() => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.fieldWorkers });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.mapData });
    });

    return () => {
      alertsSub.unsubscribe();
      workersSub.unsubscribe();
    };
  }, [qc]);

  return {
    locations:       data?.locations       ?? [FALLBACK_LOCATION],
    communities:     data?.communities     ?? [],
    geofences:       data?.geofences       ?? [],
    recentIncidents: data?.recentIncidents ?? [],
    fieldWorkers:    data?.fieldWorkers    ?? [],
    activeLocation,
    setActiveLocation,
    loading,
  };
}
