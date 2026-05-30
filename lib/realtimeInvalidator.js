"use client";

import { supabase } from "./supabase";
import { queryClient } from "./queryClient";

// ─── Centralised query keys ───────────────────────────────────────────────────
export const QUERY_KEYS = {
  reports:           ["sanitation_reports"],
  profiles:          ["profiles"],
  reportDetail:      (id)       => ["report_detail", id],
  dashboard:         ["dashboard"],
  mapData:           ["map_data"],
  fieldWorkers:      ["field_workers"],
};

let channels = [];

export function setupRealtimeInvalidation() {
  if (channels.length > 0) return;

  // sanitation_reports → invalidate everything that depends on report state
  channels.push(
    supabase
      .channel("rt_reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "sanitation_reports" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
        queryClient.invalidateQueries({ queryKey: ["report_detail"] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mapData });
      })
      .subscribe()
  );

  // profiles → invalidate worker lists
  channels.push(
    supabase
      .channel("rt_profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profiles });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      })
      .subscribe()
  );

  // user_locations → field workers on map
  channels.push(
    supabase
      .channel("rt_user_locations")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_locations" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldWorkers });
      })
      .subscribe()
  );

  // locations → map data
  channels.push(
    supabase
      .channel("rt_locations")
      .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mapData });
      })
      .subscribe()
  );
}

export function teardownRealtimeInvalidation() {
  channels.forEach((ch) => supabase.removeChannel(ch));
  channels = [];
}
