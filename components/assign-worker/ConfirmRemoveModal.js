"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

export function ConfirmRemoveModal({ worker, taskStatus, onConfirm, onCancel, loading }) {
  const title =
    taskStatus === "in_progress" ? "Remove Active Worker?"
    : taskStatus === "completed"  ? "Reopen Completed Task?"
    : "Remove Worker?";

  const subtitle =
    taskStatus === "in_progress" ? "This will cancel their active task"
    : taskStatus === "completed"  ? "This will reopen the report for reassignment"
    : "This will cancel the pending offer";

  const body =
    taskStatus === "in_progress"
      ? " who is currently working on this task? The task will be cancelled."
      : taskStatus === "completed"
      ? " from this completed task? The report will be reopened for reassignment."
      : " and cancel their offer?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg px-3 py-2.5 mb-4">
          <p className="text-xs text-gray-600">
            Remove{" "}
            <span className="font-semibold text-gray-800">{worker?.full_name}</span>
            {body}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Removing…</>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
