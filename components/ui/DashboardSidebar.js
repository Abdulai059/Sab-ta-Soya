"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDashboardView } from "@/context/DashboardViewContext";
import { useHasPermission } from "@/hooks/usePermissions";
import {
  DASHBOARD,
  REPORTS,
  MAP,
  SETTINGS,
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
  ChevronRight,
  X,
} from "lucide-react";

/* -----------------------------
   NAV STRUCTURE (CLEAN GROUPED)
------------------------------*/

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      {
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
        label: "Reports",
        view: "reports",
        icon: ClipboardList,
        permission: REPORTS.VIEW_ALL,
        type: "view",
      },
      {
        label: "Live Map",
        view: "map",
        icon: MapIcon,
        permission: MAP.VIEW,
        type: "view",
      },
      {
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
        label: "Users",
        href: "/admin",
        icon: Users,
        permission: DASHBOARD.VIEW_ADMIN_PANEL,
      },
      {
        label: "District Panel",
        href: "/district-officer",
        icon: Landmark,
        permission: DASHBOARD.VIEW_DISTRICT_PANEL,
      },
      {
        label: "NGO Portal",
        href: "/ngo",
        icon: Handshake,
        permission: DASHBOARD.VIEW_NGO_PORTAL,
      },
      {
        label: "Operator",
        href: "/operator",
        icon: Shield,
        permission: DASHBOARD.VIEW_OPERATOR_PANEL,
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: SETTINGS.VIEW,
      },
    ],
  },
];

/* -----------------------------
   COMPONENT
------------------------------*/

export default function DashboardSidebar({ open, onClose }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const { activeView, setView, clearView } = useDashboardView();

  const hasPermission = useHasPermission;

  const role = profile?.role ?? ROLES.COMMUNITY_OFFICER;
  const roleMeta = ROLE_METADATA[role] ?? {
    label: role,
    color: "bg-gray-100 text-gray-700",
  };

  const name =
    profile?.full_name || profile?.email?.split("@")[0] || "User";

  /* -----------------------------
     FILTER NAV
  ------------------------------*/
  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.permission || hasPermission(item.permission)
    ),
  })).filter((g) => g.items.length > 0);

  /* -----------------------------
     UI
  ------------------------------*/

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200
        flex flex-col z-40 overflow-y-auto transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* MOBILE CLOSE */}
      <div className="lg:hidden flex justify-end p-3">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* USER */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
            {name.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {name}
            </p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleMeta.color}`}
            >
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-3 space-y-6">
        {filteredGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-2 text-[11px] uppercase tracking-wider text-gray-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                // VIEW MODE (dashboard tabs)
                if (item.type === "view") {
                  const isActive = activeView === item.view;

                  return (
                    <button
                      key={item.label}
                      onClick={() => setView(item.view)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                    </button>
                  );
                }

                // LINK MODE
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={clearView}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="flex-1 truncate">
                      {item.label}
                    </span>

                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}