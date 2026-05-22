"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

async function fetchReports() {
  const { data, error } = await supabase
    .from("sanitation_reports")
    .select(
      `*,
       location:locations(name, area_name, landmark, latitude, longitude),
       community:communities(name, district, region),
       reported_by_profile:profiles!reported_by(full_name, phone),
       climate_event:climate_events(event_type, severity),
       report_assignments(
         id,
         worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role),
         service_tasks(id, status)
       )`
    )
    .order("created_at", { ascending: false });

  if (error) {
    toast.error("Failed to load reports");
    throw error;
  }

  return data || [];
}

export function useReports() {
  const qc = useQueryClient();

  const { data: reports = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.reports,
    queryFn: fetchReports,
  });

  return {
    reports,
    loading,
    refetch: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.reports }),
  };
}
