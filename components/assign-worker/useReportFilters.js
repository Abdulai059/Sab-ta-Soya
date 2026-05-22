import { useState, useMemo } from "react";
import { SEVERITY_ORDER } from "./constants";

/**
 * Custom hook for managing report filtering and sorting
 * @param {Array} reports - Array of reports to filter
 * @returns {Object} Filtered reports and filter controls
 */
export function useReportFilters(reports) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active"); // default: hide completed

  const filtered = useMemo(() => {
    return reports
      .filter((r) => {
        // Search filter
        const matchSearch =
          !search ||
          r.issue_type?.toLowerCase().includes(search.toLowerCase()) ||
          r.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
          r.location?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.community?.name?.toLowerCase().includes(search.toLowerCase());

        // Severity filter
        const matchSeverity = severityFilter === "all" || r.severity?.toLowerCase() === severityFilter;

        // Status filter
        const isResolved = ["resolved", "completed", "Resolved"].includes(r.status);
        const task = r.report_assignments?.[0]?.service_tasks?.[0];
        const isTaskCompleted = task?.status === "completed";
        const isDone = isResolved || isTaskCompleted;

        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && !isDone) ||
          (statusFilter === "completed" && isDone);

        return matchSearch && matchSeverity && matchStatus;
      })
      .sort((a, b) =>
        (SEVERITY_ORDER[a.severity?.toLowerCase()] ?? 9) -
        (SEVERITY_ORDER[b.severity?.toLowerCase()] ?? 9)
      );
  }, [reports, search, severityFilter, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setSeverityFilter("all");
    setStatusFilter("active");
  };

  return {
    // Filtered data
    filtered,
    
    // Filter state
    search,
    severityFilter,
    statusFilter,
    
    // Filter setters
    setSearch,
    setSeverityFilter,
    setStatusFilter,
    
    // Utilities
    clearFilters,
  };
}
