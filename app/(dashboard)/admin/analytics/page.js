"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useDashboardData } from "@/components/admin/useDashboardData";
import { Card, CardTitle } from "@/components/admin/DashboardCard";
import MetricCard from "@/components/admin/MetricCard";
import TrendChart from "@/components/admin/TrendChart";
import SeverityChart from "@/components/admin/SeverityChart";
import IssueTypesChart from "@/components/admin/IssueTypesChart";
import StatusSnapshot from "@/components/admin/StatusSnapshot";
import WorkerRow from "@/components/admin/WorkerRow";
import ViewCasesModal from "@/components/admin/ViewCasesModal";
import { WorkersEmptyState } from "@/components/admin/DashboardStates";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";

export default function AuthorityDashboard() {
  const { metrics, severity, issueTypes, trend, statusSnap, workers, loading } =
    useDashboardData();

  const [selectedWorker, setSelectedWorker] = useState(null);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5 max-w-[1400px] pt-15 mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h1 className="text-lg font-semibold text-gray-800">Sab&apos;ta Soya</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium">
              Authority
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5 ml-8">
            Northern Ghana sanitation intelligence
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={ClipboardList}
          label="Total reports"
          value={metrics.total}
          delta={`+${metrics.totalInLastWeek} this week`}
          deltaUp
        />
        <MetricCard
          icon={AlertTriangle}
          label="Open incidents"
          value={metrics.open}
          delta={`+${metrics.openSinceYesterday} since yesterday`}
          deltaUp
        />
        <MetricCard
          icon={CheckCircle}
          label="Resolved"
          value={metrics.resolved}
          delta={`+${metrics.resolvedInLastWeek} this week`}
        />
        <MetricCard
          icon={Clock}
          label="Avg response"
          value={`${metrics.avgResponseHours}h`}
          delta="↓ improving"
        />
      </div>

      {/* Trend + Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrendChart trend={trend} />
        <SeverityChart
          severity={severity}
          resolved={metrics.resolved}
          total={metrics.total}
        />
      </div>

      {/* Issue types + Status snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IssueTypesChart issueTypes={issueTypes} />
        <StatusSnapshot statusSnap={statusSnap} />
      </div>

      {/* Worker performance */}
      <Card>
        <CardTitle>Worker performance — resolved cases</CardTitle>
        {workers.length === 0 ? (
          <WorkersEmptyState />
        ) : (
          workers.map((w, i) => (
            <WorkerRow
              key={w.name + i}
              worker={w}
              max={workers[0].cases}
              onViewCases={setSelectedWorker}
            />
          ))
        )}
      </Card>

      <p className="text-center text-xs text-gray-300 pb-4">
        Sab&apos;ta Soya · UNICEF StartUp Lab 2026 · Northern Ghana
      </p>

      {selectedWorker && (
        <ViewCasesModal
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}
