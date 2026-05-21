"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const OFFER_TIMEOUT_MS = 30 * 60 * 1000;

export function useMyOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOffers = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
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
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = Date.now();
      const annotated = (data || []).map((offer) => {
        const createdAt = new Date(offer.created_at).getTime();
        const remainingMs = Math.max(0, OFFER_TIMEOUT_MS - (now - createdAt));
        const isExpired = offer.status === "pending" && remainingMs === 0;
        return { ...offer, remainingMs, isExpired };
      });

      setOffers(annotated);
    } catch (err) {
      toast.error("Failed to load your offers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyOffers();
    // Refresh every 30s to catch new offers
    const interval = setInterval(fetchMyOffers, 30_000);
    return () => clearInterval(interval);
  }, [fetchMyOffers]);

  const acceptOffer = async (taskId, reportId) => {
    // Optimistic update
    setOffers((prev) =>
      prev.map((o) =>
        o.id === taskId
          ? { ...o, status: "in_progress", started_at: new Date().toISOString() }
          : o
      )
    );
    try {
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", taskId);
      if (taskErr) throw taskErr;

      await supabase
        .from("sanitation_reports")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", reportId);

      toast.success("Offer accepted — task is now active");
    } catch (err) {
      toast.error("Failed to accept offer");
      console.error(err);
      fetchMyOffers();
    }
  };

  const rejectOffer = async (taskId, assignmentId, reportId) => {
    // Optimistic update
    setOffers((prev) =>
      prev.map((o) =>
        o.id === taskId ? { ...o, status: "cancelled" } : o
      )
    );
    try {
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "cancelled" })
        .eq("id", taskId);
      if (taskErr) throw taskErr;

      if (assignmentId) {
        await supabase
          .from("report_assignments")
          .delete()
          .eq("id", assignmentId);
      }

      // Revert report to pending if no assignments remain
      if (reportId) {
        const { data: remaining } = await supabase
          .from("report_assignments")
          .select("id")
          .eq("report_id", reportId);

        if (!remaining || remaining.length === 0) {
          await supabase
            .from("sanitation_reports")
            .update({ status: "pending", updated_at: new Date().toISOString() })
            .eq("id", reportId);
        }
      }

      toast.success("Offer rejected");
    } catch (err) {
      toast.error("Failed to reject offer");
      console.error(err);
      fetchMyOffers();
    }
  };

  const completeTask = async (taskId, reportId) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === taskId
          ? { ...o, status: "completed", completed_at: new Date().toISOString() }
          : o
      )
    );
    try {
      const { error } = await supabase
        .from("service_tasks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", taskId);
      if (error) throw error;

      await supabase
        .from("sanitation_reports")
        .update({ status: "resolved", updated_at: new Date().toISOString() })
        .eq("id", reportId);

      toast.success("Task marked as completed");
    } catch (err) {
      toast.error("Failed to complete task");
      console.error(err);
      fetchMyOffers();
    }
  };

  const pending = offers.filter((o) => o.status === "pending" && !o.isExpired);
  const expired = offers.filter((o) => o.status === "pending" && o.isExpired);
  const active = offers.filter((o) => o.status === "in_progress");
  const closed = offers.filter((o) => ["completed", "cancelled"].includes(o.status));

  return {
    offers,
    pending,
    expired,
    active,
    closed,
    loading,
    acceptOffer,
    rejectOffer,
    completeTask,
    refresh: fetchMyOffers,
  };
}
