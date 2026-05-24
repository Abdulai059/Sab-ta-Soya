"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

async function fetchReports() {
  const { data, error } = await supabase
    .from("sanitation_reports")
    .select(
      `id, reference_id, issue_type, severity, status, health_risk,
       reporter_phone, affected_people_count, created_at, updated_at,
       assigned_to,
       location:locations(name, area_name, landmark, latitude, longitude),
       community:communities(name, district, region),
       reported_by_profile:profiles!reported_by(full_name, phone),
       worker:profiles!sanitation_reports_assigned_to_fkey(id, full_name, role),
       risk_assessments(risk_score, priority_level, escalation_required)`
    )
    .order("created_at", { ascending: false });

  if (error) {
    toast.error("Failed to load reports");
    throw error;
  }

  // Flatten the latest risk assessment onto each report for easy access
  return (data || []).map((r) => ({
    ...r,
    risk: r.risk_assessments?.[0] ?? null,
  }));
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
