"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

const OFFER_TIMEOUT_MINUTES = 30;
const OFFER_TIMEOUT_MS = OFFER_TIMEOUT_MINUTES * 60 * 1000;

async function fetchWorkerOffers() {
  const { data, error } = await supabase
    .from("service_tasks")
    .select(
      `id, status, task_type, created_at, started_at, completed_at, notes,
       report:sanitation_reports(
         id, reference_id, issue_type, severity, status, description,
         reporter_phone, affected_people_count, health_risk,
         location:locations(name),
         community:communities(name, district)
       ),
       assignment:report_assignments(
         id, assigned_at, notes,
         assigner:profiles!report_assignments_assigned_by_fkey(id, full_name, role),
         worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role)
       ),
       worker:profiles!service_tasks_assigned_to_fkey(id, full_name, role)`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = Date.now();
  return (data || []).map((offer) => {
    const createdAt = new Date(offer.created_at).getTime();
    const remainingMs = Math.max(0, OFFER_TIMEOUT_MS - (now - createdAt));
    return { ...offer, remainingMs, isExpired: offer.status === "pending" && remainingMs === 0 };
  });
}

export function useWorkerOffers() {
  const qc = useQueryClient();

  const { data: offers = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.workerOffers,
    queryFn: fetchWorkerOffers,
  });

  const { mutate: acceptOffer } = useMutation({
    mutationFn: async ({ taskId }) => {
      const now = new Date().toISOString();
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "in_progress", started_at: now })
        .eq("id", taskId);
      if (taskErr) throw taskErr;

      const { data: task } = await supabase
        .from("service_tasks")
        .select("report_id")
        .eq("id", taskId)
        .single();

      if (task?.report_id) {
        await supabase
          .from("sanitation_reports")
          .update({ status: "in_progress", updated_at: now })
          .eq("id", task.report_id);
      }
    },
    onSuccess: () => {
      toast.success("Offer accepted — task is now in progress");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.workerOffers });
    },
    onError: () => toast.error("Failed to accept offer"),
  });

  const { mutate: rejectOffer } = useMutation({
    mutationFn: async ({ taskId, assignmentId }) => {
      await supabase.from("service_tasks").update({ status: "cancelled" }).eq("id", taskId);
      await supabase.from("report_assignments").delete().eq("id", assignmentId);

      const { data: task } = await supabase
        .from("service_tasks")
        .select("report_id")
        .eq("id", taskId)
        .single();

      if (task?.report_id) {
        const { data: remaining } = await supabase
          .from("report_assignments")
          .select("id")
          .eq("report_id", task.report_id);

        if (!remaining?.length) {
          await supabase
            .from("sanitation_reports")
            .update({ status: "pending", updated_at: new Date().toISOString() })
            .eq("id", task.report_id);
        }
      }
    },
    onSuccess: () => {
      toast.success("Offer rejected — report returned to unassigned");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.workerOffers });
    },
    onError: () => toast.error("Failed to reject offer"),
  });

  const { mutate: expireOffer } = useMutation({
    mutationFn: async ({ taskId, assignmentId }) => {
      await supabase.from("service_tasks").update({ status: "cancelled" }).eq("id", taskId);
      await supabase.from("report_assignments").delete().eq("id", assignmentId);
    },
    onSuccess: () => {
      toast("Offer expired and removed", { icon: "⏰" });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.workerOffers });
    },
  });

  return {
    offers,
    pendingOffers: offers.filter((o) => o.status === "pending" && !o.isExpired),
    expiredOffers: offers.filter((o) => o.status === "pending" && o.isExpired),
    activeOffers:  offers.filter((o) => o.status === "in_progress"),
    closedOffers:  offers.filter((o) => ["completed", "cancelled"].includes(o.status)),
    loading,
    acceptOffer: (taskId, assignmentId) => acceptOffer({ taskId, assignmentId }),
    rejectOffer: (taskId, assignmentId) => rejectOffer({ taskId, assignmentId }),
    expireOffer: (taskId, assignmentId) => expireOffer({ taskId, assignmentId }),
    refresh: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.workerOffers }),
  };
}
