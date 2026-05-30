import { useState, useMemo } from "react";

const DONE_STATUSES = ["disposed", "verified"];

export function useReportFilters(reports) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredReports = useMemo(() => {
    let filtered = reports ?? [];

    if (activeFilter === "pending") {
      filtered = filtered.filter((r) => r.status === "pending" || r.status === "assigned");
    } else if (activeFilter === "resolved") {
      filtered = filtered.filter((r) => DONE_STATUSES.includes(r.status));
    } else if (activeFilter === "critical") {
      filtered = filtered.filter((r) => r.severity === "critical" || r.health_risk);
    } else if (activeFilter === "climate") {
      filtered = filtered.filter((r) => r.climate_event_id);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reference_id?.toLowerCase().includes(q) ||
          r.issue_type?.toLowerCase().includes(q) ||
          r.location?.name?.toLowerCase().includes(q) ||
          r.community?.name?.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [reports, activeFilter, searchQuery]);

  return {
    filteredReports,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
  };
}
