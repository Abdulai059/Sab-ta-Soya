"use client";

import { useRouter } from "next/navigation";
import { MapPin, AlertTriangle, Clock, Check, X, Play, CheckCircle2 } from "lucide-react";
import { formatTimeAgo } from "@/utils/assignmentFormatters";

const SEVERITY_COLORS = {
  low:      "bg-blue-100 text-blue-700",
  medium:   "bg-yellow-100 text-yellow-700",
  high:     "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const STATUS_COLORS = {
  pending:     "bg-gray-100 text-gray-700",
  assigned:    "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  disposed:    "bg-green-100 text-green-700",
  verified:    "bg-emerald-100 text-emerald-700",
  cancelled:   "bg-red-100 text-red-700",
};

export default function AssignmentCard({
  report,
  type = "pending",
  decliningReportId,
  declineReason,
  setDeclineReason,
  setDecliningReportId,
  onAccept,
  onDecline,
  onStartWork,
  onCompleteWork,
  acceptPending,
  declinePending,
  startPending,
  completePending,
}) {
  const router = useRouter();
  const severityCls = SEVERITY_COLORS[report.severity?.toLowerCase()] || "bg-gray-100 text-gray-700";
  const statusCls   = STATUS_COLORS[report.status?.toLowerCase()]    || "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{report.reference_id}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${statusCls}`}>{report.status}</span>
      </div>

      <h3 className="font-medium text-gray-900 mb-3">{report.issue_type}</h3>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{report.location?.name || "Unknown location"}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityCls}`}>{report.severity}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{formatTimeAgo(report.created_at)}</span>
        </div>
      </div>

      {type === "pending" && (
        <div className="space-y-2">
          {decliningReportId === report.id ? (
            <div className="space-y-2">
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Reason for declining (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onDecline(report.id)}
                  disabled={declinePending}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {declinePending ? "Declining..." : "Confirm Decline"}
                </button>
                <button
                  onClick={() => { setDecliningReportId(null); setDeclineReason(""); }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(report.id)}
                disabled={acceptPending}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {acceptPending ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => setDecliningReportId(report.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}
        </div>
      )}

      {type === "assigned" && (
        <div className="flex gap-2">
          <button
            onClick={() => onStartWork(report.id)}
            disabled={startPending}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {startPending ? "Starting..." : "Start Work"}
          </button>
          <button
            onClick={() => router.push(`/reports/${report.id}`)}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
          >
            View
          </button>
        </div>
      )}

      {type === "in_progress" && (
        <div className="flex gap-2">
          <button
            onClick={() => onCompleteWork(report.id)}
            disabled={completePending}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            {completePending ? "Completing..." : "Mark Complete"}
          </button>
          <button
            onClick={() => router.push(`/reports/${report.id}`)}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}
