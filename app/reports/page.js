"use client";

import { useAuth } from "@/context/AuthContext";
import { Clock, CheckCircle, AlertTriangle, Cloud, List } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { useReportFilters } from "@/hooks/useReportFilters";
import { usePagination } from "@/hooks/usePagination";
import { calculateReportStats } from "@/utils/reportStats";
import { formatTimeAgo } from "@/utils/dateUtils";
import StatsCard from "@/components/reports/StatsCard";
import FilterButton from "@/components/reports/FilterButton";
import SearchBar from "@/components/reports/SearchBar";
import ReportsTable from "@/components/reports/ReportsTable";
import SignInBanner from "@/components/reports/SignInBanner";
import Pagination from "@/components/reports/Pagination";

export default function ReportsPage() {
  const { profile } = useAuth();
  const { reports, loading } = useReports();
  const {
    filteredReports,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
  } = useReportFilters(reports);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination(filteredReports, 5);

  const stats = calculateReportStats(reports);

  const filters = [
    { id: "all", label: "All", icon: List },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "resolved", label: "Completed", icon: CheckCircle },
    { id: "critical", label: "Critical", icon: AlertTriangle },
    { id: "climate", label: "Climate-linked", icon: Cloud },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1500px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Sanitation reports
          </h1>
          <p className="text-gray-600 text-sm">
            Publicly reported sanitation incidents across Northern Ghana
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatsCard value={stats.total} label="Total reports" color="gray" />
          <StatsCard value={stats.pending} label="Pending" color="yellow" />
          <StatsCard value={stats.assigned} label="Assigned" color="blue" />
          <StatsCard value={stats.resolved} label="Completed" color="emerald" />
          <StatsCard value={stats.critical} label="Critical / health risk" color="red" />
        </div>

        <div className="flex flex-wrap gap-3 mb-6 mt-4 bg-white">
          {filters.map((filter) => (
            <FilterButton
              key={filter.id}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
              icon={filter.icon}
              label={filter.label}
            />
          ))}

          <div className="ml-auto">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location or issue..."
            />
          </div>
        </div>

        <ReportsTable
          reports={paginatedItems}
          profile={profile}
          formatTimeAgo={formatTimeAgo}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />

        {!profile && <SignInBanner />}
      </div>
    </div>
  );
}
