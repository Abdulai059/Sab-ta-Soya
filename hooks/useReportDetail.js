"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";

async function fetchReportDetail(reportId) {
  const { data: reportData, error: reportError } = await supabase
    .from("sanitation_reports")
    .select(
      `id, reference_id, issue_type, severity, health_risk, description,
       reporter_phone, status, created_at, updated_at,
       location_id, reported_by, affected_people_count, community_id,
       is_anonymous, assigned_to,
       location:locations(id, name, area_name, landmark, latitude, longitude, type, climate_risk),
       community:communities(name, district, region)`
    )
    .eq("id", reportId)
    .single();

  if (reportError) throw reportError;

  const profileIds = [reportData.assigned_to, reportData.reported_by].filter(Boolean);
  let profileMap = {};
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, avatar_url")
      .in("id", profileIds);
    profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  }

  const report = {
    ...reportData,
    worker:              reportData.assigned_to ? (profileMap[reportData.assigned_to] ?? null) : null,
    reported_by_profile: reportData.reported_by  ? (profileMap[reportData.reported_by]  ?? null) : null,
  };

  let locationImages = [];
  if (reportData?.location_id) {
    const { data: imagesData } = await supabase
      .from("location_images")
      .select("id, image_url, image_type, caption")
      .eq("location_id", reportData.location_id)
      .order("created_at", { ascending: true });
    locationImages = imagesData || [];
  }

  const { data: historyData } = await supabase
    .from("report_status_history")
    .select("id, old_status, new_status, changed_at, notes, changed_by")
    .eq("report_id", reportId)
    .order("changed_at", { ascending: false });

  const changerIds = [...new Set((historyData || []).map((h) => h.changed_by).filter(Boolean))];
  let changerMap = {};
  if (changerIds.length > 0) {
    const { data: changers } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", changerIds);
    changerMap = Object.fromEntries((changers || []).map((p) => [p.id, p]));
  }

  const statusHistory = (historyData || []).map((h) => ({
    ...h,
    changed_by_profile: h.changed_by ? (changerMap[h.changed_by] ?? null) : null,
  }));

  const { data: riskData, error: riskError } = await supabase
    .from("risk_assessments")
    .select(
      `id, risk_score, priority_level, near_school, near_water_source,
       flood_zone, drought_zone, repeated_incident, affected_children_count,
       escalation_required, created_at`
    )
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (riskError) console.warn("[useReportDetail] risk error:", riskError.message);

  return {
    report,
    statusHistory,
    locationImages,
    riskAssessment: riskData ?? null,
    assignments: [],
  };
}

export function useReportDetail(reportId) {
  const qc       = useQueryClient();
  const queryKey = QUERY_KEYS.reportDetail(reportId);

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchReportDetail(reportId),
    enabled: !!reportId,
  });

  useEffect(() => {
    if (!reportId) return;

    const channel = supabase
      .channel(`report_detail_${reportId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sanitation_reports", filter: `id=eq.${reportId}` },
        (payload) => {
          qc.setQueryData(queryKey, (old) => {
            if (!old) return old;
            return {
              ...old,
              report: {
                ...old.report,
                status:      payload.new.status,
                assigned_to: payload.new.assigned_to,
                updated_at:  payload.new.updated_at,
              },
            };
          });
          qc.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [reportId, qc, queryKey]);

  return {
    report:        data?.report        ?? null,
    assignments:   data?.assignments   ?? [],
    statusHistory: data?.statusHistory ?? [],
    locationImages: data?.locationImages ?? [],
    riskAssessment: data?.riskAssessment ?? null,
    loading,
    refetch: () => qc.invalidateQueries({ queryKey }),
  };
}
