"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (!profile) {
        router.push("/login");
        return;
      }
      if (profile.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
      fetchUsers();
    }
  }, [profile, loading, mounted, router]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error fetching users");
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        toast.error("Error updating role");
      } else {
        toast.success("Role updated successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Error updating role");
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Admin Panel - User Management
        </h3>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full text-white ${
                        user.role === "admin"
                          ? "bg-red-500"
                          : user.role === "operator"
                            ? "bg-blue-500"
                            : user.role === "district_officer"
                              ? "bg-green-500"
                              : "bg-purple-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="operator">Operator</option>
                      <option value="district_officer">
                        District Officer
                      </option>
                      <option value="ngo">NGO</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
