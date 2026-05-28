import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Hook to fetch assignment history for a report
 * Combines data from report_assignments and report_status_history tables
 * @param {string} reportId - UUID of the report
 * @returns {Object} { data: history[], isLoading, error }
 */
export function useAssignmentHistory(reportId) {
  return useQuery({
    queryKey: ['assignment-history', reportId],
    queryFn: async () => {
      // Fetch assignment records
      const { data: assignments, error: assignError } = await supabase
        .from('report_assignments')
        .select(`
          id,
          assigned_at,
          status,
          notes,
          worker:profiles!worker_id(id, full_name),
          assigner:profiles!assigned_by(id, full_name)
        `)
        .eq('report_id', reportId)
        .order('assigned_at', { ascending: false });
      
      // Fetch status history records
      const { data: statusHistory, error: statusError } = await supabase
        .from('report_status_history')
        .select(`
          id,
          old_status,
          new_status,
          changed_at,
          notes,
          changer:profiles!changed_by(id, full_name)
        `)
        .eq('report_id', reportId)
        .order('changed_at', { ascending: false });
      
      if (assignError) throw assignError;
      if (statusError) throw statusError;
      
      // Combine both result sets and sort by timestamp
      const combined = [
        ...(assignments || []).map(a => ({
          id: a.id,
          type: 'assignment',
          timestamp: a.assigned_at,
          worker: a.worker,
          assigner: a.assigner,
          status: a.status,
          notes: a.notes
        })),
        ...(statusHistory || []).map(s => ({
          id: s.id,
          type: 'status_change',
          timestamp: s.changed_at,
          old_status: s.old_status,
          new_status: s.new_status,
          changer: s.changer,
          notes: s.notes
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return combined;
    },
    enabled: !!reportId
  });
}
