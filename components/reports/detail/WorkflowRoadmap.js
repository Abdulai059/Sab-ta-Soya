"use client";

import {
  FileText,
  Bell,
  Wrench,
  Trash2,
  ShieldCheck,
  Clock,
  Check,
  XCircle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Full workflow: pending → assigned → in_progress → disposed → verified
 * pending is always the first stage — every report starts here.
 */
const STAGES = [
  {
    id:          "pending",
    label:       "Pending",
    icon:        FileText,
    description: "Report submitted, awaiting assignment",
  },
  {
    id:          "assigned",
    label:       "Assigned",
    icon:        Bell,
    description: "A worker has been assigned to this report",
  },
  {
    id:          "in_progress",
    label:       "In Progress",
    icon:        Wrench,
    description: "Worker is actively on site",
  },
  {
    id:          "disposed",
    label:       "Disposed",
    icon:        Trash2,
    description: "Issue has been physically resolved",
  },
  {
    id:          "verified",
    label:       "Verified",
    icon:        ShieldCheck,
    description: "Work confirmed and report closed",
  },
];

// Maps status → index in STAGES array
const STAGE_INDEX = {
  pending:     0,
  assigned:    1,
  in_progress: 2,
  disposed:    3,
  verified:    4,
};

const STATUS_BADGE = {
  pending:     { label: "Pending",     cls: "bg-gray-100 text-gray-500" },
  assigned:    { label: "Assigned",    cls: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  disposed:    { label: "Disposed",    cls: "bg-orange-100 text-orange-700" },
  verified:    { label: "Verified",    cls: "bg-emerald-100 text-emerald-700" },
  cancelled:   { label: "Cancelled",   cls: "bg-red-100 text-red-700" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return null;
  const diff  = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "just now";
}

/**
 * Builds { [status]: { ts, by } } from the status history array.
 * Keeps the most recent entry per status.
 */
function buildTimestampMap(statusHistory) {
  const map = {};
  (statusHistory ?? []).forEach((entry) => {
    const key = entry.new_status?.toLowerCase();
    if (!key) return;
    const existing = map[key];
    if (!existing || new Date(entry.changed_at) > new Date(existing.ts)) {
      map[key] = {
        ts: entry.changed_at,
        by: entry.changed_by_profile?.full_name ?? null,
      };
    }
  });
  return map;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageNode({ stage, isCompleted, isActive, isLast, timestamp }) {
  const Icon = stage.icon;

  const nodeStyle = isCompleted
    ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200"
    : isActive
    ? "bg-blue-500 border-blue-500 shadow-sm shadow-blue-200"
    : "bg-white border-gray-200";

  const cardStyle = isCompleted
    ? "bg-emerald-50/70 border-emerald-100"
    : isActive
    ? "bg-blue-50 border-blue-200"
    : "bg-white border-gray-100";

  const labelStyle = isCompleted || isActive ? "text-gray-900" : "text-gray-400";
  const connectorStyle = isCompleted ? "bg-emerald-400" : "bg-gray-100";

  return (
    <div className="flex gap-4">
      {/* Node + vertical connector */}
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${nodeStyle}`}>
          {isCompleted
            ? <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            : <Icon  className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-300"}`} />
          }
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 my-1.5 min-h-[36px]">
            <div className={`w-full h-full rounded-full transition-all duration-500 ${connectorStyle}`} />
          </div>
        )}
      </div>

      {/* Stage card */}
      <div className={`flex-1 ${!isLast ? "pb-4" : "pb-0"}`}>
        <div className={`px-4 py-3 rounded-xl border transition-all duration-300 ${cardStyle}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${labelStyle}`}>
                {stage.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                {stage.description}
              </p>
              {timestamp && (
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1 flex-wrap">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{timeAgo(timestamp.ts)}</span>
                  {timestamp.by && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="truncate">{timestamp.by}</span>
                    </>
                  )}
                </p>
              )}
            </div>

            {isActive && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-semibold">
                Current
              </span>
            )}
            {isCompleted && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                Done
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkerBadge({ worker }) {
  if (!worker) return null;

  const initials = (worker.full_name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{worker.full_name}</p>
        <p className="text-xs text-gray-400 capitalize">
          {worker.role?.replace(/_/g, " ") ?? "Worker"}
        </p>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium shrink-0">
        Assigned
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkflowRoadmap({ report, statusHistory }) {
  const rawStatus  = report?.status ?? "pending";
  const status     = rawStatus.toLowerCase();
  const stageIndex = STAGE_INDEX[status] ?? 0;   // default to pending (0)
  const isCancelled = status === "cancelled";
  const isVerified  = status === "verified";

  const progressPct = Math.round(((stageIndex + 1) / STAGES.length) * 100);
  const badge       = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  const tsMap       = buildTimestampMap(statusHistory);

  // ── Cancelled — show a clear terminal state ────────────────────────────────
  if (isCancelled) {
    return (
      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-red-50 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Workflow Progress</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track the sanitation work lifecycle</p>
          </div>
          <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="py-10 px-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-7 h-7 text-red-300" />
          </div>
          <p className="text-sm font-semibold text-gray-600">Report Cancelled</p>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            This report was closed without resolution. No further action is required.
          </p>
        </div>
      </div>
    );
  }

  // ── Normal workflow (pending → verified) ───────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Workflow Progress</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isVerified
                ? "All stages complete — report closed"
                : `Step ${stageIndex + 1} of ${STAGES.length} · ${progressPct}% complete`}
            </p>
          </div>
          <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isVerified ? "bg-emerald-500" : "bg-blue-500"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Assigned worker — only shown once a worker exists */}
      <WorkerBadge worker={report?.worker ?? null} />

      {/* Stage list */}
      <div className="p-5">
        {STAGES.map((stage, index) => (
          <StageNode
            key={stage.id}
            stage={stage}
            isCompleted={index < stageIndex}
            isActive={index === stageIndex}
            isLast={index === STAGES.length - 1}
            timestamp={tsMap[stage.id] ?? null}
          />
        ))}
      </div>

      {/* Verified completion banner */}
      {isVerified && (
        <div className="mx-5 mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Report closed</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              All stages completed successfully
              {tsMap.verified?.ts && ` · ${timeAgo(tsMap.verified.ts)}`}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
