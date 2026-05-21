"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export function useAssignWorker() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  // silent=true → background refresh, don't show skeleton
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [{ data: reportData, error: rErr }, { data: workerData, error: wErr }] =
        await Promise.all([
          supabase
            .from("sanitation_reports")
            .select(
              `id, reference_id, issue_type, severity, status, created_at,
               location:locations(
                 id, name, type, climate_risk, water_access, status,
                 location_images(id, image_url, caption, image_type)
               ),
               community:communities(name, district),
               report_assignments(
                 id, assigned_to, resolved_at,
                 worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role),
                 service_tasks(id, status, task_type, created_at)
               )`
            )
            .not("status", "in", '("resolved","completed","Resolved","cancelled")')
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

      setReports(reportData || []);
      setWorkers(workerData || []);
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignWorker = async (reportId, workerId, notes = "") => {
    if (!user?.id) {
      toast.error("You must be signed in to assign workers");
      return;
    }

    setAssigning(reportId);
    try {
      // 1. Create the assignment row
      const { data: assignment, error: assignError } = await supabase
        .from("report_assignments")
        .insert({
          report_id: reportId,
          assigned_to: workerId,
          assigned_by: user.id,
          notes,
        })
        .select(`
          id,
          assigned_to,
          assigned_by,
          assigned_at,
          notes,
          worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role)
        `)
        .single();

      if (assignError) {
        console.error("Assignment error:", assignError);
        throw assignError;
      }

      // 2. Create a service_task as the 30-min offer (status: pending)
      const { data: task, error: taskError } = await supabase
        .from("service_tasks")
        .insert({
          report_assignment_id: assignment.id,
          report_id: reportId,
          assigned_to: workerId,
          task_type: "field_response",
          status: "pending",
        })
        .select("id, status, task_type, created_at")
        .single();

      if (taskError) {
        console.error("Task creation error:", taskError);
        throw taskError;
      }

      // 3. Update report status to assigned
      const { error: statusError } = await supabase
        .from("sanitation_reports")
        .update({ status: "assigned", updated_at: new Date().toISOString() })
        .eq("id", reportId);

      if (statusError) {
        console.error("Status update error:", statusError);
        throw statusError;
      }

      // 4. Immediately update local state
      setReports((prevReports) =>
        prevReports.map((report) => {
          if (report.id === reportId) {
            return {
              ...report,
              status: "assigned",
              report_assignments: [
                ...(report.report_assignments || []),
                {
                  ...assignment,
                  service_tasks: [task],
                },
              ],
            };
          }
          return report;
        })
      );

      toast.success("Worker assigned — offer sent, 30 min to accept");
      // No fetchData here — optimistic update already reflects the correct state
    } catch (err) {
      toast.error(`Failed to assign worker: ${err.message}`);
      console.error("Assign error:", err);
      // Only re-fetch on error to rollback
      await fetchData(true);
    } finally {
      setAssigning(null);
    }
  };

  const unassignWorker = async (assignmentId, reportId) => {
    // 1. Optimistic update — remove from UI immediately before any network call
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== reportId) return report;
        const updatedAssignments = (report.report_assignments || []).filter(
          (a) => a.id !== assignmentId
        );
        return {
          ...report,
          report_assignments: updatedAssignments,
          status: updatedAssignments.length === 0 ? "pending" : report.status,
        };
      })
    );

    try {
      // 2. Delete linked service tasks first (FK constraint)
      const { error: taskDeleteError } = await supabase
        .from("service_tasks")
        .delete()
        .eq("report_assignment_id", assignmentId);

      if (taskDeleteError) throw taskDeleteError;

      // 3. Delete the assignment
      const { error: assignmentDeleteError } = await supabase
        .from("report_assignments")
        .delete()
        .eq("id", assignmentId);

      if (assignmentDeleteError) throw assignmentDeleteError;

      // 4. Update report status to pending if no assignments remain
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

      toast.success("Worker removed");
      // No fetchData here — optimistic update already reflects the correct state
    } catch (err) {
      toast.error(`Failed to remove worker: ${err.message}`);
      console.error("Unassign error:", err);
      // Only re-fetch on actual error to rollback the optimistic update
      await fetchData(true);
    }
  };

  return { reports, workers, loading, assigning, assignWorker, unassignWorker, refresh: () => fetchData(false) };
}
