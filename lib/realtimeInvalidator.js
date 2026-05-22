"use client";

import { supabase } from "./supabase";
import { queryClient } from "./queryClient";

/**
 * Sets up Supabase real-time subscriptions that invalidate React Query cache.
 * When any watched table changes, the relevant query keys are invalidated,
 * causing all active useQuery hooks to refetch automatically — exactly like
 * React Query's built-in background refetch behaviour.
 *
 * Call setupRealtimeInvalidation() once at app startup (in a top-level provider).
 * Call teardownRealtimeInvalidation() on unmount.
 */

// Query keys — centralised so hooks and invalidator stay in sync
export const QUERY_KEYS = {
  reports:        ["sanitation_reports"],
  assignments:    ["report_assignments"],
  tasks:          ["service_tasks"],
  profiles:       ["profiles"],
  reportDetail:   (id) => ["report_detail", id],
  myOffers:       (userId) => ["my_offers", userId],
  myOfferCount:   (userId) => ["my_offer_count", userId],
  workerOffers:   ["worker_offers"],
  dashboard:      ["dashboard"],
  mapData:        ["map_data"],
  fieldWorkers:   ["field_workers"],
  workerCases:    (workerId) => ["worker_cases", workerId],
};

let channels = [];

export function setupRealtimeInvalidation() {
  if (channels.length > 0) return; // already set up

  // sanitation_reports → invalidate reports, dashboard, report details, map
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

  // report_assignments → invalidate assignments, reports (card state), dashboard
  channels.push(
    supabase
      .channel("rt_assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "report_assignments" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
        queryClient.invalidateQueries({ queryKey: ["report_detail"] });
        queryClient.invalidateQueries({ queryKey: ["my_offers"] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workerOffers });
      })
      .subscribe()
  );

  // service_tasks → invalidate tasks, worker offers, my offers, offer count
  channels.push(
    supabase
      .channel("rt_tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workerOffers });
        queryClient.invalidateQueries({ queryKey: ["my_offers"] });
        queryClient.invalidateQueries({ queryKey: ["my_offer_count"] });
        queryClient.invalidateQueries({ queryKey: ["report_detail"] });
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

  // user_locations → invalidate field workers on map
  channels.push(
    supabase
      .channel("rt_user_locations")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_locations" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldWorkers });
      })
      .subscribe()
  );

  // locations → invalidate map data when location details change
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
