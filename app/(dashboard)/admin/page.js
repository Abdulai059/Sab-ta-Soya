"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Users, LayoutDashboard } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";
import { USERS, ROLES, ROLE_METADATA } from "@/lib/permissions";

export default function AdminPanel() {
  const pathname = usePathname();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user has permission to view all users
  const canViewUsers = useHasPermission(USERS.VIEW_ALL);
  const canChangeRoles = useHasPermission(USERS.CHANGE_ROLES);

  useEffect(() => {
    if (canViewUsers) {
      fetchUsers();
    }
  }, [canViewUsers]);

  const fetchUsers = async () => {
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
  };

  const handleRoleChange = async (userId, newRole) => {
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
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      toast.error("Error updating role");
      console.error(error);
    }
  };

  // Show access denied if user doesn't have permission
  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const roleList = Object.values(ROLES);

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
        <Link
          href="/admin"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "bg-emerald-50 text-emerald-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Users className="w-4 h-4" />
          User Management
        </Link>
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/admin/dashboard"
              ? "bg-emerald-50 text-emerald-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Analytics Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            User Management
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} registered users
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Users className="w-4 h-4 text-gray-400" />

          <span className="text-sm font-semibold text-gray-700">
            {users.length}
          </span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["User", "Email", "Organization", "Role", "Change Role"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold uppercase">
                          {(user.full_name || user.email || "?").charAt(0)}
                        </span>
                      </div>

                      <span className="text-sm font-medium text-gray-900">
                        {user.full_name || "—"}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {user.email || "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {user.organization || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        ROLE_METADATA[user.role]?.color ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ROLE_METADATA[user.role]?.label || user.role}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {canChangeRoles ? (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                      >
                        {roleList.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_METADATA[role]?.label ||
                              role.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <p className="px-5 py-12 text-center text-gray-400 text-sm">
            No users found
          </p>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold uppercase">
                  {(user.full_name || user.email || "?").charAt(0)}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.full_name || "—"}
                </p>

                <p className="text-xs text-gray-500 truncate">
                  {user.email || "—"}
                </p>
              </div>

              <span
                className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${
                  ROLE_METADATA[user.role]?.color || "bg-gray-100 text-gray-700"
                }`}
              >
                {ROLE_METADATA[user.role]?.label || user.role}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {user.organization || "No org"}
              </span>

              {canChangeRoles ? (
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                >
                  {roleList.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_METADATA[role]?.label || role.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">
            No users found
          </p>
        )}
      </div>
    </div>
  );
}
