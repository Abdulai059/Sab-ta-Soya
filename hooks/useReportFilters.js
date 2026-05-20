import { useState, useEffect } from "react";

export function useReportFilters(reports) {
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    filterReports();
  }, [reports, activeFilter, searchQuery]);

  const filterReports = () => {
    let filtered = [...reports];

    if (activeFilter === "pending") {
      filtered = filtered.filter(
        (r) => r.status === "pending" || r.status === "assigned"
      );
    } else if (activeFilter === "resolved") {
      filtered = filtered.filter((r) => r.status === "completed");
    } else if (activeFilter === "critical") {
      filtered = filtered.filter((r) => r.severity === "critical" || r.health_risk);
    } else if (activeFilter === "climate") {
      filtered = filtered.filter((r) => r.climate_event_id);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.reference_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.issue_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.community?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  return {
    filteredReports,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
  };
}
