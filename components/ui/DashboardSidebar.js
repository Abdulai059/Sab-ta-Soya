"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDashboardView } from "@/context/DashboardViewContext";
import {
  ShieldCheck, Wrench, Landmark, Handshake,
  ClipboardList, Map, FileEdit, Settings,
  LogOut, ChevronRight, X,
} from "lucide-react";

const NAV_BY_ROLE = {
  admin: [
    { label: "Admin Panel",      href: "/admin",            icon: ShieldCheck,   type: "link" },
    { label: "District Officer", href: "/district-officer", icon: Landmark,      type: "link" },
    { label: "NGO",              href: "/ngo",              icon: Handshake,     type: "link" },
    { type: "divider" },
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
    { type: "divider" },
    { label: "Settings",         href: "/settings",         icon: Settings,      type: "link" },
  ],
  district_officer: [
    { label: "District View",    href: "/district-officer", icon: Landmark,      type: "link" },
    { type: "divider" },
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  community_officer: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  health_officer: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  ngo: [
    { label: "NGO Portal",       href: "/ngo",              icon: Handshake,     type: "link" },
    { type: "divider" },
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  response_team: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  headteacher: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  community_agent: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  sanitation_worker: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  field_worker: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
  supervisor: [
    { label: "Reports",          view: "reports",           icon: ClipboardList, type: "view" },
    { label: "Live Map",         view: "map",               icon: Map,           type: "view" },
    { label: "Submit Issue",     view: "submit",            icon: FileEdit,      type: "view" },
  ],
};

const ROLE_META = {
  admin:             { label: "Administrator",    color: "bg-violet-100 text-violet-700" },
  district_officer:  { label: "District Officer", color: "bg-sky-100 text-sky-700" },
  community_officer: { label: "Community Officer",color: "bg-emerald-100 text-emerald-700" },
  health_officer:    { label: "Health Officer",   color: "bg-pink-100 text-pink-700" },
  ngo:               { label: "NGO Partner",      color: "bg-amber-100 text-amber-700" },
  response_team:     { label: "Response Team",    color: "bg-red-100 text-red-700" },
  headteacher:       { label: "Head Teacher",     color: "bg-indigo-100 text-indigo-700" },
  community_agent:   { label: "Community Agent",  color: "bg-teal-100 text-teal-700" },
  sanitation_worker: { label: "Sanitation Worker",color: "bg-lime-100 text-lime-700" },
  field_worker:      { label: "Field Worker",     color: "bg-orange-100 text-orange-700" },
  supervisor:        { label: "Supervisor",       color: "bg-cyan-100 text-cyan-700" },
};

export default function DashboardSidebar({ open, onClose }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const { activeView, setView, clearView } = useDashboardView();

  const role     = profile?.role ?? "community_officer";
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.community_officer;
  const roleMeta = ROLE_META[role] ?? { label: role, color: "bg-gray-100 text-gray-700" };
  const name     = profile?.full_name || profile?.email?.split("@")[0] || "User";

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
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleMeta.color}`}>
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.type === "divider") {
            return <div key={`div-${i}`} className="my-2 border-t border-gray-100" />;
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
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          }

          const isActive = !activeView && (pathname === item.href || pathname?.startsWith(item.href + "/"));
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
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />}
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
