import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useVerifyWork() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, userId }) => {
      // Fetch current report to validate status
      const { data: currentReport, error: reportError } = await supabase
        .from('sanitation_reports')
        .select('status')
        .eq('id', reportId)
        .single();
      
      if (reportError) {
        throw new Error('Report not found');
      }
      
      // Validate current status is "disposed"
      if (currentReport.status !== 'disposed') {
        throw new Error('Report cannot be verified in current status');
      }
      
      // Update report status to "verified"
      const { error: updateError } = await supabase
        .from('sanitation_reports')
        .update({
          status: 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (updateError) {
        throw new Error(updateError.message || 'Failed to verify report');
      }
      
      // Create status history record
      const { error: historyError } = await supabase
        .from('report_status_history')
        .insert({
          report_id: reportId,
          old_status: currentReport.status,
          new_status: 'verified',
          changed_by: userId,
          notes: 'Work verified by supervisor/admin'
        });
      
      if (historyError) {
        console.error('Failed to create history record:', historyError);
      }
      
      return { reportId, userId };
    },
    
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries(['report', data.reportId]);
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['assignment-history']);
      toast.success('Work verified successfully');
    },
    
    onError: (error) => {
      toast.error(error.message || 'Failed to verify work');
    }
  });
}
