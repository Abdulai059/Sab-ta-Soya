"use client";

import { useState } from "react";import { UserCheck, Search, X, ChevronDown, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { useAssignWorker } from "@/hooks/useAssignWorker";
import { useReportFilters } from "@/components/assign-worker/useReportFilters";
import { useReportStats } from "@/components/assign-worker/useReportStats";
import { ReportCard } from "@/components/assign-worker/ReportCard";
import { AssignPageSkeleton } from "@/components/assign-worker/AssignPageSkeleton";

export default function AssignWorkerPage() {
  const {
    reports, workers, loading, assigning, removing,
    assignWorker, unassignWorker, expireOffer, refresh,
  } = useAssignWorker();

  // Filter management
  const {
    filtered,
    search,
    severityFilter,
    statusFilter,
    setSearch,
    setSeverityFilter,
    setStatusFilter,
    clearFilters,
  } = useReportFilters(reports);

  // Statistics
  const { unassigned, completed, critical, total } = useReportStats(reports);

  const handleUnassign = (assignmentId, reportId) => unassignWorker(assignmentId, reportId);

  if (loading) return <AssignPageSkeleton />;

  return (
    <div className="space-y-5">      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-semibold text-gray-900">Assign Workers</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {unassigned} unassigned · {completed} completed · {total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            {critical} critical
          </span>
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-600 font-medium border border-yellow-100">
            <Clock className="w-3.5 h-3.5" />
            {unassigned} pending
          </span>
          <button onClick={refresh}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
            title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" placeholder="Search reports…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400" />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <div className="relative">
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="active">Active only</option>
            <option value="completed">Completed only</option>
            <option value="all">All reports</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {total} reports</span>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">No reports match your filters</p>
          <button onClick={clearFilters}
            className="text-xs text-emerald-600 hover:text-emerald-700">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              workers={workers}
              onAssign={assignWorker}
              onUnassign={handleUnassign}
              onExpire={expireOffer}
              assigning={assigning}
              removing={removing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
