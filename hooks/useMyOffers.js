"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

const OFFER_TIMEOUT_MS = 30 * 60 * 1000;

async function fetchMyOffers(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("service_tasks")
    .select(
      `id, status, task_type, created_at, started_at, completed_at, notes,
       report:sanitation_reports(
         id, reference_id, issue_type, severity, status, description,
         reporter_phone, affected_people_count, health_risk,
         location:locations(
           id, name, type, area_name, landmark, full_location_path,
           latitude, longitude,
           location_images(id, image_url, caption, image_type)
         ),
         community:communities(name, district, region)
       ),
       assignment:report_assignments(
         id, assigned_at, notes,
         assigner:profiles!report_assignments_assigned_by_fkey(id, full_name, role, phone)
       )`
    )
    .eq("assigned_to", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = Date.now();
  return (data || []).map((offer) => {
    const createdAt = new Date(offer.created_at).getTime();
    const remainingMs = Math.max(0, OFFER_TIMEOUT_MS - (now - createdAt));
    return { ...offer, remainingMs, isExpired: offer.status === "pending" && remainingMs === 0 };
  });
}

export function useMyOffers() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const queryKey = QUERY_KEYS.myOffers(user?.id);

  const { data: offers = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchMyOffers(user?.id),
    enabled: !!user?.id,
  });

  // ─── Accept ──────────────────────────────────────────────────────────────

  const { mutate: acceptOffer } = useMutation({
    mutationFn: async ({ taskId, reportId }) => {
      const now = new Date().toISOString();
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "in_progress", started_at: now })
        .eq("id", taskId);
      if (taskErr) throw taskErr;

      await supabase
        .from("sanitation_reports")
        .update({ status: "in_progress", updated_at: now })
        .eq("id", reportId);
    },
    onMutate: async ({ taskId }) => {
      await qc.cancelQueries({ queryKey });
      const snapshot = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old = []) =>
        old.map((o) => o.id === taskId
          ? { ...o, status: "in_progress", started_at: new Date().toISOString() }
          : o
        )
      );
      return { snapshot };
    },
    onSuccess: () => {
      toast.success("Offer accepted — task is now active");
      qc.invalidateQueries({ queryKey });
    },
    onError: (err, _vars, ctx) => {
      toast.error("Failed to accept offer");
      if (ctx?.snapshot) qc.setQueryData(queryKey, ctx.snapshot);
    },
  });

  // ─── Reject ──────────────────────────────────────────────────────────────

  const { mutate: rejectOffer } = useMutation({
    mutationFn: async ({ taskId, assignmentId, reportId }) => {
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "cancelled" })
        .eq("id", taskId);
      if (taskErr) throw taskErr;

      if (assignmentId) {
        await supabase.from("report_assignments").delete().eq("id", assignmentId);
      }

      if (reportId) {
        const { data: remaining } = await supabase
          .from("report_assignments")
          .select("id")
          .eq("report_id", reportId);

        if (!remaining?.length) {
          await supabase
            .from("sanitation_reports")
            .update({ status: "pending", updated_at: new Date().toISOString() })
            .eq("id", reportId);
        }
      }
    },
    onMutate: async ({ taskId }) => {
      await qc.cancelQueries({ queryKey });
      const snapshot = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old = []) =>
        old.map((o) => o.id === taskId ? { ...o, status: "cancelled" } : o)
      );
      return { snapshot };
    },
    onSuccess: () => {
      toast.success("Offer rejected");
      qc.invalidateQueries({ queryKey });
    },
    onError: (err, _vars, ctx) => {
      toast.error("Failed to reject offer");
      if (ctx?.snapshot) qc.setQueryData(queryKey, ctx.snapshot);
    },
  });

  // ─── Complete ────────────────────────────────────────────────────────────

  const { mutate: completeTask } = useMutation({
    mutationFn: async ({ taskId, reportId }) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("service_tasks")
        .update({ status: "completed", completed_at: now })
        .eq("id", taskId);
      if (error) throw error;

      await supabase
        .from("sanitation_reports")
        .update({ status: "resolved", updated_at: now })
        .eq("id", reportId);
    },
    onMutate: async ({ taskId }) => {
      await qc.cancelQueries({ queryKey });
      const snapshot = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old = []) =>
        old.map((o) => o.id === taskId
          ? { ...o, status: "completed", completed_at: new Date().toISOString() }
          : o
        )
      );
      return { snapshot };
    },
    onSuccess: () => {
      toast.success("Task marked as completed");
      qc.invalidateQueries({ queryKey });
    },
    onError: (err, _vars, ctx) => {
      toast.error("Failed to complete task");
      if (ctx?.snapshot) qc.setQueryData(queryKey, ctx.snapshot);
    },
  });

  return {
    offers,
    pending: offers.filter((o) => o.status === "pending" && !o.isExpired),
    expired: offers.filter((o) => o.status === "pending" && o.isExpired),
    active:  offers.filter((o) => o.status === "in_progress"),
    closed:  offers.filter((o) => ["completed", "cancelled"].includes(o.status)),
    loading,
    acceptOffer:  (taskId, reportId) => acceptOffer({ taskId, reportId }),
    rejectOffer:  (taskId, assignmentId, reportId) => rejectOffer({ taskId, assignmentId, reportId }),
    completeTask: (taskId, reportId) => completeTask({ taskId, reportId }),
    refresh: () => qc.invalidateQueries({ queryKey }),
  };
}
