"use client";

import { useState } from "react";
import { ShieldCheck, ClipboardList, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useDashboardData } from "@/components/admin/useDashboardData";
import MetricCard from "@/components/admin/MetricCard";
import RiskScoringChart from "@/components/admin/RiskScoringChart";
import ViewCasesModal from "@/components/admin/ViewCasesModal";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";
import SecurityDashboard from "@/components/ui/Securitychart";
import RiskComplianceWidget from "@/components/admin/RiskComplianceWidget";

const ASSET_COLORS = [
  "#1e293b", "#334155", "#475569", "#64748b",
  "#94a3b8", "#0f766e", "#0369a1", "#7c3aed",
  "#b45309", "#be123c", "#15803d", "#c2410c",
];

const STATUS_MAP = [
  { name: "Pending",     key: "pending",     color: "#94a3b8" },
  { name: "In Progress", key: "in_progress", color: "#f97316" },
  { name: "Disposed",    key: "disposed",    color: "#22c55e" },
  { name: "Verified",    key: "verified",    color: "#3b82f6" },
  { name: "Cancelled",   key: "cancelled",   color: "#ef4444" },
];

export default function AuthorityDashboard() {
  const {
    metrics,
    issueTypes,
    statusSnap,
    riskPriority,
    riskScoring,
    recentReports = [],
    loading,
  } = useDashboardData();

  const [selectedWorker, setSelectedWorker] = useState(null);

  if (loading) return <DashboardSkeleton />;

  const getSnapCount = (key) =>
    statusSnap.find((s) =>
      s.keys?.some((k) => k.toLowerCase() === key.toLowerCase())
    )?.count ?? 0;

  const scorePct = metrics.total > 0
    ? Math.round((metrics.resolved / metrics.total) * 100)
    : 0;

  const assessmentAvgPct = metrics.total > 0
    ? Math.round((metrics.resolvedInLastWeek / Math.max(metrics.totalInLastWeek, 1)) * 100)
    : 0;

  const assetData = issueTypes.map((t, i) => ({
    name:  t.type,
    value: t.count,
    color: ASSET_COLORS[i % ASSET_COLORS.length],
  }));

  const weeklyPct = metrics.total > 0
    ? Math.round((metrics.totalInLastWeek / metrics.total) * 100)
    : 0;

  const sprsData = STATUS_MAP.map(({ name, key, color }) => ({
    name,
    value: getSnapCount(key),
    color,
  }));

  const riskTotal = riskPriority.reduce((s, r) => s + r.value, 0) || 1;

  const widgetData = {
    date: new Date().toLocaleDateString(),
    donut: riskPriority.map((r) => ({
      label: r.name,
      value: Math.round((r.value / riskTotal) * 100),
      color: r.color,
    })),
    gauge: {
      total:        getSnapCount("verified") + getSnapCount("disposed"),
      compliant:    getSnapCount("verified"),
      pending:      getSnapCount("disposed"),
      nonCompliant: getSnapCount("cancelled"),
    },
    alerts: recentReports.map((r) => ({
      id:      r.id,
      icon:    r.severity === "critical" ? "triangle" : "clock",
      company: r.issue_type ?? "Unknown issue",
      level:   r.severity  ?? "low",
      note:    r.reference_id ?? new Date(r.created_at).toLocaleDateString(),
    })),
  };

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={ClipboardList}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          label="Total reports"
          value={metrics.total}
          delta={`+${metrics.totalInLastWeek} this week`}
          deltaUp={false}
        />
        <MetricCard
          icon={AlertTriangle}
          iconBg="#fee2e2"
          iconColor="#ef4444"
          label="Open incidents"
          value={metrics.open}
          delta={`+${metrics.openSinceYesterday} since yesterday`}
          deltaUp={true}
        />
        <MetricCard
          icon={CheckCircle}
          iconBg="#dcfce7"
          iconColor="#16a34a"
          label="Resolved"
          value={metrics.resolved}
          delta={`+${metrics.resolvedInLastWeek} this week`}
          deltaUp={false}
        />
        <MetricCard
          icon={Clock}
          iconBg="#fef9c3"
          iconColor="#ca8a04"
          label="Avg response"
          value={`${metrics.avgResponseHours}h`}
          delta="↓ improving"
          deltaUp={false}
        />
      </div>

      <SecurityDashboard
        scorePct={scorePct}
        assessmentAvgPct={assessmentAvgPct}
        weekDelta={metrics.totalInLastWeek}
        openCritical={metrics.open}
        assetData={assetData}
        totalReports={metrics.total}
        weeklyPct={weeklyPct}
        sprsData={sprsData}
        openCount={metrics.open}
      />

      <RiskComplianceWidget data={widgetData} />

      <RiskScoringChart riskScoring={riskScoring} />

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
