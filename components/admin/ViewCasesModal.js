"use client";

import { X, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SEVERITY_COLORS } from "./constants";
import { formatDate } from "./utils";
import { useDashboardView } from "@/context/DashboardViewContext";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchWorkerCases(workerId) {
  const [{ data: assigned }, { data: selfReported }] = await Promise.all([
    supabase
      .from("report_assignments")
      .select("resolved_at, report:sanitation_reports(id, issue_type, severity, status, created_at)")
      .eq("assigned_to", workerId),

    supabase
      .from("sanitation_reports")
      .select("id, issue_type, severity, status, created_at")
      .eq("reported_by", workerId)
      .in("status", ["resolved", "Resolved", "completed"]),
  ]);

  // Merge and dedupe by report id
  const seen = new Set();
  const result = [];

  (assigned || []).forEach((ra) => {
    const r = ra.report;
    if (!r || seen.has(r.id)) return;
    seen.add(r.id);
    result.push({ ...r, resolvedAt: ra.resolved_at });
  });

  (selfReported || []).forEach((r) => {
    if (seen.has(r.id)) return;
    seen.add(r.id);
    result.push({ ...r, resolvedAt: null });
  });

  return result;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CasesSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 p-3.5 space-y-2">
          <div className="flex justify-between">
            <div className="skeleton rounded w-40 h-4" />
            <div className="skeleton rounded-full w-16 h-5" />
          </div>
          <div className="skeleton rounded w-32 h-3" />
          <div className="skeleton rounded w-24 h-3" />
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function ViewCasesModal({ worker, onClose }) {
  const { setView } = useDashboardView();

  const { data: cases = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.workerCases(worker.id),
    queryFn: () => fetchWorkerCases(worker.id),
    enabled: !!worker.id,
  });

  const handleViewReport = (reportId) => {
    setView("reportDetail", { id: reportId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: worker.color + "22", color: worker.color }}
            >
              {worker.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{worker.name}</p>
              <p className="text-xs text-gray-400">
                {loading ? "Loading…" : `${cases.length} resolved cases`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
          {loading ? (
            <CasesSkeleton />
          ) : cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm font-medium text-gray-400">No cases found</p>
              <p className="text-xs text-gray-300">
                No resolved cases are linked to this worker
              </p>
            </div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-gray-100 p-3.5 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {c.issue_type?.replace(/_/g, " ") || "Unknown type"}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0"
                    style={{
                      background: (SEVERITY_COLORS[c.severity] || "#999") + "18",
                      color: SEVERITY_COLORS[c.severity] || "#999",
                    }}
                  >
                    {c.severity || "—"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400">
                    Reported {formatDate(c.created_at, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {c.resolvedAt && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-emerald-600 font-medium">
                        ✓ Resolved {formatDate(c.resolvedAt, { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleViewReport(c.id)}
                  className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  View full report
                </button>
              </div>
            ))
          )}
        </div>

        {!loading && cases.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-300 text-center">
              Showing all resolved cases for {worker.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
