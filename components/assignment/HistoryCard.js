import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from "lucide-react";
import { formatTimeAgo } from "@/utils/assignmentFormatters";
import { calculateDuration } from "@/utils/assignmentStats";
import { useDashboardView } from "@/context/DashboardViewContext";

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-300',
    label: 'Completed'
  },
  rejected: {
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-300',
    label: 'Declined'
  },
  expired: {
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    label: 'Expired'
  }
};

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
};

export default function HistoryCard({ assignment }) {
  const { setView } = useDashboardView();
  const report = assignment.report;
  const config = STATUS_CONFIG[assignment.status];
  const Icon = config.icon;
  const duration = calculateDuration(assignment);

  const handleViewDetails = () => {
    if (assignment.status === 'completed') {
      setView("reportDetail", { id: report.id });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">
          {report.reference_id}
        </span>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      <h3 className="font-medium text-gray-900 mb-2">
        {report.issue_type}
      </h3>

      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {report.location?.name || 'Unknown location'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${SEVERITY_COLORS[report.severity?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
            {report.severity}
          </span>
          {duration && (
            <>
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{duration}</span>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Assigned: {formatTimeAgo(assignment.assigned_at)}</span>
        </div>
        
        {assignment.accepted_at && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle className="w-3 h-3" />
            <span>Accepted: {formatTimeAgo(assignment.accepted_at)}</span>
          </div>
        )}
        
        {assignment.completed_at && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Completed: {formatTimeAgo(assignment.completed_at)}</span>
          </div>
        )}
        
        {assignment.rejected_at && (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <XCircle className="w-3 h-3" />
            <span>Declined: {formatTimeAgo(assignment.rejected_at)}</span>
          </div>
        )}
      </div>

      {assignment.notes && assignment.status === 'rejected' && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <span className="font-medium">Reason: </span>
          {assignment.notes}
        </div>
      )}

      {assignment.status === 'completed' && (
        <button
          onClick={handleViewDetails}
          className="mt-3 w-full px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  );
}
