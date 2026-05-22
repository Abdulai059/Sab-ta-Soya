import { useMemo } from "react";

/**
 * Custom hook for calculating report statistics
 * @param {Array} reports - Array of reports
 * @returns {Object} Statistics about reports
 */
export function useReportStats(reports) {
  const stats = useMemo(() => {
    const unassigned = reports.filter((r) => {
      const isResolved = ["resolved", "completed", "Resolved"].includes(r.status);
      const task = r.report_assignments?.[0]?.service_tasks?.[0];
      return !isResolved && task?.status !== "completed" && (r.report_assignments || []).length === 0;
    }).length;

    const completed = reports.filter((r) => {
      const isResolved = ["resolved", "completed", "Resolved"].includes(r.status);
      const task = r.report_assignments?.[0]?.service_tasks?.[0];
      return isResolved || task?.status === "completed";
    }).length;

    const critical = reports.filter((r) => r.severity?.toLowerCase() === "critical").length;

    const total = reports.length;

    return {
      unassigned,
      completed,
      critical,
      total,
    };
  }, [reports]);

  return stats;
}
