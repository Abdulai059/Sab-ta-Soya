"use client";

import { UserPlus, RefreshCw, CheckCircle, Loader2, Clock, XCircle } from "lucide-react";
import { useReportAssignmentHistory } from "@/hooks/useReportAssignmentHistory";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";
import { formatTimeAgo } from "@/utils/assignmentFormatters";

/**
 * AssignmentHistory Component
 * Displays chronological audit trail of assignment activities
 * 
 * @param {Object} props
 * @param {string} props.reportId - UUID of the report
 */
export default function AssignmentHistory({ reportId }) {
  const canViewDetails = useHasPermission(REPORTS.VIEW_DETAILS);
  const { data: history = [], isLoading } = useReportAssignmentHistory(reportId);
  
  // Permission check
  if (!canViewDetails) {
    return null;
  }
  
  // Get icon and color for assignment status
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-orange-500', label: 'Pending' };
      case 'accepted':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Accepted' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-500', label: 'Rejected' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-emerald-500', label: 'Completed' };
      case 'expired':
        return { icon: Clock, color: 'text-gray-500', label: 'Expired' };
      default:
        return { icon: RefreshCw, color: 'text-gray-500', label: status };
    }
  };
  
  // Format assignment message
  const formatMessage = (assignment) => {
    const workerName = assignment.worker?.full_name || 'Unknown worker';
    const statusDisplay = getStatusDisplay(assignment.status);
    
    return `${workerName} - ${statusDisplay.label}`;
  };
  
  // Get timestamp for display
  const getTimestamp = (assignment) => {
    return assignment.completed_at || assignment.rejected_at || assignment.accepted_at || assignment.assigned_at;
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Assignment History
      </h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((assignment) => {
            const statusDisplay = getStatusDisplay(assignment.status);
            const Icon = statusDisplay.icon;
            
            return (
              <div key={assignment.id} className="flex gap-3">
                {/* Worker Avatar */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden">
                    {assignment.worker?.avatar_url ? (
                      <img
                        src={assignment.worker.avatar_url}
                        alt={assignment.worker.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {assignment.worker?.full_name?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${statusDisplay.color}`} />
                    <p className="text-sm text-gray-900">
                      {formatMessage(assignment)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(getTimestamp(assignment))}
                  </p>
                  {assignment.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Note: {assignment.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <RefreshCw className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            No history available
          </p>
        </div>
      )}
    </div>
  );
}
