"use client";

import { useState, useEffect } from "react";
import {
  Bell, CheckCircle, XCircle, Clock, Timer, MapPin,
  Phone, Users, AlertTriangle, ChevronDown, RefreshCw,
  Briefcase, ImageOff, ZoomIn, X, ChevronLeft, ChevronRight,
  Flag, CheckCheck,
} from "lucide-react";
import { useMyOffers } from "@/hooks/useMyOffers";
import { ROLE_METADATA } from "@/lib/permissions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OFFER_TIMEOUT_MS = 30 * 60 * 1000;

const SEVERITY_STYLES = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  low:      "bg-blue-100 text-blue-700 border-blue-200",
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ createdAt, onExpire }) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, OFFER_TIMEOUT_MS - elapsed);
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
  }, []);                                   // run once on mount

  const pct = (remaining / OFFER_TIMEOUT_MS) * 100;
  const isUrgent = remaining < 5 * 60 * 1000;
  const min = Math.floor(remaining / 60000);
  const sec = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Timer className={`w-3.5 h-3.5 ${isUrgent ? "text-red-500" : "text-yellow-600"}`} />
          <span className={`text-xs font-medium ${isUrgent ? "text-red-600" : "text-yellow-700"}`}>
            Time to respond
          </span>
        </div>
        <span className={`text-sm font-mono font-bold tabular-nums ${isUrgent ? "text-red-600" : "text-gray-700"}`}>
          {min}:{sec.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? "bg-red-400" : "bg-yellow-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  return (
    <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center" onClick={onClose}>
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/60 to-transparent">
        <p className="text-white/50 text-xs">{idx + 1} / {images.length}</p>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="w-full max-w-3xl px-12" onClick={(e) => e.stopPropagation()}>
        <img src={images[idx].image_url} alt={images[idx].caption || "Photo"}
          className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl" />
        {images[idx].caption && (
          <p className="text-white/70 text-sm text-center mt-3">{images[idx].caption}</p>
        )}
      </div>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Offer Card ───────────────────────────────────────────────────────────────

function OfferCard({ offer, onAccept, onReject, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const report   = offer.report;
  const assigner = offer.assignment?.assigner;
  const images   = report?.location?.location_images || [];
  const s        = report?.severity?.toLowerCase();

  const isPending   = offer.status === "pending" && !offer.isExpired;
  const isExpired   = offer.status === "pending" && offer.isExpired;
  const isActive    = offer.status === "in_progress";
  const isCompleted = offer.status === "completed";
  const isCancelled = offer.status === "cancelled";

  const borderColor = isPending ? "border-yellow-300"
    : isActive    ? "border-blue-300"
    : isCompleted ? "border-emerald-300"
    : "border-gray-200";

  const topBar = isPending ? "bg-yellow-400"
    : isActive    ? "bg-blue-400"
    : isCompleted ? "bg-emerald-400"
    : "bg-gray-300";

  return (
    <>
      <div className={`bg-white rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
        {/* colour bar */}
        <div className={`h-1.5 w-full ${topBar}`} />

        {/* hero image */}
        {images.length > 0 && (
          <div className="relative h-36 bg-gray-100 overflow-hidden">
            <img src={images[0].image_url} alt="Location"
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <button onClick={() => setLightboxIdx(0)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center">
              <ZoomIn className="w-3.5 h-3.5 text-white" />
            </button>
            {images.length > 1 && (
              <button onClick={() => setLightboxIdx(1)}
                className="absolute top-2 left-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">
                +{images.length - 1} photo{images.length > 2 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-emerald-600 font-semibold">
              {report?.reference_id}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${SEVERITY_STYLES[s] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
              {report?.severity}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ml-auto ${
              isPending   ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : isActive  ? "bg-blue-50 text-blue-700 border-blue-200"
              : isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
            }`}>
              {isPending ? "Pending" : isActive ? "In Progress" : isCompleted ? "Completed" : isExpired ? "Expired" : "Cancelled"}
            </span>
          </div>

          {/* issue type + location */}
          <div>
            <p className="text-sm font-semibold text-gray-800 capitalize leading-tight">
              {report?.issue_type?.replace(/_/g, " ")}
            </p>
            <div className="flex items-start gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-600 font-medium">
                  {report?.location?.name || report?.community?.name}
                </p>
                {(report?.location?.area_name || report?.community?.district) && (
                  <p className="text-[11px] text-gray-400">
                    {report?.location?.area_name || report?.community?.district}
                    {report?.community?.region ? `, ${report.community.region}` : ""}
                  </p>
                )}
                {report?.location?.landmark && (
                  <p className="text-[11px] text-gray-400 italic">Near: {report.location.landmark}</p>
                )}
              </div>
            </div>
          </div>

          {/* countdown — pending only */}
          {isPending && (
            <div className="bg-yellow-50 rounded-xl px-3 py-2.5 border border-yellow-100">
              <Countdown createdAt={offer.created_at} onExpire={() => {}} />
            </div>
          )}

          {/* expired notice */}
          {isExpired && (
            <div className="bg-red-50 rounded-xl px-3 py-2.5 border border-red-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-medium">Offer expired — no longer available</p>
            </div>
          )}

          {/* assigned by */}
          {assigner && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0">
                {(assigner.full_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400">Assigned by</p>
                <p className="text-xs font-semibold text-gray-700 truncate">{assigner.full_name}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_METADATA[assigner.role]?.color || "bg-gray-100 text-gray-600"}`}>
                {ROLE_METADATA[assigner.role]?.label || assigner.role}
              </span>
            </div>
          )}

          {/* expand toggle */}
          <button onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Less details" : "More details"}
          </button>

          {/* expanded section */}
          {expanded && (
            <div className="pt-2 border-t border-gray-100 space-y-3">
              {report?.description && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Description</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{report.description}</p>
                </div>
              )}

              {offer.assignment?.notes && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Notes from supervisor</p>
                  <p className="text-xs text-gray-600 bg-blue-50 rounded-lg px-2.5 py-2 border border-blue-100 leading-relaxed">
                    {offer.assignment.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {report?.reporter_phone && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Reporter</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-700">{report.reporter_phone}</p>
                    </div>
                  </div>
                )}
                {report?.affected_people_count && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Affected</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-700">{report.affected_people_count} people</p>
                    </div>
                  </div>
                )}
                {report?.health_risk !== undefined && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Health Risk</p>
                    <p className={`text-xs font-semibold mt-0.5 ${report.health_risk ? "text-red-600" : "text-gray-500"}`}>
                      {report.health_risk ? "⚠ Yes" : "No"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Offer sent</p>
                  <p className="text-xs text-gray-700 mt-0.5">{fmt(offer.created_at)}</p>
                </div>
                {offer.started_at && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Accepted</p>
                    <p className="text-xs text-gray-700 mt-0.5">{fmt(offer.started_at)}</p>
                  </div>
                )}
                {offer.completed_at && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Completed</p>
                    <p className="text-xs text-gray-700 mt-0.5">{fmt(offer.completed_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* action buttons */}
          {isPending && (
            <div className="flex gap-2 pt-1">
              <button onClick={() => onReject(offer.id, offer.assignment?.id, report?.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors">
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button onClick={() => onAccept(offer.id, report?.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm">
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
            </div>
          )}

          {isActive && (
            <button onClick={() => onComplete(offer.id, report?.id)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm">
              <CheckCheck className="w-4 h-4" />
              Mark as Completed
            </button>
          )}

          {(isCompleted || isCancelled || isExpired) && (
            <div className={`text-center py-2 rounded-lg text-xs font-medium ${
              isCompleted ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
            }`}>
              {isCompleted ? "✓ Task completed" : isExpired ? "⏰ Offer expired" : "✕ Offer rejected"}
            </div>
          )}
        </div>
      </div>

      {lightboxIdx !== null && images.length > 0 && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MyOffersSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton rounded-lg w-44 h-7" />
          <div className="skeleton rounded-lg w-60 h-4" />
        </div>
        <div className="skeleton rounded-lg w-9 h-9" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="skeleton rounded-lg w-9 h-9 mb-3" />
            <div className="skeleton rounded w-8 h-6 mb-1" />
            <div className="skeleton rounded w-16 h-3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="skeleton h-1.5 w-full" />
            <div className="skeleton h-36 w-full" />
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="skeleton rounded w-20 h-4" />
                <div className="skeleton rounded w-14 h-4" />
              </div>
              <div className="skeleton rounded w-3/4 h-5" />
              <div className="skeleton rounded-xl w-full h-12" />
              <div className="skeleton rounded-xl w-full h-2" />
              <div className="flex gap-2">
                <div className="skeleton rounded-xl flex-1 h-10" />
                <div className="skeleton rounded-xl flex-1 h-10" />
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
    <button onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
        active ? "text-emerald-700" : "text-gray-500 hover:text-gray-800"
      }`}>
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

export default function MyOffersPage() {
  const { pending, expired, active, closed, loading, acceptOffer, rejectOffer, completeTask, refresh } = useMyOffers();
  const [tab, setTab] = useState("pending");

  const tabOffers = {
    pending: [...pending, ...expired],
    active,
    closed,
  };
  const current = tabOffers[tab] || [];

  if (loading) return <MyOffersSkeleton />;

  const totalPending = pending.length + expired.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-semibold text-gray-900">My Work Offers</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and respond to your assigned tasks
          </p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm self-start">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending",     value: pending.length,  icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Expired",     value: expired.length,  icon: AlertTriangle,color: "text-red-500",    bg: "bg-red-50" },
          { label: "In Progress", value: active.length,   icon: Briefcase,    color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Completed",   value: closed.filter(o => o.status === "completed").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
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

      {/* Urgent banner */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">
              You have {pending.length} pending offer{pending.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Respond within 30 minutes or the offer will expire
            </p>
          </div>
          <Flag className="w-4 h-4 text-yellow-500 shrink-0" />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          <Tab label="Pending" count={totalPending} urgent={pending.length > 0} active={tab === "pending"} onClick={() => setTab("pending")} />
          <Tab label="In Progress" count={active.length} active={tab === "active"} onClick={() => setTab("active")} />
          <Tab label="History" count={closed.length} active={tab === "closed"} onClick={() => setTab("closed")} />
        </div>
      </div>

      {/* Cards */}
      {current.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
            {tab === "pending" ? <Bell className="w-6 h-6 text-gray-300" />
              : tab === "active" ? <Briefcase className="w-6 h-6 text-gray-300" />
              : <CheckCircle className="w-6 h-6 text-gray-300" />}
          </div>
          <p className="text-sm font-medium text-gray-400">
            {tab === "pending" ? "No pending offers right now"
              : tab === "active" ? "No active tasks"
              : "No completed tasks yet"}
          </p>
          <p className="text-xs text-gray-300">
            {tab === "pending" ? "New offers will appear here when assigned" : ""}
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
              onComplete={completeTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
