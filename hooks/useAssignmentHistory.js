import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAssignmentHistory(workerId) {
  return useQuery({
    queryKey: ['assignment-history', workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_assignments')
        .select(`
          id,
          status,
          assigned_at,
          accepted_at,
          rejected_at,
          completed_at,
          expired_at,
          notes,
          report:sanitation_reports(
            id,
            reference_id,
            issue_type,
            severity,
            status,
            location:locations(name, area_name, landmark),
            community:communities(name, district)
          )
        `)
        .eq('worker_id', workerId)
        .in('status', ['rejected', 'completed', 'expired']);
      
      if (error) throw error;
      
      // Sort in JavaScript using all timestamp fields
      const sorted = (data || []).sort((a, b) => {
        const dateA = new Date(a.completed_at || a.rejected_at || a.expired_at);
        const dateB = new Date(b.completed_at || b.rejected_at || b.expired_at);
        return dateB - dateA; // newest first
      });
      
      return sorted;
    },
    enabled: !!workerId
  });
}
