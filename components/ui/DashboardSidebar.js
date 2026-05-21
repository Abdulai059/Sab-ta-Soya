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
  USERS,
  ROLES,
  ROLE_METADATA,
} from "@/lib/permissions";
import {
  ShieldCheck,
  Landmark,
  Handshake,
  ClipboardList,
  Map as MapIcon,
  FileEdit,
  Settings as SettingsIcon,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

/**
 * Navigation items with associated permissions
 * Each item requires specific permissions to be shown
 */
const NAV_ITEMS = [
  // Dashboard Links
  {
    label: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    type: "link",
    permission: DASHBOARD.VIEW_ADMIN_PANEL,
  },
  {
    label: "Analytics Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    type: "link",
    permission: DASHBOARD.VIEW_ADMIN_PANEL,
  },
  {
    label: "District View",
    href: "/district-officer",
    icon: Landmark,
    type: "link",
    permission: DASHBOARD.VIEW_DISTRICT_PANEL,
  },
  {
    label: "NGO Portal",
    href: "/ngo",
    icon: Handshake,
    type: "link",
    permission: DASHBOARD.VIEW_NGO_PORTAL,
  },
  {
    label: "Operator Panel",
    href: "/operator",
    icon: ShieldCheck,
    type: "link",
    permission: DASHBOARD.VIEW_OPERATOR_PANEL,
  },
  {
    label: "Supervisor Panel",
    href: "/supervisor",
    icon: ShieldCheck,
    type: "link",
    permission: DASHBOARD.VIEW_SUPERVISOR_PANEL,
  },

  // Divider
  { type: "divider" },

  // View Items
  {
    label: "Reports",
    view: "reports",
    icon: ClipboardList,
    type: "view",
    permission: REPORTS.VIEW_ALL,
  },
  {
    label: "Live Map",
    view: "map",
    icon: MapIcon,
    type: "view",
    permission: MAP.VIEW,
  },
  {
    label: "Submit Issue",
    view: "submit",
    icon: FileEdit,
    type: "view",
    permission: REPORTS.CREATE,
  },

  // Divider
  { type: "divider" },

  // Settings
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    type: "link",
    permission: SETTINGS.VIEW,
  },
];

export default function DashboardSidebar({ open, onClose }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const { activeView, setView, clearView } = useDashboardView();
  const hasViewReportsPermission = useHasPermission(REPORTS.VIEW_ALL);
  const hasViewMapPermission = useHasPermission(MAP.VIEW);
  const hasCreateReportPermission = useHasPermission(REPORTS.CREATE);
  const hasViewSettingsPermission = useHasPermission(SETTINGS.VIEW);
  const hasViewAdminPanelPermission = useHasPermission(
    DASHBOARD.VIEW_ADMIN_PANEL,
  );
  const hasViewDistrictPanelPermission = useHasPermission(
    DASHBOARD.VIEW_DISTRICT_PANEL,
  );
  const hasViewNgoPortalPermission = useHasPermission(
    DASHBOARD.VIEW_NGO_PORTAL,
  );
  const hasViewOperatorPanelPermission = useHasPermission(
    DASHBOARD.VIEW_OPERATOR_PANEL,
  );
  const hasViewSupervisorPanelPermission = useHasPermission(
    DASHBOARD.VIEW_SUPERVISOR_PANEL,
  );

  const role = profile?.role ?? ROLES.COMMUNITY_OFFICER;
  const roleMeta = ROLE_METADATA[role] ?? {
    label: role,
    color: "bg-gray-100 text-gray-700",
  };
  const name = profile?.full_name || profile?.email?.split("@")[0] || "User";

  // Filter navigation items based on user permissions
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.type === "divider") return true;
    if (!item.permission) return true;

    switch (item.permission) {
      case REPORTS.VIEW_ALL:
        return hasViewReportsPermission;
      case MAP.VIEW:
        return hasViewMapPermission;
      case REPORTS.CREATE:
        return hasCreateReportPermission;
      case SETTINGS.VIEW:
        return hasViewSettingsPermission;
      case DASHBOARD.VIEW_ADMIN_PANEL:
        return hasViewAdminPanelPermission;
      case DASHBOARD.VIEW_DISTRICT_PANEL:
        return hasViewDistrictPanelPermission;
      case DASHBOARD.VIEW_NGO_PORTAL:
        return hasViewNgoPortalPermission;
      case DASHBOARD.VIEW_OPERATOR_PANEL:
        return hasViewOperatorPanelPermission;
      case DASHBOARD.VIEW_SUPERVISOR_PANEL:
        return hasViewSupervisorPanelPermission;
      default:
        return true;
    }
  });

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0 w-56 bg-white border-r border-gray-200
        flex flex-col z-40 overflow-y-auto transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end px-3 pt-3">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold uppercase">
              {name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {name}
            </p>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleMeta.color}`}
            >
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {visibleNavItems.map((item, i) => {
          if (item.type === "divider") {
            return (
              <div key={`div-${i}`} className="my-2 border-t border-gray-100" />
            );
          }

          const Icon = item.icon;

          if (item.type === "view") {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`}
                />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </button>
            );
          }

          const isActive =
            !activeView &&
            (pathname === item.href || pathname?.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={clearView}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
