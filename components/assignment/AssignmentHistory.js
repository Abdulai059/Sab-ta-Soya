"use client";

import { UserPlus, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { useAssignmentHistory } from "@/hooks/useAssignmentHistory";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";
import { formatHistoryMessage, formatTimeAgo } from "@/utils/assignmentFormatters";

/**
 * AssignmentHistory Component
 * Displays chronological audit trail of assignment activities
 * 
 * @param {Object} props
 * @param {string} props.reportId - UUID of the report
 */
export default function AssignmentHistory({ reportId }) {
  const canViewDetails = useHasPermission(REPORTS.VIEW_DETAILS);
  const { data: history = [], isLoading } = useAssignmentHistory(reportId);
  
  // Permission check
  if (!canViewDetails) {
    return null;
  }
  
  // Get icon for history record type
  const getIcon = (record) => {
    if (record.type === 'assignment') {
      return <UserPlus className="w-5 h-5 text-blue-500" />;
    }
    if (record.type === 'status_change') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <RefreshCw className="w-5 h-5 text-gray-500" />;
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
          {history.map((record) => (
            <div key={record.id} className="flex gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(record)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {formatHistoryMessage(record)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(record.timestamp)}
                </p>
                {record.notes && (
                  <p className="text-xs text-gray-600 mt-2 italic">
                    Note: {record.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
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
