"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

const OFFER_TIMEOUT_MS = 30 * 60 * 1000;

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchAssignData() {
  const [{ data: reportData, error: rErr }, { data: workerData, error: wErr }] =
    await Promise.all([
      supabase
        .from("sanitation_reports")
        .select(
          `id, reference_id, issue_type, severity, status, created_at,
           reporter_phone,
           location:locations(
             id, name, type, climate_risk, water_access, status,
             location_images(id, image_url, caption, image_type)
           ),
           community:communities(name, district),
           report_assignments(
             id, assigned_to, resolved_at,
             worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role),
             service_tasks(id, status, task_type, created_at, started_at, completed_at)
           )`
        )
        .not("status", "in", '("cancelled")')
        .order("created_at", { ascending: false }),

      supabase
        .from("profiles")
        .select("id, full_name, role, organization, phone")
        .in("role", [
          "sanitation_worker",
          "field_worker",
          "response_team",
          "operator",
          "community_officer",
        ])
        .order("full_name"),
    ]);

  if (rErr) throw rErr;
  if (wErr) throw wErr;

  // Annotate tasks with expiry info
  const now = Date.now();
  const reports = (reportData || []).map((report) => ({
    ...report,
    report_assignments: (report.report_assignments || []).map((a) => ({
      ...a,
      service_tasks: (a.service_tasks || []).map((t) => {
        const elapsed = now - new Date(t.created_at).getTime();
        return { ...t, isExpired: t.status === "pending" && elapsed >= OFFER_TIMEOUT_MS };
      }),
    })),
  }));

  return { reports, workers: workerData || [] };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAssignWorker() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.reports,
    queryFn: fetchAssignData,
    // staleTime: 0 (global default) → always refetch on focus/reconnect
  });

  const reports = data?.reports ?? [];
  const workers = data?.workers ?? [];

  // ─── Expire offer ────────────────────────────────────────────────────────

  const expireOffer = useCallback(async (assignmentId, taskId, reportId) => {
    // Optimistic: remove assignment from cache immediately
    qc.setQueryData(QUERY_KEYS.reports, (old) => {
      if (!old) return old;
      return {
        ...old,
        reports: old.reports.map((r) =>
          r.id !== reportId ? r : { ...r, status: "pending", report_assignments: [] }
        ),
      };
    });

    try {
      if (taskId) {
        await supabase.from("service_tasks").update({ status: "cancelled" }).eq("id", taskId);
      }
      if (assignmentId) {
        await supabase.from("report_assignments").delete().eq("id", assignmentId);
      }
      await supabase
        .from("sanitation_reports")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", reportId);

      toast("Offer expired — please reassign", { icon: "⏰" });
    } catch (err) {
      console.error("Expire error:", err);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports });
    }
  }, [qc]);

  // ─── Assign worker ───────────────────────────────────────────────────────

  const { mutate: assignWorker, variables: assigningReportId } = useMutation({
    mutationFn: async ({ reportId, workerId, notes = "" }) => {
      if (!user?.id) throw new Error("You must be signed in to assign workers");

      const report = reports.find((r) => r.id === reportId);
      const existingAssignments = report?.report_assignments || [];

      // One worker at a time — cancel & delete any existing
      for (const existing of existingAssignments) {
        await supabase.from("service_tasks").update({ status: "cancelled" }).eq("report_assignment_id", existing.id);
        await supabase.from("report_assignments").delete().eq("id", existing.id);
      }

      const { data: assignment, error: assignError } = await supabase
        .from("report_assignments")
        .insert({ report_id: reportId, assigned_to: workerId, assigned_by: user.id, notes })
        .select(`id, assigned_to, assigned_by, assigned_at, notes,
                 worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role)`)
        .single();
      if (assignError) throw assignError;

      const { data: task, error: taskError } = await supabase
        .from("service_tasks")
        .insert({
          report_assignment_id: assignment.id,
          report_id: reportId,
          assigned_to: workerId,
          task_type: "field_response",
          status: "pending",
        })
        .select("id, status, task_type, created_at, started_at, completed_at")
        .single();
      if (taskError) throw taskError;

      const { error: statusError } = await supabase
        .from("sanitation_reports")
        .update({ status: "assigned", updated_at: new Date().toISOString() })
        .eq("id", reportId);
      if (statusError) throw statusError;

      return { reportId, assignment, task, wasReassign: existingAssignments.length > 0 };
    },

    onSuccess: ({ reportId, assignment, task, wasReassign }) => {
      // Optimistic update into cache
      qc.setQueryData(QUERY_KEYS.reports, (old) => {
        if (!old) return old;
        return {
          ...old,
          reports: old.reports.map((r) =>
            r.id !== reportId ? r : {
              ...r,
              status: "assigned",
              report_assignments: [{ ...assignment, service_tasks: [{ ...task, isExpired: false }] }],
            }
          ),
        };
      });
      toast.success(wasReassign
        ? "Worker changed — new offer sent, 30 min to accept"
        : "Worker assigned — offer sent, 30 min to accept"
      );
    },

    onError: (err) => {
      toast.error(`Failed to assign worker: ${err.message}`);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports });
    },
  });

  // ─── Unassign worker ─────────────────────────────────────────────────────

  const { mutate: unassignWorker, variables: removingAssignmentId } = useMutation({
    mutationFn: async ({ assignmentId, reportId }) => {
      const { error: taskErr } = await supabase
        .from("service_tasks")
        .update({ status: "cancelled" })
        .eq("report_assignment_id", assignmentId);
      if (taskErr) throw taskErr;

      const { error: assignErr } = await supabase
        .from("report_assignments")
        .delete()
        .eq("id", assignmentId);
      if (assignErr) throw assignErr;

      const { error: statusErr } = await supabase
        .from("sanitation_reports")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", reportId);
      if (statusErr) throw statusErr;

      return { assignmentId, reportId };
    },

    onMutate: async ({ assignmentId, reportId }) => {
      // Optimistic: remove worker from card immediately
      await qc.cancelQueries({ queryKey: QUERY_KEYS.reports });
      const snapshot = qc.getQueryData(QUERY_KEYS.reports);
      qc.setQueryData(QUERY_KEYS.reports, (old) => {
        if (!old) return old;
        return {
          ...old,
          reports: old.reports.map((r) =>
            r.id !== reportId ? r : { ...r, report_assignments: [], status: "pending" }
          ),
        };
      });
      return { snapshot };
    },

    onSuccess: () => {
      toast.success("Worker removed — report is open for reassignment");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports });
    },

    onError: (err, _vars, ctx) => {
      toast.error(`Failed to remove worker: ${err.message}`);
      if (ctx?.snapshot) qc.setQueryData(QUERY_KEYS.reports, ctx.snapshot);
    },
  });

  return {
    reports,
    workers,
    loading: isLoading,
    // expose the currently-in-flight IDs so cards can show spinners
    assigning: assigningReportId?.reportId ?? null,
    removing: removingAssignmentId?.assignmentId ?? null,
    assignWorker: (reportId, workerId, notes) => assignWorker({ reportId, workerId, notes }),
    unassignWorker: (assignmentId, reportId) => unassignWorker({ assignmentId, reportId }),
    expireOffer,
    refresh: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.reports }),
  };
}
