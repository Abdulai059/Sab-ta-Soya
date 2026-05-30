"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

import {
  DASHBOARD,
  REPORTS,
  MAP,
  USERS,
  ROLES,
  ROLE_METADATA,
} from "@/lib/permissions";

import {
  LayoutDashboard,
  ClipboardList,
  Map as MapIcon,
  FileEdit,
  LogOut,
  Shield,
  Landmark,
  Handshake,
  Users,
  X,
  UserCircle,
  Briefcase,
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        href: "/admin/analytics",
        icon: LayoutDashboard,
        permission: DASHBOARD.VIEW_ADMIN_PANEL,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        id: "reports",
        label: "Reports",
        href: "/reports",
        icon: ClipboardList,
        permission: REPORTS.VIEW_ALL,
      },
      {
        id: "my-assignments",
        label: "My Assignments",
        href: "/my-assignments",
        icon: Briefcase,
        permission: REPORTS.VIEW_ASSIGNED,
      },
      {
        id: "live-map",
        label: "Live Map",
        href: "/maps",
        icon: MapIcon,
        permission: MAP.VIEW,
      },
      {
        id: "submit-issue",
        label: "Submit Issue",
        href: "/reporteissue",
        icon: FileEdit,
        permission: REPORTS.CREATE,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        id: "users",
        label: "Users",
        href: "/admin",
        icon: Users,
        permission: DASHBOARD.VIEW_ADMIN_PANEL,
      },
      {
        id: "district",
        label: "District Panel",
        href: "/district-officer",
        icon: Landmark,
        permission: DASHBOARD.VIEW_DISTRICT_PANEL,
      },
      {
        id: "ngo",
        label: "NGO Portal",
        href: "/ngo",
        icon: Handshake,
        permission: DASHBOARD.VIEW_NGO_PORTAL,
      },
      {
        id: "operator",
        label: "Operator",
        href: "/operator",
        icon: Shield,
        permission: DASHBOARD.VIEW_OPERATOR_PANEL,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "profile",
        label: "Profile",
        href: "/profile",
        icon: UserCircle,
      },
    ],
  },
];

export default function DashboardSidebar({ open, onClose }) {
  const { profile, signOut, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const userPermissions = usePermissions();

  const hasPermission = (permission) => userPermissions.includes(permission);

  const role = profile?.role ?? ROLES.COMMUNITY_OFFICER;
  const roleMeta = ROLE_METADATA[role] ?? { label: role, color: "bg-gray-100 text-gray-700" };
  const name = profile?.full_name || profile?.email?.split("@")[0] || "User";

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.permission || hasPermission(item.permission)
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0
        w-60 bg-white border-r border-gray-100
        flex flex-col z-40 overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0 shadow-xl" : "-translate-x-full"}
        lg:translate-x-0 lg:shadow-none
      `}
    >
      <div className="lg:hidden flex justify-end p-3">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6">
        {authLoading || !profile ? (
          <div className="space-y-1 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group w-full flex items-center gap-3
                        px-3 py-2.5 rounded-xl text-sm font-medium
                        transition-all duration-150
                        ${isActive
                          ? "bg-brand-primary text-gray-900 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-gray-800" : "text-gray-400 group-hover:text-gray-600"}`} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
