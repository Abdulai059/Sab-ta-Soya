"use client";

import { useState, useMemo } from "react";
import {
  UserCheck,
  Search,
  X,
  ChevronDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Loader2,
  UserMinus,
  StickyNote,
  ImageOff,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useAssignWorker } from "@/hooks/useAssignWorker";
import { ROLE_METADATA } from "@/lib/permissions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_STYLES = {
  critical: "bg-red-500/90 text-white",
  high: "bg-orange-500/90 text-white",
  medium: "bg-yellow-500/90 text-white",
  low: "bg-blue-500/90 text-white",
};

// ─── Confirm Remove Modal ─────────────────────────────────────────────────────

function ConfirmRemoveModal({ worker, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Remove Worker?</h3>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 mb-4">
          <p className="text-xs text-gray-600">
            You are about to remove <span className="font-semibold text-gray-800">{worker?.full_name}</span> from this assignment. 
            Any pending offers will be cancelled.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



function SeverityBadge({ severity }) {
  const s = severity?.toLowerCase();
  return (
    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full backdrop-blur-sm ${SEVERITY_STYLES[s] || "bg-gray-500/80 text-white"}`}>
      {severity}
    </span>
  );
}

function WorkerInitials({ worker, size = "sm" }) {
  const initial = (worker.full_name || "?").charAt(0).toUpperCase();
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0`}>
      {initial}
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center" onClick={onClose}>
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/60 to-transparent">
        <div>
          {images[idx].caption && <p className="text-white text-sm font-medium">{images[idx].caption}</p>}
          <p className="text-white/40 text-xs mt-0.5">{idx + 1} / {images.length}</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="w-full max-w-4xl px-16 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img src={images[idx].image_url} alt={images[idx].caption || `Photo ${idx + 1}`}
          className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl" />
      </div>

      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.id} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition ${i === idx ? "border-white scale-110" : "border-white/20 opacity-60 hover:opacity-100"}`}>
              <img src={img.image_url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────

function AssignModal({ report, workers, onAssign, onClose, assigning }) {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const assignedIds = new Set((report.report_assignments || []).map((a) => a.assigned_to));
  const filtered = workers.filter(
    (w) => !assignedIds.has(w.id) && w.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">Assign Worker</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
              {report.issue_type} — {report.location?.name || report.community?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="text" placeholder="Search workers…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {search ? "No workers match your search" : "All available workers already assigned"}
            </p>
          ) : (
            filtered.map((w) => {
              const meta = ROLE_METADATA[w.role];
              const isSelected = selectedWorker?.id === w.id;
              return (
                <button key={w.id} onClick={() => setSelectedWorker(isSelected ? null : w)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    isSelected ? "border-emerald-300 bg-emerald-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}>
                  <WorkerInitials worker={w} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{w.full_name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${meta?.color || "bg-gray-100 text-gray-600"}`}>
                      {meta?.label || w.role}
                    </span>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100">
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <StickyNote className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <textarea rows={2} placeholder="Optional notes for the worker…" value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400 resize-none" />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => selectedWorker && onAssign(report.id, selectedWorker.id, notes)}
            disabled={!selectedWorker || assigning === report.id}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {assigning === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({ report, workers, onAssign, onUnassign, assigning, removing }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  const assignments = report.report_assignments || [];
  const hasAssignments = assignments.length > 0;
  const images = report.location?.location_images || [];
  const heroImage = images[0];
  const extraCount = images.length - 1;
  const s = report.severity?.toLowerCase();

  const handleRemove = (assignmentId, reportId, worker) => {
    setRemoveConfirm({ assignmentId, reportId, worker });
  };

  const confirmRemove = async () => {
    if (removeConfirm) {
      await onUnassign(removeConfirm.assignmentId, removeConfirm.reportId);
      setRemoveConfirm(null);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col border-gray-200}`}>

        {/* Hero image */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          {heroImage ? (
            <>
              <img src={heroImage.image_url} alt={heroImage.caption || "Location photo"}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              <button onClick={() => setLightboxIdx(0)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition backdrop-blur-sm">
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </button>

              {extraCount > 0 && (
                <button onClick={() => setLightboxIdx(1)}
                  className="absolute top-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-black/60 transition">
                  +{extraCount} photo{extraCount > 1 ? "s" : ""}
                </button>
              )}

              <div className="absolute bottom-0 inset-x-0 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                 <div></div>
                  <SeverityBadge severity={report.severity} />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
              <ImageOff className="w-8 h-8 text-gray-300" />
              <p className="text-xs text-gray-300">No photos</p>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-600 font-semibold tracking-wide">
              {report.reference_id}
            </span>
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
              hasAssignments ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"
            }`}>
              {hasAssignments
                ? <><CheckCircle className="w-3 h-3" /> Assigned</>
                : <><Clock className="w-3 h-3" /> Pending</>}
            </span>
          </div>

        <div className="min-w-0">
  <p className="text-xs font-semibold text-gray-700 truncate leading-tight capitalize">
    {report.issue_type?.replace(/_/g, " ")}
  </p>

  <div className="flex items-center gap-1 mt-1">
    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
    <p className="text-[11px] text-gray-500 truncate">
      {report.location?.name || report.community?.name}
      {report.community?.district ? `, ${report.community.district}` : ""}
    </p>
  </div>

  <p className="text-[11px] text-gray-400 mt-0.5">
    <span className="font-medium text-gray-500">Phone:</span> {report.reporter_phone}
  </p>
</div>
          {hasAssignments && (
            <div className="space-y-1.5">
              {assignments.map((a) => {
                const task = a.service_tasks?.[0];
                const taskStatus = task?.status;
                const isPending = taskStatus === "pending";
                const isActive = taskStatus === "in_progress";
                
                return (
                  <div key={a.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                    isPending ? "bg-yellow-50 border-yellow-200" : 
                    isActive ? "bg-blue-50 border-blue-200" : 
                    "bg-gray-50 border-gray-200"
                  }`}>
                    <WorkerInitials worker={a.worker || { full_name: "?" }} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{a.worker?.full_name || "Unknown"}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-400 capitalize">
                          {ROLE_METADATA[a.worker?.role]?.label || a.worker?.role}
                        </span>
                        {taskStatus && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className={`text-[10px] font-medium ${
                              isPending ? "text-yellow-600" : 
                              isActive ? "text-blue-600" : 
                              "text-gray-500"
                            }`}>
                              {taskStatus === "in_progress" ? "Active" : taskStatus}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(a.id, report.id, a.worker)}
                      disabled={removing === a.id}
                      className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      title="Remove worker">
                      {removing === a.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserMinus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-auto space-y-2">
            <button onClick={() => setModalOpen(true)} disabled={assigning === report.id}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-xs font-medium transition-colors disabled:opacity-50">
              {assigning === report.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <UserCheck className="w-3.5 h-3.5" />}
              {hasAssignments ? "Add another worker" : "Assign worker"}
            </button>
            
            {hasAssignments && (
              <p className="text-[10px] text-center text-gray-400">
                Click <UserMinus className="w-3 h-3 inline" /> to remove, then assign new worker
              </p>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <AssignModal report={report} workers={workers}
          onAssign={(...args) => { onAssign(...args); setModalOpen(false); }}
          onClose={() => setModalOpen(false)} assigning={assigning} />
      )}

      {lightboxIdx !== null && images.length > 0 && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      {removeConfirm && (
        <ConfirmRemoveModal
          worker={removeConfirm.worker}
          onConfirm={confirmRemove}
          onCancel={() => setRemoveConfirm(null)}
          loading={removing === removeConfirm.assignmentId}
        />
      )}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AssignPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton rounded-lg w-48 h-7" />
          <div className="skeleton rounded-lg w-64 h-4" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton rounded-full w-24 h-7" />
          <div className="skeleton rounded-full w-24 h-7" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="skeleton h-40 w-full" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton rounded w-20 h-3" />
                <div className="skeleton rounded-full w-16 h-5" />
              </div>
              <div className="skeleton rounded-lg w-full h-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function AssignWorkerPage() {
  const { reports, workers, loading, assigning, assignWorker, unassignWorker } = useAssignWorker();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [removing, setRemoving] = useState(null);

  const filtered = useMemo(() => {
    return reports
      .filter((r) => {
        const matchSearch =
          !search ||
          r.issue_type?.toLowerCase().includes(search.toLowerCase()) ||
          r.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
          r.location?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.community?.name?.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = severityFilter === "all" || r.severity?.toLowerCase() === severityFilter;
        const hasAssignment = (r.report_assignments || []).length > 0;
        const matchAssigned =
          assignedFilter === "all" ||
          (assignedFilter === "unassigned" && !hasAssignment) ||
          (assignedFilter === "assigned" && hasAssignment);
        return matchSearch && matchSeverity && matchAssigned;
      })
      .sort((a, b) =>
        (SEVERITY_ORDER[a.severity?.toLowerCase()] ?? 9) -
        (SEVERITY_ORDER[b.severity?.toLowerCase()] ?? 9)
      );
  }, [reports, search, severityFilter, assignedFilter]);

  const handleUnassign = async (assignmentId, reportId) => {
    setRemoving(assignmentId);
    await unassignWorker(assignmentId, reportId);
    setRemoving(null);
  };

  const unassignedCount = reports.filter((r) => (r.report_assignments || []).length === 0).length;

  if (loading) return <AssignPageSkeleton />;

  return (
    <div className="space-y-5 pt-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-semibold text-gray-900">Assign Workers</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {unassignedCount} unassigned · {reports.length} total open reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            {reports.filter((r) => r.severity?.toLowerCase() === "critical").length} critical
          </span>
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-600 font-medium border border-yellow-100">
            <Clock className="w-3.5 h-3.5" />
            {unassignedCount} pending
          </span>
        </div>
      </div>

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
          <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="all">All reports</option>
            <option value="unassigned">Unassigned only</option>
            <option value="assigned">Assigned only</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {reports.length} reports</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">No reports match your filters</p>
          <button onClick={() => { setSearch(""); setSeverityFilter("all"); setAssignedFilter("all"); }}
            className="text-xs text-emerald-600 hover:text-emerald-700">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} workers={workers}
              onAssign={assignWorker} onUnassign={handleUnassign} assigning={assigning} removing={removing} />
          ))}
        </div>
      )}
    </div>
  );
}
