"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS, REPORTS } from "@/lib/permissions";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";

const TIMEOUT_MS = 30 * 60 * 1000;

async function fetchOfferCount(userId) {
  const cutoff = new Date(Date.now() - TIMEOUT_MS).toISOString();
  const { count } = await supabase
    .from("service_tasks")
    .select("id", { count: "exact", head: true })
    .eq("assigned_to", userId)
    .eq("status", "pending")
    .gte("created_at", cutoff);

  return count || 0;
}

export function useMyOfferCount() {
  const { user, profile } = useAuth();

  const perms = ROLE_PERMISSIONS[profile?.role] || [];
  const isWorker =
    perms.includes(REPORTS.VIEW_ASSIGNED) && !perms.includes(REPORTS.ASSIGN);

  const { data: count = 0 } = useQuery({
    queryKey: QUERY_KEYS.myOfferCount(user?.id),
    queryFn: () => fetchOfferCount(user.id),
    enabled: !!user?.id && isWorker,
  });

  return count;
}
