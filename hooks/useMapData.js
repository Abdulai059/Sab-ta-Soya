"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLocations,
  fetchRecentIncidents,
  fetchCommunities,
  fetchGeofences,
} from "@/lib/mapService";
import { fetchFieldWorkers } from "@/lib/trackingService";
import { FALLBACK_LOCATION } from "@/lib/mapConstants";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";

async function fetchMapData() {
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

export function useMapData() {
  const qc = useQueryClient();

  // Active location is pure UI state — not server data, stays local
  const [activeLocation, setActiveLocation] = useState(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.mapData,
    queryFn: fetchMapData,
  });

  // Set the first location as active once data loads (replaces removed onSuccess)
  useEffect(() => {
    if (data?.locations?.length && activeLocation === null) {
      setActiveLocation(data.locations[0]);
    }
  }, [data, activeLocation]);

  return {
    locations:       data?.locations       ?? [FALLBACK_LOCATION],
    communities:     data?.communities     ?? [],
    geofences:       data?.geofences       ?? [],
    recentIncidents: data?.recentIncidents ?? [],
    fieldWorkers:    data?.fieldWorkers    ?? [],
    activeLocation,
    setActiveLocation,
    loading,
    // Expose setters for components that still need to update slices directly
    setLocations:       () => qc.invalidateQueries({ queryKey: QUERY_KEYS.mapData }),
    setRecentIncidents: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.mapData }),
    setFieldWorkers:    () => qc.invalidateQueries({ queryKey: QUERY_KEYS.mapData }),
  };
}
