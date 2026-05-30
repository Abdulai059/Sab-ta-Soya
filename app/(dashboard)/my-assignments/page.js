"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, WifiOff, History as HistoryIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";
import { useAcceptAssignment } from "@/hooks/useAcceptAssignment";
import { useDeclineAssignment } from "@/hooks/useDeclineAssignment";
import { useStartWork } from "@/hooks/useStartWork";
import { useCompleteWork } from "@/hooks/useCompleteWork";
import { useAssignmentHistory } from "@/hooks/useAssignmentHistory";
import { calculateAssignmentStats } from "@/utils/assignmentStats";
import useAssignmentRealtime from "@/hooks/useAssignmentRealtime";
import AssignmentCard from "@/components/assignment/AssignmentCard";
import AssignmentStatsBar from "@/components/assignment/AssignmentStatsBar";
import HistoryFilters from "@/components/assignment/HistoryFilters";
import HistoryCard from "@/components/assignment/HistoryCard";

export default function MyAssignmentsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const canViewAssigned = useHasPermission(REPORTS.VIEW_ASSIGNED);

  const [decliningReportId, setDecliningReportId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historySortOrder, setHistorySortOrder] = useState("newest");

  const acceptMutation  = useAcceptAssignment();
  const declineMutation = useDeclineAssignment();
  const startWorkMutation    = useStartWork();
  const completeWorkMutation = useCompleteWork();

  const { connectionStatus } = useAssignmentRealtime({
    profileId: profile?.id,
    canViewAssigned,
    queryClient,
  });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["my-assignments", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sanitation_reports")
        .select(`
          id, reference_id, issue_type, severity, status, created_at, updated_at,
          location:locations(name, area_name, landmark),
          community:communities(name, district),
          assignment:report_assignments!report_assignments_report_id_fkey(status, assigned_at, accepted_at)
        `)
        .eq("assigned_to", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: canViewAssigned && !!profile?.id,
  });

  const { data: history = [], isLoading: historyLoading } = useAssignmentHistory(profile?.id);

  const pendingAssignments    = assignments.filter((r) => r.assignment?.[0]?.status === "pending");
  const assignedAssignments   = assignments.filter((r) => r.assignment?.[0]?.status === "accepted" && r.status === "assigned");
  const inProgressAssignments = assignments.filter((r) => r.assignment?.[0]?.status === "accepted" && r.status === "in_progress");

  const stats = useMemo(() => calculateAssignmentStats(history), [history]);

  const filteredHistory = useMemo(() => {
    const filtered = historyFilter !== "all" ? history.filter((a) => a.status === historyFilter) : history;
    return filtered.sort((a, b) => {
      const dateA = new Date(a.completed_at || a.rejected_at || a.expired_at);
      const dateB = new Date(b.completed_at || b.rejected_at || b.expired_at);
      return historySortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [history, historyFilter, historySortOrder]);

  const handleAccept      = (id) => acceptMutation.mutate({ reportId: id, workerId: profile.id });
  const handleDecline     = (id) => declineMutation.mutate({ reportId: id, workerId: profile.id, reason: declineReason }, { onSuccess: () => { setDecliningReportId(null); setDeclineReason(""); } });
  const handleStartWork   = (id) => startWorkMutation.mutate({ reportId: id, workerId: profile.id });
  const handleCompleteWork = (id) => completeWorkMutation.mutate({ reportId: id, workerId: profile.id });

  const cardProps = {
    decliningReportId, declineReason, setDeclineReason, setDecliningReportId,
    onAccept: handleAccept, onDecline: handleDecline,
    onStartWork: handleStartWork, onCompleteWork: handleCompleteWork,
    acceptPending:   acceptMutation.isPending,
    declinePending:  declineMutation.isPending,
    startPending:    startWorkMutation.isPending,
    completePending: completeWorkMutation.isPending,
  };

  if (!canViewAssigned) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const AssignmentSection = ({ title, badge, badgeColor, items, type }) =>
    items.length > 0 ? (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className={`px-2 py-1 text-xs font-medium rounded ${badgeColor}`}>{badge}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((report) => (
            <AssignmentCard key={report.id} report={report} type={type} {...cardProps} />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-6 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
            <p className="text-sm text-gray-500 mt-1">Reports assigned to you</p>
          </div>
          <AssignmentStatsBar
            pending={pendingAssignments.length}
            assigned={assignedAssignments.length}
            active={inProgressAssignments.length}
            total={stats.total}
          />
        </div>

        {connectionStatus !== "connected" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-yellow-700" />
              <p className="text-sm text-yellow-700">
                {connectionStatus === "disconnected"
                  ? "Connection lost. Attempting to reconnect..."
                  : "Connection error. Updates may be delayed."}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <AssignmentSection title="Pending Assignments" badge="Action Required" badgeColor="bg-orange-100 text-orange-700" items={pendingAssignments} type="pending" />
            <AssignmentSection title="Assigned (Ready to Start)" badge={String(assignedAssignments.length)} badgeColor="bg-blue-100 text-blue-700" items={assignedAssignments} type="assigned" />
            <AssignmentSection title="In Progress (Active Work)" badge={String(inProgressAssignments.length)} badgeColor="bg-purple-100 text-purple-700" items={inProgressAssignments} type="in_progress" />

            {assignments.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-sm text-gray-500">You'll see reports here when they're assigned to you</p>
              </div>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Assignment History</h2>
            {stats.completionRate > 0 && (
              <span className="text-sm text-gray-500">({stats.completionRate}% completion rate)</span>
            )}
          </div>

          {historyLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full mx-auto" />
              <p className="text-sm text-gray-500 mt-4">Loading history...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              <HistoryFilters activeFilter={historyFilter} onFilterChange={setHistoryFilter} sortOrder={historySortOrder} onSortChange={setHistorySortOrder} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map((assignment) => (
                  <HistoryCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
              {filteredHistory.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500">No {historyFilter !== "all" ? historyFilter : ""} assignments found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
              <p className="text-sm text-gray-500">Completed and declined assignments will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
