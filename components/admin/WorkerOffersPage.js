"use client";

import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Timer,
  User,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useWorkerOffers } from "@/hooks/useWorkerOffers";
import { ROLE_METADATA } from "@/lib/permissions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCountdown(ms) {
  if (ms <= 0) return "Expired";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}m ${sec.toString().padStart(2, "0")}s`;
}

const SEVERITY_COLORS = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function Countdown({ createdAt, onExpire }) {
  const TIMEOUT_MS = 30 * 60 * 1000;
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, TIMEOUT_MS - elapsed);
  });

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const tick = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) { clearInterval(tick); onExpire?.(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [remaining, onExpire]);

  const pct = (remaining / TIMEOUT_MS) * 100;
  const isUrgent = remaining < 5 * 60 * 1000;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? "bg-red-400" : "bg-emerald-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-semibold tabular-nums ${isUrgent ? "text-red-500" : "text-gray-500"}`}>
        {formatCountdown(remaining)}
      </span>
    </div>
  );
}

// ─── Offer Card ───────────────────────────────────────────────────────────────

function OfferCard({ offer, onAccept, onReject, onExpire }) {
  const [expanded, setExpanded] = useState(false);
  const report = offer.report;
  const worker = offer.worker;
  const assigner = offer.assignment?.assigner;
  const workerMeta = ROLE_METADATA[worker?.role];
  const s = report?.severity?.toLowerCase();
  const isPending = offer.status === "pending";
  const isActive = offer.status === "in_progress";
  const isCompleted = offer.status === "completed";
  const isCancelled = offer.status === "cancelled";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
      isPending ? "border-yellow-200" : isActive ? "border-blue-200" : "border-gray-200"
    }`}>
      {/* Status bar */}
      <div className={`h-1 w-full ${
        isPending ? "bg-yellow-400" : isActive ? "bg-blue-400" : isCompleted ? "bg-emerald-400" : "bg-gray-300"
      }`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-emerald-600 font-semibold">
                {report?.reference_id}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${SEVERITY_COLORS[s] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                {report?.severity}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${STATUS_COLORS[offer.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                {offer.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-800 truncate capitalize">
              {report?.issue_type?.replace(/_/g, " ")}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500 truncate">
                {report?.location?.name || report?.community?.name}
                {report?.community?.district ? `, ${report.community.district}` : ""}
              </p>
            </div>
          </div>

          <button onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0 transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Worker info */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl px-3 py-3 mb-3 border border-gray-100">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
              {(worker?.full_name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{worker?.full_name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${workerMeta?.color || "bg-gray-100 text-gray-600"}`}>
                {workerMeta?.label || worker?.role}
              </span>
            </div>
          </div>
          
          {assigner && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
              <User className="w-3 h-3 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400">Assigned by</p>
                <p className="text-xs font-medium text-gray-600 truncate">{assigner.full_name}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_METADATA[assigner.role]?.color || "bg-gray-100 text-gray-600"}`}>
                {ROLE_METADATA[assigner.role]?.label || assigner.role}
              </span>
            </div>
          )}
        </div>

        {/* Countdown — only for pending */}
        {isPending && (
          <div className="mb-3 bg-yellow-50/50 rounded-lg px-3 py-2.5 border border-yellow-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Timer className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">Time to accept offer</span>
            </div>
            <Countdown
              createdAt={offer.created_at}
              onExpire={() => onExpire(offer.id, offer.assignment?.id)}
            />
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mb-3 pt-3 border-t border-gray-100 space-y-3">
            {/* Report description */}
            {report?.description && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Issue Description</p>
                <p className="text-xs text-gray-600 leading-relaxed">{report.description}</p>
              </div>
            )}
            
            {/* Assignment notes */}
            {offer.assignment?.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Assignment Notes</p>
                <p className="text-xs text-gray-600 leading-relaxed bg-blue-50/50 rounded-lg px-2.5 py-2 border border-blue-100">
                  {offer.assignment.notes}
                </p>
              </div>
            )}
            
            {/* Task notes */}
            {offer.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Task Notes</p>
                <p className="text-xs text-gray-600 leading-relaxed">{offer.notes}</p>
              </div>
            )}
            
            {/* Timeline */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-semibold">Timeline</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400">Offer sent</p>
                    <p className="text-xs text-gray-700 font-medium">
                      {new Date(offer.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                
                {offer.started_at && (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400">Accepted & started</p>
                      <p className="text-xs text-gray-700 font-medium">
                        {new Date(offer.started_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {offer.completed_at && (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400">Completed</p>
                      <p className="text-xs text-gray-700 font-medium">
                        {new Date(offer.completed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional report details */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              {report?.reporter_phone && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Reporter Phone</p>
                  <p className="text-xs text-gray-700 font-medium mt-0.5">{report.reporter_phone}</p>
                </div>
              )}
              {report?.affected_people_count && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">People Affected</p>
                  <p className="text-xs text-gray-700 font-medium mt-0.5">{report.affected_people_count}</p>
                </div>
              )}
              {report?.health_risk !== undefined && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Health Risk</p>
                  <p className={`text-xs font-medium mt-0.5 ${report.health_risk ? "text-red-600" : "text-gray-500"}`}>
                    {report.health_risk ? "Yes" : "No"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Task Type</p>
                <p className="text-xs text-gray-700 font-medium mt-0.5 capitalize">{offer.task_type?.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions — only for pending */}
        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onReject(offer.id, offer.assignment?.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => onAccept(offer.id, offer.assignment?.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
          </div>
        )}
        
        {/* Status message for completed/cancelled */}
        {(isCompleted || isCancelled) && (
          <div className={`text-center py-2 rounded-lg text-xs font-medium ${
            isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}>
            {isCompleted ? "✓ Task completed" : "✕ Offer cancelled"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OffersSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton rounded-lg w-44 h-7" />
          <div className="skeleton rounded-lg w-56 h-4" />
        </div>
        <div className="skeleton rounded-lg w-9 h-9" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="h-1 skeleton" />
            <div className="p-4 space-y-3">
              <div className="skeleton rounded w-24 h-3" />
              <div className="skeleton rounded w-40 h-4" />
              <div className="skeleton rounded-xl w-full h-12" />
              <div className="skeleton rounded-full w-full h-1.5" />
              <div className="flex gap-2">
                <div className="skeleton rounded-xl flex-1 h-9" />
                <div className="skeleton rounded-xl flex-1 h-9" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab ──────────────────────────────────────────────────────────────────────

function Tab({ label, count, active, urgent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
        active ? "text-emerald-700" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
          urgent ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
        }`}>
          {count}
        </span>
      )}
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = ["pending", "active", "closed"];

export default function WorkerOffersPage() {
  const {
    pendingOffers, expiredOffers, activeOffers, closedOffers,
    loading, acceptOffer, rejectOffer, expireOffer, refresh,
  } = useWorkerOffers();

  const [tab, setTab] = useState("pending");

  const tabOffers = {
    pending: pendingOffers,
    active: activeOffers,
    closed: [...expiredOffers, ...closedOffers],
  };

  const current = tabOffers[tab] || [];

  if (loading) return <OffersSkeleton />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-semibold text-gray-900">Worker Offers</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Track assignment offers and their 30-minute acceptance window
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: pendingOffers.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Expired", value: expiredOffers.length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
          { label: "In Progress", value: activeOffers.length, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Closed", value: closedOffers.length, icon: XCircle, color: "text-gray-500", bg: "bg-gray-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-800 leading-none">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          <Tab label="Pending" count={pendingOffers.length} urgent={pendingOffers.length > 0} active={tab === "pending"} onClick={() => setTab("pending")} />
          <Tab label="In Progress" count={activeOffers.length} active={tab === "active"} onClick={() => setTab("active")} />
          <Tab label="Closed" count={expiredOffers.length + closedOffers.length} active={tab === "closed"} onClick={() => setTab("closed")} />
        </div>
      </div>

      {/* Cards */}
      {current.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">
            {tab === "pending" ? "No pending offers" : tab === "active" ? "No active tasks" : "No closed offers yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {current.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onAccept={acceptOffer}
              onReject={rejectOffer}
              onExpire={expireOffer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
