"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useHasPermission } from "@/hooks/usePermissions";
import { USERS } from "@/lib/permissions";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import toast from "react-hot-toast";

async function fetchUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at, organization, phone")
    .order("created_at", { ascending: false });

  if (error) {
    toast.error("Error fetching users");
    throw error;
  }

  return data || [];
}

export function useUserManagement() {
  const qc = useQueryClient();
  const canViewUsers   = useHasPermission(USERS.VIEW_ALL);
  const canChangeRoles = useHasPermission(USERS.CHANGE_ROLES);

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.profiles,
    queryFn: fetchUsers,
    enabled: canViewUsers,
  });

  const { mutate: handleRoleChange } = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      if (!canChangeRoles) throw new Error("You don't have permission to change roles");

      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      return { userId, newRole };
    },

    // Optimistic update — role flips instantly in the table
    onMutate: async ({ userId, newRole }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.profiles });
      const snapshot = qc.getQueryData(QUERY_KEYS.profiles);
      qc.setQueryData(QUERY_KEYS.profiles, (old = []) =>
        old.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      return { snapshot };
    },

    onSuccess: () => toast.success("Role updated"),

    onError: (err, _vars, ctx) => {
      toast.error(err.message || "Error updating role");
      if (ctx?.snapshot) qc.setQueryData(QUERY_KEYS.profiles, ctx.snapshot);
    },
  });

  return {
    users,
    loading,
    canViewUsers,
    canChangeRoles,
    handleRoleChange: (userId, newRole) => handleRoleChange({ userId, newRole }),
  };
}
