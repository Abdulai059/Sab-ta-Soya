"use client";

import { AlertTriangle, CheckCircle, Loader2, UserMinus, ShieldCheck } from "lucide-react";
import { ROLE_METADATA } from "@/lib/permissions";
import { WorkerInitials } from "./SeverityBadge";
import { OfferCountdown } from "./OfferCountdown";

export function WorkerSlot({ report, assignment, removing, onRemove, onExpire }) {
  const task = assignment?.service_tasks?.[0];
  const taskStatus = task?.status;
  const worker = assignment?.worker;

  // Derive the slot state
  const isOfferPending  = taskStatus === "pending" && !task?.isExpired;
  const isOfferExpired  = taskStatus === "pending" && task?.isExpired;
  const isActive        = taskStatus === "in_progress";
  const isCompleted     = taskStatus === "completed";
  const isCancelled     = taskStatus === "cancelled";

  // Expired — show inline notice, no worker chip
  if (isOfferExpired) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-red-700">Offer expired</p>
          <p className="text-[10px] text-red-500 mt-0.5">{worker?.full_name} did not respond</p>
        </div>
      </div>
    );
  }

  // Completed — verified badge + remove button
  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
        <WorkerInitials worker={worker || { full_name: "?" }} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-emerald-800 truncate">{worker?.full_name}</p>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-emerald-600 font-medium">✓ Completed</span>
            <span className="text-emerald-300">·</span>
            <span className="text-[10px] text-emerald-500 capitalize">
              {ROLE_METADATA[worker?.role]?.label || worker?.role}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(assignment.id, report.id, worker, taskStatus)}
          disabled={removing === assignment.id}
          className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Remove worker">
          {removing === assignment.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <UserMinus className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  // Active (accepted) — blue accepted badge + remove button
  if (isActive) {
    return (
      <div className="flex items-center gap-2 bg-brand-primary border border-blue-200 rounded-lg px-3 py-2.5">
        {/* <WorkerInitials worker={worker || { full_name: "?" }} size="sm" /> */}
        <div className="flex-1 flex gap-2 flex-row min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-rose-500 truncate">{worker?.full_name}</p>
            <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </div>
          <span className="text-[10px] text-green-600 font-medium">Accepted · In progress</span>
        </div>
        <button
          onClick={() => onRemove(assignment.id, report.id, worker, taskStatus)}
          disabled={removing === assignment.id}
          className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Remove worker">
          {removing === assignment.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <UserMinus className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  // Pending offer — countdown + remove button
  if (isOfferPending) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <WorkerInitials worker={worker || { full_name: "?" }} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{worker?.full_name}</p>
            <span className="text-[10px] text-gray-400 capitalize">
              {ROLE_METADATA[worker?.role]?.label || worker?.role}
            </span>
          </div>
          <button
            onClick={() => onRemove(assignment.id, report.id, worker, taskStatus)}
            disabled={removing === assignment.id}
            className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Cancel offer">
            {removing === assignment.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <UserMinus className="w-3.5 h-3.5" />}
          </button>
        </div>
        <OfferCountdown
          createdAt={task.created_at}
          onExpire={() => onExpire(assignment.id, task.id, report.id)}
        />
      </div>
    );
  }

  // Cancelled / no task — nothing to show
  return null;
}
