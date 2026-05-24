"use client";

import {
  ShieldAlert,
  AlertTriangle,
  School,
  Droplets,
  Waves,
  Sun,
  RefreshCw,
  Users,
  Bell,
  CheckCircle,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

function getPriorityConfig(level) {
  switch (level) {
    case "critical":
      return {
        label: "Critical",
        bar: "bg-red-500",
        badge: "bg-red-100 text-red-700 border-red-200",
        ring: "border-red-200",
        icon: "text-red-500",
      };
    case "high":
      return {
        label: "High",
        bar: "bg-orange-500",
        badge: "bg-orange-100 text-orange-700 border-orange-200",
        ring: "border-orange-200",
        icon: "text-orange-500",
      };
    case "medium":
      return {
        label: "Medium",
        bar: "bg-yellow-500",
        badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
        ring: "border-yellow-200",
        icon: "text-yellow-500",
      };
    default:
      return {
        label: "Low",
        bar: "bg-blue-400",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        ring: "border-blue-200",
        icon: "text-blue-400",
      };
  }
}

function RiskFactor({ icon: Icon, label, active, color = "text-emerald-600" }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
        active
          ? "bg-white border-gray-200 text-gray-800"
          : "bg-gray-50 border-gray-100 text-gray-400"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? color : "text-gray-300"}`} />
      <span className={active ? "font-medium" : ""}>{label}</span>
      {active ? (
        <CheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-500" />
      ) : (
        <span className="ml-auto w-3.5 h-3.5 rounded-full border border-gray-200 bg-gray-100" />
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function RiskAssessmentCard({ risk }) {
  if (!risk) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Risk Assessment</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No assessment yet</p>
          <p className="text-xs text-gray-400 max-w-xs">
            Risk assessment is generated automatically when a report is submitted.
          </p>
        </div>
      </div>
    );
  }

  const cfg = getPriorityConfig(risk.priority_level);
  // Score bar: max meaningful score is ~100
  const barWidth = Math.min(risk.risk_score, 100);

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${cfg.ring}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${cfg.icon}`} />
          <h2 className="text-base font-semibold text-gray-900">Risk Assessment</h2>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
          {cfg.label} Priority
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Score gauge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">Risk Score</span>
            <span className="text-sm font-bold text-gray-900">{risk.risk_score} / 100</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">Low</span>
            <span className="text-[10px] text-gray-400">Medium</span>
            <span className="text-[10px] text-gray-400">High</span>
            <span className="text-[10px] text-gray-400">Critical</span>
          </div>
        </div>

        {/* Escalation banner */}
        {risk.escalation_required && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
            <Bell className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs font-semibold text-red-700">
              Escalation required — immediate attention needed
            </p>
          </div>
        )}

        {/* Risk factors */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Risk Factors
          </p>
          <div className="grid grid-cols-1 gap-2">
            <RiskFactor
              icon={School}
              label="Near a school"
              active={risk.near_school}
              color="text-indigo-500"
            />
            <RiskFactor
              icon={Droplets}
              label="Near water source"
              active={risk.near_water_source}
              color="text-blue-500"
            />
            <RiskFactor
              icon={Waves}
              label="Flood zone"
              active={risk.flood_zone}
              color="text-cyan-500"
            />
            <RiskFactor
              icon={Sun}
              label="Drought zone"
              active={risk.drought_zone}
              color="text-amber-500"
            />
            <RiskFactor
              icon={RefreshCw}
              label="Repeated incident (30 days)"
              active={risk.repeated_incident}
              color="text-orange-500"
            />
          </div>
        </div>

        {/* Affected people */}
        {risk.affected_children_count > 0 && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-orange-50 border border-orange-100">
            <Users className="w-4 h-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-orange-700">
                {risk.affected_children_count} people affected
              </p>
              <p className="text-[11px] text-orange-500">Counted at time of assessment</p>
            </div>
          </div>
        )}

        {/* Calculated at */}
        <p className="text-[11px] text-gray-400 text-right">
          Assessed {new Date(risk.calculated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
