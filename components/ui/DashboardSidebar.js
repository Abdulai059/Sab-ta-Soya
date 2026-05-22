"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDashboardView } from "@/context/DashboardViewContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useMyOfferCount } from "@/hooks/useMyOfferCount";

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
  UserCheck,
  ClipboardCheck,
  Bell,
  X,
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
        view: "reports",
        icon: ClipboardList,
        permission: REPORTS.VIEW_ALL,
        type: "view",
      },
      {
        id: "assign-workers",
        label: "Assign Workers",
        view: "assignWorker",
        icon: UserCheck,
        permission: REPORTS.ASSIGN,
        type: "view",
      },
      {
        id: "worker-offers",
        label: "Worker Offers",
        view: "workerOffers",
        icon: ClipboardCheck,
        permission: REPORTS.ASSIGN,
        type: "view",
      },
      {
        id: "my-offers",
        label: "My Offers",
        view: "myOffers",
        icon: Bell,
        permission: REPORTS.VIEW_ASSIGNED,
        excludePermission: REPORTS.ASSIGN,
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
    title: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: SETTINGS.VIEW,
      },
    ],
  },
];

export default function DashboardSidebar({ open, onClose }) {
  const { profile, signOut } = useAuth();
  const { setView, clearView } = useDashboardView();

  const userPermissions = usePermissions();
  const pendingOfferCount = useMyOfferCount();

  const [activeItem, setActiveItem] = useState("reports");

  const hasPermission = (permission) =>
    userPermissions.includes(permission);

  const role = profile?.role ?? ROLES.COMMUNITY_OFFICER;

  const roleMeta = ROLE_METADATA[role] ?? {
    label: role,
    color: "bg-gray-100 text-gray-700",
  };

  const name =
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "User";

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        (!item.permission || hasPermission(item.permission)) &&
        (!item.excludePermission ||
          !hasPermission(item.excludePermission))
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0
        w-64 bg-white border-r border-gray-100
        flex flex-col z-40 overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0 shadow-xl" : "-translate-x-full"}
        lg:translate-x-0 lg:shadow-none
      `}
    >
      {/* MOBILE CLOSE */}
      <div className="lg:hidden flex justify-end p-3">
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 transition"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* USER */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
            {name.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {name}
            </p>

            <span
              className={`inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${roleMeta.color}`}
            >
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {filteredGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                const isActive = activeItem === item.id;

                const baseClass = `
                  group flex items-center gap-3
                  px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-200
                `;

                const activeClass = isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

                // VIEW ITEMS
                if (item.type === "view") {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveItem(item.id);
                        setView(item.view);
                      }}
                      className={`${baseClass} ${activeClass} w-full`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-emerald-600"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />

                      <span className="flex-1 text-left truncate font-medium">
                        {item.label}
                      </span>

                      {item.view === "myOffers" &&
                        pendingOfferCount > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                            {pendingOfferCount}
                          </span>
                        )}
                    </button>
                  );
                }

                // LINK ITEMS
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setActiveItem(item.id);
                      clearView();
                    }}
                    className={`${baseClass} ${activeClass}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-emerald-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />

                    <span className="flex-1 truncate font-medium">
                      {item.label}
                    </span>
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
          className="
            flex items-center gap-3 w-full
            px-3 py-2.5 rounded-xl
            text-sm font-medium text-red-500
            hover:bg-red-50 transition-all
          "
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}