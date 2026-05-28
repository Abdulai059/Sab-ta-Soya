"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, AlertTriangle, Clock, Inbox, Wifi, WifiOff, Check, X, History as HistoryIcon, Play, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";
import { formatTimeAgo } from "@/utils/assignmentFormatters";
import { useAcceptAssignment } from "@/hooks/useAcceptAssignment";
import { useDeclineAssignment } from "@/hooks/useDeclineAssignment";
import { useStartWork } from "@/hooks/useStartWork";
import { useCompleteWork } from "@/hooks/useCompleteWork";
import { useDashboardView } from "@/context/DashboardViewContext";
import { useAssignmentHistory } from "@/hooks/useAssignmentHistory";
import { calculateAssignmentStats } from "@/utils/assignmentStats";
import HistoryFilters from "@/components/assignment/HistoryFilters";
import HistoryCard from "@/components/assignment/HistoryCard";

export default function MyAssignmentsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const canViewAssigned = useHasPermission(REPORTS.VIEW_ASSIGNED);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [decliningReportId, setDecliningReportId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySortOrder, setHistorySortOrder] = useState('newest');
  const { setView } = useDashboardView();
  
  const acceptMutation = useAcceptAssignment();
  const declineMutation = useDeclineAssignment();
  const startWorkMutation = useStartWork();
  const completeWorkMutation = useCompleteWork();
  
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['my-assignments', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sanitation_reports')
        .select(`
          id,
          reference_id,
          issue_type,
          severity,
          status,
          created_at,
          updated_at,
          location:locations(name, area_name, landmark),
          community:communities(name, district),
          assignment:report_assignments!report_assignments_report_id_fkey(
            status,
            assigned_at,
            accepted_at
          )
        `)
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: canViewAssigned && !!profile?.id
  });
  
  const { data: history = [], isLoading: historyLoading } = useAssignmentHistory(profile?.id);
  
  const pendingAssignments = assignments.filter(
    report => report.assignment?.[0]?.status === 'pending'
  );
  const assignedAssignments = assignments.filter(
    report => report.assignment?.[0]?.status === 'accepted' && report.status === 'assigned'
  );
  const inProgressAssignments = assignments.filter(
    report => report.assignment?.[0]?.status === 'accepted' && report.status === 'in_progress'
  );
  
  const stats = useMemo(() => calculateAssignmentStats(history), [history]);
  
  const filteredHistory = useMemo(() => {
    let filtered = history;
    
    if (historyFilter !== 'all') {
      filtered = history.filter(a => a.status === historyFilter);
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.completed_at || a.rejected_at || a.expired_at);
      const dateB = new Date(b.completed_at || b.rejected_at || b.expired_at);
      return historySortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [history, historyFilter, historySortOrder]);
  
  const handleAccept = (reportId) => {
    acceptMutation.mutate({
      reportId,
      workerId: profile.id
    });
  };
  
  const handleDecline = (reportId) => {
    declineMutation.mutate({
      reportId,
      workerId: profile.id,
      reason: declineReason
    }, {
      onSuccess: () => {
        setDecliningReportId(null);
        setDeclineReason('');
      }
    });
  };
  
  const handleStartWork = (reportId) => {
    startWorkMutation.mutate({
      reportId,
      workerId: profile.id
    });
  };
  
  const handleCompleteWork = (reportId) => {
    completeWorkMutation.mutate({
      reportId,
      workerId: profile.id
    });
  };
  
  useEffect(() => {
    if (!profile?.id || !canViewAssigned) return;
    
    const channel = supabase
      .channel('my-assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sanitation_reports',
        filter: `assigned_to=eq.${profile.id}`
      }, () => {
        queryClient.invalidateQueries(['my-assignments', profile.id]);
        queryClient.invalidateQueries(['assignment-history', profile.id]);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'report_assignments',
        filter: `worker_id=eq.${profile.id}`
      }, () => {
        queryClient.invalidateQueries(['my-assignments', profile.id]);
        queryClient.invalidateQueries(['assignment-history', profile.id]);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        }
      });
    
    return () => {
      channel.unsubscribe();
    };
  }, [profile?.id, canViewAssigned, queryClient]);
  
  if (!canViewAssigned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }
  
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[severity?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };
  
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      assigned: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      disposed: 'bg-green-100 text-green-700',
      verified: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };
  
  const renderAssignmentCard = (report, type = 'pending') => (
    <div
      key={report.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">
          {report.reference_id}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-3">
        {report.issue_type}
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {report.location?.name || 'Unknown location'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getSeverityColor(report.severity)}`}>
            {report.severity}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{formatTimeAgo(report.created_at)}</span>
        </div>
      </div>
      
      {type === 'pending' && (
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
                  onClick={() => handleDecline(report.id)}
                  disabled={declineMutation.isPending}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {declineMutation.isPending ? 'Declining...' : 'Confirm Decline'}
                </button>
                <button
                  onClick={() => {
                    setDecliningReportId(null);
                    setDeclineReason('');
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(report.id)}
                disabled={acceptMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
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
      
      {type === 'assigned' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleStartWork(report.id)}
            disabled={startWorkMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {startWorkMutation.isPending ? 'Starting...' : 'Start Work'}
          </button>
          <button
            onClick={() => setView("reportDetail", { id: report.id })}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
          >
            View
          </button>
        </div>
      )}
      
      {type === 'in_progress' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleCompleteWork(report.id)}
            disabled={completeWorkMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            {completeWorkMutation.isPending ? 'Completing...' : 'Mark Complete'}
          </button>
          <button
            onClick={() => setView("reportDetail", { id: report.id })}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
            <p className="text-sm text-gray-500 mt-1">
              Reports assigned to you
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500 leading-none">Pending</p>
              <p className="text-2xl font-semibold text-orange-600">
                {pendingAssignments.length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500 leading-none">Assigned</p>
              <p className="text-2xl font-semibold text-blue-600">
                {assignedAssignments.length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500 leading-none">Active</p>
              <p className="text-2xl font-semibold text-purple-600">
                {inProgressAssignments.length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500 leading-none">History</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        
        {connectionStatus !== 'connected' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-yellow-700" />
              <p className="text-sm text-yellow-700">
                {connectionStatus === 'disconnected' 
                  ? 'Connection lost. Attempting to reconnect...'
                  : 'Connection error. Updates may be delayed.'}
              </p>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {pendingAssignments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pending Assignments
                  </h2>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    Action Required
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingAssignments.map(report => renderAssignmentCard(report, 'pending'))}
                </div>
              </div>
            )}
            
            {assignedAssignments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assigned (Ready to Start)
                  </h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {assignedAssignments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedAssignments.map(report => renderAssignmentCard(report, 'assigned'))}
                </div>
              </div>
            )}
            
            {inProgressAssignments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    In Progress (Active Work)
                  </h2>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    {inProgressAssignments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressAssignments.map(report => renderAssignmentCard(report, 'in_progress'))}
                </div>
              </div>
            )}
            
            {assignments.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No assignments yet
                </h3>
                <p className="text-sm text-gray-500">
                  You'll see reports here when they're assigned to you
                </p>
              </div>
            )}
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Assignment History
            </h2>
            {stats.completionRate > 0 && (
              <span className="text-sm text-gray-500">
                ({stats.completionRate}% completion rate)
              </span>
            )}
          </div>
          
          {historyLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Loading history...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              <HistoryFilters
                activeFilter={historyFilter}
                onFilterChange={setHistoryFilter}
                sortOrder={historySortOrder}
                onSortChange={setHistorySortOrder}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map(assignment => (
                  <HistoryCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
              
              {filteredHistory.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No {historyFilter !== 'all' ? historyFilter : ''} assignments found
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No history yet
              </h3>
              <p className="text-sm text-gray-500">
                Completed and declined assignments will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
