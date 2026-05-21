"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const OFFER_TIMEOUT_MINUTES = 30;

export function useWorkerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
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

      // Annotate each offer with timeout info
      const now = Date.now();
      const annotated = (data || []).map((offer) => {
        const createdAt = new Date(offer.created_at).getTime();
        const elapsedMs = now - createdAt;
        const timeoutMs = OFFER_TIMEOUT_MINUTES * 60 * 1000;
        const remainingMs = Math.max(0, timeoutMs - elapsedMs);
        const isExpired = offer.status === "pending" && remainingMs === 0;
        return { ...offer, remainingMs, isExpired };
      });

      setOffers(annotated);
    } catch (err) {
      toast.error("Failed to load offers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    // Refresh every minute to update countdown timers
    const interval = setInterval(fetchOffers, 60_000);
    return () => clearInterval(interval);
  }, [fetchOffers]);

  const acceptOffer = async (taskId, assignmentId) => {
    try {
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", taskId);

      if (taskErr) throw taskErr;

      // Update report status to in_progress
      const { data: task } = await supabase
        .from("service_tasks")
        .select("report_id")
        .eq("id", taskId)
        .single();

      if (task?.report_id) {
        await supabase
          .from("sanitation_reports")
          .update({ status: "in_progress", updated_at: new Date().toISOString() })
          .eq("id", task.report_id);
      }

      toast.success("Offer accepted — task is now in progress");
      await fetchOffers();
    } catch (err) {
      toast.error("Failed to accept offer");
      console.error(err);
    }
  };

  const rejectOffer = async (taskId, assignmentId) => {
    try {
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "cancelled" })
        .eq("id", taskId);

      if (taskErr) throw taskErr;

      // Delete the assignment so the report goes back to unassigned
      await supabase
        .from("report_assignments")
        .delete()
        .eq("id", assignmentId);

      // Check if report has any remaining assignments
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

        if (!remaining || remaining.length === 0) {
          await supabase
            .from("sanitation_reports")
            .update({ status: "pending", updated_at: new Date().toISOString() })
            .eq("id", task.report_id);
        }
      }

      toast.success("Offer rejected — report returned to unassigned");
      await fetchOffers();
    } catch (err) {
      toast.error("Failed to reject offer");
      console.error(err);
    }
  };

  const expireOffer = async (taskId, assignmentId) => {
    try {
      await supabase
        .from("service_tasks")
        .update({ status: "cancelled" })
        .eq("id", taskId);

      await supabase
        .from("report_assignments")
        .delete()
        .eq("id", assignmentId);

      toast("Offer expired and removed", { icon: "⏰" });
      await fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingOffers = offers.filter((o) => o.status === "pending" && !o.isExpired);
  const expiredOffers = offers.filter((o) => o.status === "pending" && o.isExpired);
  const activeOffers = offers.filter((o) => o.status === "in_progress");
  const closedOffers = offers.filter((o) => ["completed", "cancelled"].includes(o.status));

  return {
    offers,
    pendingOffers,
    expiredOffers,
    activeOffers,
    closedOffers,
    loading,
    acceptOffer,
    rejectOffer,
    expireOffer,
    refresh: fetchOffers,
  };
}
