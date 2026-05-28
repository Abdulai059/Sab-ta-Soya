import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useReportAssignmentHistory(reportId) {
  return useQuery({
    queryKey: ['report-assignment-history', reportId],
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
          worker:profiles!report_assignments_worker_id_fkey(
            id,
            full_name,
            role,
            avatar_url
          )
        `)
        .eq('report_id', reportId)
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!reportId
  });
}
