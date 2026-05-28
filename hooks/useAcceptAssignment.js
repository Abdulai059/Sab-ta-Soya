import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

/**
 * Hook to handle accepting a report assignment
 * @returns {Object} Mutation object with mutate function
 */
export function useAcceptAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, workerId }) => {
      // Update assignment status to 'accepted'
      const { error: assignmentError } = await supabase
        .from('report_assignments')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('report_id', reportId)
        .eq('worker_id', workerId)
        .eq('status', 'pending');
      
      if (assignmentError) {
        throw new Error(assignmentError.message || 'Failed to accept assignment');
      }
      
      // Get current report status for history
      const { data: currentReport, error: reportError } = await supabase
        .from('sanitation_reports')
        .select('status')
        .eq('id', reportId)
        .single();
      
      if (reportError) {
        throw new Error('Report not found');
      }
      
      // Update report status to 'assigned' if it's still pending
      const newStatus = currentReport.status === 'pending' ? 'assigned' : currentReport.status;
      
      const { error: updateError } = await supabase
        .from('sanitation_reports')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (updateError) {
        throw new Error(updateError.message || 'Failed to update report status');
      }
      
      // Create status history record if status changed
      if (newStatus !== currentReport.status) {
        const { error: historyError } = await supabase
          .from('report_status_history')
          .insert({
            report_id: reportId,
            old_status: currentReport.status,
            new_status: newStatus,
            changed_by: workerId,
            notes: 'Assignment accepted by worker'
          });
        
        if (historyError) {
          console.error('Failed to create history record:', historyError);
        }
      }
      
      return { reportId, workerId };
    },
    
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['my-assignments']);
      queryClient.invalidateQueries(['assignment-history']);
      toast.success('Assignment accepted successfully');
    },
    
    onError: (error) => {
      toast.error(error.message || 'Failed to accept assignment');
    }
  });
}
