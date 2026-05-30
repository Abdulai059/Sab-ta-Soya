import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Hook to fetch list of all sanitation workers
 * @returns {Object} { data: workers[], isLoading, error }
 */
export function useWorkerList() {
  return useQuery({
    queryKey: ['workers', 'sanitation_worker'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, email, phone, organization, avatar_url')
        .eq('role', 'sanitation_worker')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
