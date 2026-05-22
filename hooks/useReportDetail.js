"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

async function fetchReportDetail(reportId) {
  const { data: reportData, error: reportError } = await supabase
    .from("sanitation_reports")
    .select(
      `*,
       location:locations(
         id, name, area_name, landmark, latitude, longitude,
         type, status, water_access, climate_risk, description
       ),
       community:communities(name, district, region, latitude, longitude),
       reported_by_profile:profiles!reported_by(full_name, phone, role, organization),
       climate_event:climate_events(event_type, severity, start_date, end_date, impact_notes)`
    )
    .eq("id", reportId)
    .single();

  if (reportError) {
    toast.error("Failed to load report details");
    throw reportError;
  }

  // Location images
  let locationImages = [];
  if (reportData?.location?.id) {
    const { data: imagesData } = await supabase
      .from("location_images")
      .select("id, image_url, image_type, caption")
      .eq("location_id", reportData.location.id)
      .order("created_at", { ascending: true });
    locationImages = imagesData || [];
  }

  // Assignments — include service_tasks so we can show task progress
  const { data: assignmentsData } = await supabase
    .from("report_assignments")
    .select(
      `id, assigned_at, arrived_at, resolved_at, notes,
       assigned_to_profile:profiles!assigned_to(full_name, phone, role),
       assigned_by_profile:profiles!assigned_by(full_name, role),
       service_tasks(id, status, task_type, created_at, started_at, completed_at)`
    )
    .eq("report_id", reportId)
    .order("assigned_at", { ascending: false });

  // Status history
  const { data: historyData } = await supabase
    .from("report_status_history")
    .select(`*, changed_by_profile:profiles!changed_by(full_name, role)`)
    .eq("report_id", reportId)
    .order("changed_at", { ascending: false });

  return {
    report: reportData,
    assignments: assignmentsData || [],
    statusHistory: historyData || [],
    locationImages,
  };
}

export function useReportDetail(reportId) {
  const qc = useQueryClient();
  const queryKey = QUERY_KEYS.reportDetail(reportId);

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchReportDetail(reportId),
    enabled: !!reportId,
  });

  return {
    report:        data?.report        ?? null,
    assignments:   data?.assignments   ?? [],
    statusHistory: data?.statusHistory ?? [],
    locationImages: data?.locationImages ?? [],
    loading,
    refetch: () => qc.invalidateQueries({ queryKey }),
  };
}
