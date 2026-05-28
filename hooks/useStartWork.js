import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useStartWork() {
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
      
      const { error: updateError } = await supabase
        .from('sanitation_reports')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (updateError) {
        throw new Error(updateError.message || 'Failed to start work');
      }
      
      const { error: historyError } = await supabase
        .from('report_status_history')
        .insert({
          report_id: reportId,
          old_status: currentReport.status,
          new_status: 'in_progress',
          changed_by: workerId,
          notes: 'Worker started work'
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
      toast.success('Work started successfully');
    },
    
    onError: (error) => {
      toast.error(error.message || 'Failed to start work');
    }
  });
}
