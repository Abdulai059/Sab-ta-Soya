"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

const ROLE_STYLES = {
  admin:             "bg-violet-100 text-violet-700",
  district_officer:  "bg-sky-100 text-sky-700",
  community_officer: "bg-emerald-100 text-emerald-700",
  health_officer:    "bg-pink-100 text-pink-700",
  ngo:               "bg-amber-100 text-amber-700",
  response_team:     "bg-red-100 text-red-700",
  headteacher:       "bg-indigo-100 text-indigo-700",
  community_agent:   "bg-teal-100 text-teal-700",
  sanitation_worker: "bg-lime-100 text-lime-700",
  field_worker:      "bg-orange-100 text-orange-700",
  supervisor:        "bg-cyan-100 text-cyan-700",
};

const ROLES = [
  "admin", "district_officer", "community_officer", "health_officer",
  "ngo", "response_team", "headteacher", "community_agent",
  "sanitation_worker", "field_worker", "supervisor",
];

export default function AdminPanel() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at, organization, phone")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
      if (error) throw error;
      toast.success("Role updated");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      toast.error("Error updating role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">{users.length}</span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["User", "Email", "Organization", "Role", "Change Role"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold uppercase">
                          {(user.full_name || user.email || "?").charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{user.email || "—"}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{user.organization || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${ROLE_STYLES[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>
                          {r.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="px-5 py-12 text-center text-gray-400 text-sm">No users found</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold uppercase">
                  {(user.full_name || user.email || "?").charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name || "—"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email || "—"}</p>
              </div>
              <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${ROLE_STYLES[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{user.organization || "No org"}</span>
              <select
                value={user.role}
                onChange={e => handleRoleChange(user.id, e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">No users found</p>
        )}
      </div>
    </div>
  );
}
