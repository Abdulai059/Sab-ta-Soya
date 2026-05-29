"use client";

import { useAuth } from "@/context/AuthContext";
import { useDashboardView } from "@/context/DashboardViewContext";
import { usePermissions } from "@/hooks/usePermissions";

import {
  DASHBOARD,
  REPORTS,
  MAP,
  SETTINGS,
  USERS,
  ROLES,
  ROLE_METADATA,
} from "@/lib/permissions";

import {
  LayoutDashboard,
  ClipboardList,
  Map as MapIcon,
  FileEdit,
  Settings,
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
        view: "analytics",
        icon: LayoutDashboard,
        permission: DASHBOARD.VIEW_ADMIN_PANEL,
        type: "view",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        id: "reports",
        label: "Reports",
        view: "reports",
        icon: ClipboardList,
        permission: REPORTS.VIEW_ALL,
        type: "view",
      },
      {
        id: "my-assignments",
        label: "My Assignments",
        view: "my-assignments",
        icon: Briefcase,
        permission: REPORTS.VIEW_ASSIGNED,
        type: "view",
      },
      {
        id: "live-map",
        label: "Live Map",
        view: "map",
        icon: MapIcon,
        permission: MAP.VIEW,
        type: "view",
      },
      {
        id: "submit-issue",
        label: "Submit Issue",
        view: "submit",
        icon: FileEdit,
        permission: REPORTS.CREATE,
        type: "view",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        id: "users",
        label: "Users",
        view: "users",
        icon: Users,
        permission: DASHBOARD.VIEW_ADMIN_PANEL,
        type: "view",
      },
      {
        id: "district",
        label: "District Panel",
        view: "district",
        icon: Landmark,
        permission: DASHBOARD.VIEW_DISTRICT_PANEL,
        type: "view",
      },
      {
        id: "ngo",
        label: "NGO Portal",
        view: "ngo",
        icon: Handshake,
        permission: DASHBOARD.VIEW_NGO_PORTAL,
        type: "view",
      },
      {
        id: "operator",
        label: "Operator",
        view: "operator",
        icon: Shield,
        permission: DASHBOARD.VIEW_OPERATOR_PANEL,
        type: "view",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "profile",
        label: "Profile",
        view: "profile",
        icon: UserCircle,
        type: "view",
      },
    ],
  },
];

export default function DashboardSidebar({ open, onClose }) {
  const { profile, signOut, loading: authLoading } = useAuth();
  const { activeView, setView } = useDashboardView();
  const userPermissions = usePermissions();

  const hasPermission = (permission) => userPermissions.includes(permission);

  const role = profile?.role ?? ROLES.COMMUNITY_OFFICER;
  const roleMeta = ROLE_METADATA[role] ?? { label: role, color: "bg-gray-100 text-gray-700" };
  const name = profile?.full_name || profile?.email?.split("@")[0] || "User";

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        (!item.permission || hasPermission(item.permission)) &&
        (!item.excludePermission || !hasPermission(item.excludePermission))
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
                  const isActive = activeView === item.view;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setView(item.view); onClose(); }}
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
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-gray-800" : "text-gray-400  group-hover:text-gray-600"}`} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    </button>
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