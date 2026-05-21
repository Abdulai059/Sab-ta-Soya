"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { USERS } from "@/lib/permissions";

export function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const canViewUsers = useHasPermission(USERS.VIEW_ALL);
  const canChangeRoles = useHasPermission(USERS.CHANGE_ROLES);

  useEffect(() => {
    if (canViewUsers) fetchUsers();
  }, [canViewUsers]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at, organization, phone")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error("Error fetching users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    if (!canChangeRoles) {
      toast.error("You don't have permission to change roles");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Role updated");
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)),
      );
    } catch (error) {
      toast.error("Error updating role");
      console.error(error);
    }
  }

  return { users, loading, canViewUsers, canChangeRoles, handleRoleChange };
}
