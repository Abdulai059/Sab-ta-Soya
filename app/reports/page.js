"use client";

export const dynamic = "force-dynamic";

import { Clock, CheckCircle, AlertTriangle, List } from "lucide-react";

import { useAuth }              from "@/context/AuthContext";
import { useReports }           from "@/hooks/useReports";
import { useReportFilters }     from "@/hooks/useReportFilters";
import { usePagination }        from "@/hooks/usePagination";
import { calculateReportStats } from "@/utils/reportStats";
import { formatTimeAgo }        from "@/utils/dateUtils";

import StatsCard       from "@/components/reports/StatsCard";
import FilterButton    from "@/components/reports/FilterButton";
import SearchBar       from "@/components/reports/SearchBar";
import ReportsTable    from "@/components/reports/ReportsTable";
import SignInBanner    from "@/components/reports/SignInBanner";
import Pagination      from "@/components/reports/Pagination";
import ReportsSkeleton from "@/components/reports/ReportsSkeleton";

const FILTERS = [
  { id: "all",      label: "All",              icon: List },
  { id: "pending",  label: "Pending",           icon: Clock },
  { id: "resolved", label: "Verified/Disposed", icon: CheckCircle },
  { id: "critical", label: "Critical",          icon: AlertTriangle },
];

const ITEMS_PER_PAGE = 5;

export default function ReportsPage() {
  const { profile }          = useAuth();
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
  } = usePagination(filteredReports, ITEMS_PER_PAGE);

  const stats = calculateReportStats(reports);

  if (loading) return <ReportsSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1500px] mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sanitation reports</h1>
          <p className="text-gray-600 text-sm mt-1">
            Publicly reported sanitation incidents across Northern Ghana
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatsCard value={stats.total}      label="Total reports" color="gray"    />
          <StatsCard value={stats.pending}    label="Pending"       color="yellow"  />
          <StatsCard value={stats.assigned}   label="Assigned"      color="blue"    />
          <StatsCard value={stats.inProgress} label="In Progress"   color="purple"  />
          <StatsCard value={stats.verified}   label="Verified"      color="emerald" />
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-sm border border-gray-200">
          {FILTERS.map((filter) => (
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
