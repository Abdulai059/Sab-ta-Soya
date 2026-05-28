import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

/**
 * Hook to handle declining a report assignment
 * @returns {Object} Mutation object with mutate function
 */
export function useDeclineAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, workerId, reason }) => {
      // Update assignment status to 'rejected'
      const { error: assignmentError } = await supabase
        .from('report_assignments')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          notes: reason || 'Declined by worker'
        })
        .eq('report_id', reportId)
        .eq('worker_id', workerId)
        .eq('status', 'pending');
      
      if (assignmentError) {
        throw new Error(assignmentError.message || 'Failed to decline assignment');
      }
      
      // Get current report status for history
      const { data: currentReport, error: reportError } = await supabase
        .from('sanitation_reports')
        .select('status, assigned_to')
        .eq('id', reportId)
        .single();
      
      if (reportError) {
        throw new Error('Report not found');
      }
      
      // Revert report status back to 'pending' and clear assigned_to
      const { error: updateError } = await supabase
        .from('sanitation_reports')
        .update({
          status: 'pending',
          assigned_to: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (updateError) {
        throw new Error(updateError.message || 'Failed to update report status');
      }
      
      // Create status history record
      const { error: historyError } = await supabase
        .from('report_status_history')
        .insert({
          report_id: reportId,
          old_status: currentReport.status,
          new_status: 'pending',
          changed_by: workerId,
          notes: `Assignment declined: ${reason || 'No reason provided'}`
        });
      
      if (historyError) {
        console.error('Failed to create history record:', historyError);
      }
      
      return { reportId, workerId };
    },
    
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['my-assignments']);
      queryClient.invalidateQueries(['assignment-history']);
      toast.success('Assignment declined');
    },
    
    onError: (error) => {
      toast.error(error.message || 'Failed to decline assignment');
    }
  });
}
