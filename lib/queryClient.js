"use client";

import { QueryClient } from "@tanstack/react-query";

// Single shared QueryClient instance
// - staleTime: 0 → data is always considered stale, refetch on every mount/focus
// - gcTime: 5 min → keep unused cache for 5 minutes
// - refetchOnWindowFocus: true → refetch when user tabs back in (React Query default behaviour)
// - refetchOnReconnect: true → refetch when network comes back
// - retry: 2 → retry failed requests twice before showing error
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});
