"use client";

import { useEffect } from "react";
import { setupRealtimeInvalidation, teardownRealtimeInvalidation } from "@/lib/realtimeInvalidator";

/**
 * Boots Supabase real-time subscriptions once for the whole app.
 * Any table change → relevant React Query keys are invalidated → all
 * active useQuery hooks refetch automatically in the background.
 */
export function RealtimeProvider({ children }) {
  useEffect(() => {
    setupRealtimeInvalidation();
    return () => teardownRealtimeInvalidation();
  }, []);

  return children;
}
