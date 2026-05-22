import { useState, useMemo } from "react";
import { getDerivedStatus } from "@/utils/reportStatus";

export function useReportFilters(reports) {
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Filter on derived status so service_tasks drives the result
    if (activeFilter !== "all" && activeFilter !== "critical" && activeFilter !== "climate") {
      filtered = filtered.filter((r) => {
        const derived = getDerivedStatus(r);
        if (activeFilter === "pending")     return derived === "pending";
        if (activeFilter === "offer_sent")  return derived === "offer_sent";
        if (activeFilter === "in_progress") return derived === "in_progress";
        if (activeFilter === "resolved")    return derived === "completed" || derived === "resolved";
        return true;
      });
    } else if (activeFilter === "critical") {
      filtered = filtered.filter((r) => r.severity?.toLowerCase() === "critical" || r.health_risk);
    } else if (activeFilter === "climate") {
      filtered = filtered.filter((r) => r.climate_event_id);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reference_id?.toLowerCase().includes(q) ||
          r.issue_type?.toLowerCase().includes(q) ||
          r.location?.name?.toLowerCase().includes(q) ||
          r.community?.name?.toLowerCase().includes(q)
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
