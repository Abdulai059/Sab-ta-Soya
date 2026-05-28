import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useCompleteWork() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, workerId }) => {
      const { data: currentReport, error: reportError } = await supabase
        .from('sanitation_reports')
        .select('status')
        .eq('id', reportId)
        .single();
      
      if (reportError) {
        throw new Error('Report not found');
      }
      
      const { error: reportUpdateError } = await supabase
        .from('sanitation_reports')
        .update({
          status: 'disposed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (reportUpdateError) {
        throw new Error(reportUpdateError.message || 'Failed to update report');
      }
      
      const { error: assignmentError } = await supabase
        .from('report_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('report_id', reportId)
        .eq('worker_id', workerId);
      
      if (assignmentError) {
        throw new Error(assignmentError.message || 'Failed to update assignment');
      }
      
      const { error: historyError } = await supabase
        .from('report_status_history')
        .insert({
          report_id: reportId,
          old_status: currentReport.status,
          new_status: 'disposed',
          changed_by: workerId,
          notes: 'Work completed by worker'
        });
      
      if (historyError) {
        console.error('Failed to create history record:', historyError);
      }
      
      return { reportId, workerId };
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['my-assignments']);
      queryClient.invalidateQueries(['assignment-history']);
      toast.success('Work completed successfully');
    },
    
    onError: (error) => {
      toast.error(error.message || 'Failed to complete work');
    }
  });
}
