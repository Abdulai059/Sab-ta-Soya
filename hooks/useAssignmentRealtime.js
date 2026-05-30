"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function useAssignmentRealtime({ profileId, canViewAssigned, queryClient }) {
  const [connectionStatus, setConnectionStatus] = useState("connected");

  useEffect(() => {
    if (!profileId || !canViewAssigned) return;

    const channel = supabase
      .channel("my-assignments")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "sanitation_reports",
        filter: `assigned_to=eq.${profileId}`,
      }, () => {
        queryClient.invalidateQueries(["my-assignments", profileId]);
        queryClient.invalidateQueries(["assignment-history", profileId]);
      })
      .on("postgres_changes", {
        event: "*", schema: "public", table: "report_assignments",
        filter: `worker_id=eq.${profileId}`,
      }, () => {
        queryClient.invalidateQueries(["my-assignments", profileId]);
        queryClient.invalidateQueries(["assignment-history", profileId]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED")    setConnectionStatus("connected");
        else if (status === "CLOSED")   setConnectionStatus("disconnected");
        else if (status === "CHANNEL_ERROR") setConnectionStatus("error");
      });

    return () => channel.unsubscribe();
  }, [profileId, canViewAssigned, queryClient]);

  return { connectionStatus };
}
