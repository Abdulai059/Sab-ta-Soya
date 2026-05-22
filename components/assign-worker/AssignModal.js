"use client";

import { useState } from "react";
import { UserCheck, Search, X, AlertTriangle, CheckCircle, Loader2, StickyNote } from "lucide-react";
import { ROLE_METADATA } from "@/lib/permissions";
import { WorkerInitials } from "./SeverityBadge";

export function AssignModal({ report, workers, onAssign, onClose, assigning }) {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const currentAssignment = (report.report_assignments || [])[0];
  const currentWorkerId = currentAssignment?.assigned_to;
  const isReassign = !!currentAssignment;

  const filtered = workers.filter(
    (w) => w.id !== currentWorkerId &&
           w.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {isReassign ? "Change Worker" : "Assign Worker"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
              {report.issue_type} — {report.location?.name || report.community?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isReassign && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Replacing current worker</p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                <span className="font-medium">{currentAssignment.worker?.full_name}</span>'s offer will be cancelled and a new one sent.
              </p>
            </div>
          </div>
        )}

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
              {search ? "No workers match your search" : "No other workers available"}
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
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => selectedWorker && onAssign(report.id, selectedWorker.id, notes)}
            disabled={!selectedWorker || assigning === report.id}
            className={`flex-1 px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center justify-center gap-2 ${
              isReassign ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
            }`}>
            {assigning === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            {isReassign ? "Change Worker" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
