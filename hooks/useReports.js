"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchReports() {
  // Step 1 — core reports (no joins that can silently fail)
  const { data: reports, error } = await supabase
    .from("sanitation_reports")
    .select(
      `id,
       reference_id,
       issue_type,
       severity,
       status,
       health_risk,
       reporter_phone,
       affected_people_count,
       created_at,
       updated_at,
       assigned_to,
       location:locations(name, area_name, landmark, latitude, longitude),
<<<<<<< HEAD
       community:communities(name, district, region),
       reported_by_profile:profiles!reported_by(full_name, phone),
       climate_event:climate_events(event_type, severity),
       report_assignments(
         id,
         worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role),
         service_tasks(id, status)
       )`
=======
       community:communities(name, district, region)`
>>>>>>> feature/update
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[useReports] reports query error:", error.message);
    toast.error("Failed to load reports");
    throw error;
  }

  if (!reports?.length) return [];

  const reportIds   = reports.map((r) => r.id);
  const assignedIds = [...new Set(reports.map((r) => r.assigned_to).filter(Boolean))];

  // Step 2 — fetch risk assessments + worker profiles in parallel
  const [
    { data: riskRows,  error: riskError },
    { data: profiles,  error: profilesError },
  ] = await Promise.all([
    supabase
      .from("risk_assessments")
      .select("report_id, risk_score, priority_level, escalation_required")
      .in("report_id", reportIds),

    assignedIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("id", assignedIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (riskError)    console.warn("[useReports] risk_assessments error:", riskError.message);
  if (profilesError) console.warn("[useReports] profiles error:", profilesError.message);

  // Step 3 — build lookup maps
  const riskMap   = Object.fromEntries((riskRows  ?? []).map((r) => [r.report_id, r]));
  const workerMap = Object.fromEntries((profiles  ?? []).map((p) => [p.id, p]));

  // Step 4 — merge everything onto each report
  return reports.map((report) => ({
    ...report,
    risk:   riskMap[report.id]                                        ?? null,
    worker: report.assigned_to ? (workerMap[report.assigned_to] ?? null) : null,
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReports() {
  const qc = useQueryClient();

  const { data: reports = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.reports,
    queryFn:  fetchReports,
  });

  const refetch = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.reports });

  return { reports, loading, refetch };
}
