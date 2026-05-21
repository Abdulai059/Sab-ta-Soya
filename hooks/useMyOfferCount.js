"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS, REPORTS } from "@/lib/permissions";

/**
 * Returns the count of pending (non-expired) offers for the current user.
 * Only runs for worker roles — returns 0 for admins/supervisors.
 */
export function useMyOfferCount() {
  const { user, profile } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id || !profile?.role) return;

    // Only fetch for roles that have VIEW_ASSIGNED but NOT ASSIGN
    const perms = ROLE_PERMISSIONS[profile.role] || [];
    const isWorker =
      perms.includes(REPORTS.VIEW_ASSIGNED) && !perms.includes(REPORTS.ASSIGN);
    if (!isWorker) return;

    const TIMEOUT_MS = 30 * 60 * 1000;

    const fetchCount = async () => {
      const cutoff = new Date(Date.now() - TIMEOUT_MS).toISOString();
      const { count: c } = await supabase
        .from("service_tasks")
        .select("id", { count: "exact", head: true })
        .eq("assigned_to", user.id)
        .eq("status", "pending")
        .gte("created_at", cutoff);

      setCount(c || 0);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [user?.id, profile?.role]);

  return count;
}
