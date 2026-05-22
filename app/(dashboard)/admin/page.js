"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard } from "lucide-react";
import { useUserManagement } from "@/components/admin/useUserManagement";
import UserTable from "@/components/admin/UserTable";
import UserMobileList from "@/components/admin/UserMobileList";



export default function AdminPanel() {
  const pathname = usePathname();

  const {
    users,
    loading,
    canViewUsers,
    canChangeRoles,
    handleRoleChange,
  } = useUserManagement();

  /* -----------------------------
     PERMISSION CHECK
  ------------------------------*/
  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">
          You don’t have permission to access this page.
        </p>
      </div>
    );
  }

  /* -----------------------------
     LOADING STATE
  ------------------------------*/
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading users…</p>
        </div>
      </div>
    );
  }

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname?.startsWith(href + "/");

  /* -----------------------------
     UI
  ------------------------------*/
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage users, roles and permissions
          </p>
        </div>

        {/* USER COUNT CARD */}
        <div className="flex items-center gap-3 bg-brand-primary border border-gray-200 rounded-xl px-4 py-2 shadow-sm w-fit">
          <Users className="w-4 h-4 text-gray-500" />
          <div className="text-right">
            <p className="text-xs text-gray-500 leading-none">
              Total Users
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {users.length}
            </p>
          </div>
        </div>
      </div>



      {/* CONTENT */}
      <div className="space-y-6">
        <UserTable
          users={users}
          canChangeRoles={canChangeRoles}
          onRoleChange={handleRoleChange}
        />

        <UserMobileList
          users={users}
          canChangeRoles={canChangeRoles}
          onRoleChange={handleRoleChange}
        />
      </div>
    </div>
  );
}