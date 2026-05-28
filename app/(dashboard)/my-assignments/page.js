"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, AlertTriangle, Clock, Inbox, Wifi, WifiOff, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";
import { formatTimeAgo } from "@/utils/assignmentFormatters";
import { useAcceptAssignment } from "@/hooks/useAcceptAssignment";
import { useDeclineAssignment } from "@/hooks/useDeclineAssignment";
import { useDashboardView } from "@/context/DashboardViewContext";

/**
 * MyAssignments Page
 * Dedicated page for sanitation workers to view their assigned reports
 * Shows pending assignments (requiring accept/decline) and accepted assignments
 */
export default function MyAssignmentsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const canViewAssigned = useHasPermission(REPORTS.VIEW_ASSIGNED);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [decliningReportId, setDecliningReportId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const { setView } = useDashboardView();
  
  const acceptMutation = useAcceptAssignment();
  const declineMutation = useDeclineAssignment();
  
  // Fetch assignments with assignment status
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
  
  // Separate pending and accepted assignments
  const pendingAssignments = assignments.filter(
    report => report.assignment?.[0]?.status === 'pending'
  );
  const acceptedAssignments = assignments.filter(
    report => report.assignment?.[0]?.status === 'accepted'
  );
  
  // Handle accept assignment
  const handleAccept = (reportId) => {
    acceptMutation.mutate({
      reportId,
      workerId: profile.id
    });
  };
  
  // Handle decline assignment
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
  
  // Real-time subscription
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
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'report_assignments',
        filter: `worker_id=eq.${profile.id}`
      }, () => {
        queryClient.invalidateQueries(['my-assignments', profile.id]);
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
  
  // Permission check
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
  
  // Get severity badge color
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[severity?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };
  
  // Get status badge color
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
  
  // Render assignment card
  const renderAssignmentCard = (report, isPending = false) => (
    <div
      key={report.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">
          {report.reference_id}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
      </div>
      
      {/* Issue Type */}
      <h3 className="font-medium text-gray-900 mb-3">
        {report.issue_type}
      </h3>
      
      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {report.location?.name || 'Unknown location'}
          </span>
        </div>
        
        {/* Severity */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getSeverityColor(report.severity)}`}>
            {report.severity}
          </span>
        </div>
        
        {/* Time */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{formatTimeAgo(report.created_at)}</span>
        </div>
      </div>
      
      {/* Action Buttons for Pending Assignments */}
      {isPending && (
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
      
      {/* View Details Link for Accepted Assignments */}
      {!isPending && (
        <button
          onClick={() => setView("reportDetail", { id: report.id })}
          className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          View Details
        </button>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
            <p className="text-sm text-gray-500 mt-1">
              Reports assigned to you
            </p>
          </div>
          
          {/* Assignment Count */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500 leading-none">
                Pending
              </p>
              <p className="text-2xl font-semibold text-orange-600">
                {pendingAssignments.length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500 leading-none">
                Accepted
              </p>
              <p className="text-2xl font-semibold text-green-600">
                {acceptedAssignments.length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Connection Status */}
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
        
        {/* Loading State */}
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
        ) : assignments.length > 0 ? (
          <div className="space-y-8">
            {/* Pending Assignments Section */}
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
                  {pendingAssignments.map(report => renderAssignmentCard(report, true))}
                </div>
              </div>
            )}
            
            {/* Accepted Assignments Section */}
            {acceptedAssignments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Accepted Assignments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedAssignments.map(report => renderAssignmentCard(report, false))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
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
    </div>
  );
}
