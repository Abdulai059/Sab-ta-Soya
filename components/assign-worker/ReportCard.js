"use client";

import { useState } from "react";
import {
  Clock, CheckCircle, Loader2, ImageOff, ZoomIn, MapPin,
  ShieldCheck, RotateCcw, UserCheck, AlertTriangle
} from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { WorkerSlot } from "./WorkerSlot";
import { AssignModal } from "./AssignModal";
import { Lightbox } from "./Lightbox";
import { ConfirmRemoveModal } from "./ConfirmRemoveModal";

export function ReportCard({ report, workers, onAssign, onUnassign, onExpire, assigning, removing }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  const assignment = (report.report_assignments || [])[0];
  const task = assignment?.service_tasks?.[0];
  const taskStatus = task?.status;

  const isCompleted   = taskStatus === "completed" || ["resolved", "completed", "Resolved"].includes(report.status);
  const isActive      = taskStatus === "in_progress";
  const isOfferPending = taskStatus === "pending" && !task?.isExpired;
  const isExpired     = taskStatus === "pending" && task?.isExpired;
  const hasWorker     = !!assignment && !isExpired;

  const images = report.location?.location_images || [];
  const heroImage = images[0];
  const extraCount = images.length - 1;

  // Card border colour by state
  const borderClass = isCompleted ? "border-emerald-200"
    : isActive      ? "border-blue-200"
    : isOfferPending ? "border-yellow-200"
    : "border-gray-200";

  // Status badge
  const statusBadge = isCompleted
    ? { label: "Completed", cls: "bg-emerald-50 text-emerald-700" }
    : isActive
    ? { label: "In Progress", cls: "bg-blue-50 text-blue-700" }
    : isOfferPending
    ? { label: "Offer Sent", cls: "bg-yellow-50 text-yellow-700" }
    : isExpired
    ? { label: "Expired", cls: "bg-red-50 text-red-600" }
    : { label: "Pending", cls: "bg-gray-100 text-gray-500" };

  return (
    <>
      <div className={`bg-white rounded-2xl border ${borderClass} shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col`}>

        {/* Top colour bar */}
        <div className={`h-1 w-full ${
          isCompleted ? "bg-emerald-400" : isActive ? "bg-blue-400" : isOfferPending ? "bg-yellow-400" : "bg-gray-200"
        }`} />

        {/* Hero image */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          {heroImage ? (
            <>
              <img src={heroImage.image_url} alt={heroImage.caption || "Location photo"}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <button onClick={() => setLightboxIdx(0)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </button>
              {extraCount > 0 && (
                <button onClick={() => setLightboxIdx(1)}
                  className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-black/60">
                  +{extraCount} photo{extraCount > 1 ? "s" : ""}
                </button>
              )}
              {/* Verified badge overlay for completed */}
              {isCompleted && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>
              )}
              <div className="absolute bottom-0 right-0 px-3 py-2.5">
                <SeverityBadge severity={report.severity} />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
              <ImageOff className="w-8 h-8 text-gray-300" />
              <p className="text-xs text-gray-300">No photos</p>
              {isCompleted && (
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col gap-3 flex-1">

          {/* Ref + status */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-emerald-600 font-semibold tracking-wide truncate">
              {report.reference_id}
            </span>
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${statusBadge.cls}`}>
              {isCompleted && <ShieldCheck className="w-3 h-3" />}
              {isActive && <CheckCircle className="w-3 h-3" />}
              {isOfferPending && <Clock className="w-3 h-3" />}
              {!isCompleted && !isActive && !isOfferPending && <Clock className="w-3 h-3" />}
              {statusBadge.label}
            </span>
          </div>

          {/* Issue + location */}
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
            {report.reporter_phone && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                <span className="font-medium text-gray-500">Phone:</span> {report.reporter_phone}
              </p>
            )}
          </div>

          {/* Worker slot */}
          {assignment && (
            <WorkerSlot
              report={report}
              assignment={assignment}
              removing={removing}
              onRemove={(aId, rId, w, ts) => setRemoveConfirm({ assignmentId: aId, reportId: rId, worker: w, taskStatus: ts })}
              onExpire={onExpire}
            />
          )}

          {/* Expired notice when no assignment left */}
          {!assignment && isExpired && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-600 font-medium">Offer expired — reassign below</p>
            </div>
          )}

          {/* Action button — always available for admin */}
          <div className="mt-auto">
            {isCompleted ? (
              <div className="space-y-2">
                <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Task Completed & Resolved
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  disabled={assigning === report.id}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 text-xs font-medium transition-colors disabled:opacity-50">
                  {assigning === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Reassign worker
                </button>
              </div>
            ) : isActive ? (
              <div className="flex flex-col sm:flex-row gap-2">
  <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-soft-highlight border border-blue-200 text-gray-900 text-xs font-medium">
    <CheckCircle className="w-3.5 h-3.5" />
    Worker is on the job
  </div>

  <button
    onClick={() => setModalOpen(true)}
    disabled={assigning === report.id}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 text-xs font-medium transition-colors disabled:opacity-50"
  >
    {assigning === report.id ? (
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
    ) : (
      <RotateCcw className="w-3.5 h-3.5" />
    )}

    Change worker
  </button>
</div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                disabled={assigning === report.id}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-xs font-medium transition-colors disabled:opacity-50">
                {assigning === report.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : isOfferPending
                  ? <RotateCcw className="w-3.5 h-3.5" />
                  : <UserCheck className="w-3.5 h-3.5" />}
                {hasWorker && isOfferPending ? "Change worker" : "Assign worker"}
              </button>
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
          taskStatus={removeConfirm.taskStatus}
          onConfirm={async () => {
            await onUnassign(removeConfirm.assignmentId, removeConfirm.reportId);
            setRemoveConfirm(null);
          }}
          onCancel={() => setRemoveConfirm(null)}
          loading={removing === removeConfirm.assignmentId}
        />
      )}
    </>
  );
}
