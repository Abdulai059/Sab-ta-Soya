import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

/**
 * Hook to handle report assignment to sanitation workers
 * @returns {Object} Mutation object with mutate function
 */
export function useAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, workerId, assignedBy }) => {
      // Validate worker role
      const { data: worker, error: workerError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', workerId)
        .single();
      
      if (workerError) {
        throw new Error('Failed to validate worker');
      }
      
      if (worker.role !== 'sanitation_worker') {
        throw new Error('Selected user must have sanitation_worker role');
      }
      
      // Get current report state for history tracking
      const { data: currentReport, error: reportError } = await supabase
        .from('sanitation_reports')
        .select('assigned_to, status')
        .eq('id', reportId)
        .single();
      
      if (reportError) {
        throw new Error('Report not found');
      }
      
      // Call RPC function to handle atomic assignment
      const { error: updateError } = await supabase.rpc('assign_report', {
        p_report_id: reportId,
        p_worker_id: workerId,
        p_assigned_by: assignedBy,
        p_previous_assigned_to: currentReport?.assigned_to,
        p_previous_status: currentReport?.status
      });
      
      if (updateError) {
        throw new Error(updateError.message || 'Assignment failed');
      }
      
      return { reportId, workerId };
    },
    
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['my-assignments']);
      queryClient.invalidateQueries(['assignment-history']);
      toast.success('Report assigned successfully');
    },
    
    onError: (error) => {
      toast.error(error.message || 'Assignment failed');
    }
  });
}
