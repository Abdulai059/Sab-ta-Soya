"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";

import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";
import { DashboardViewContext } from "@/context/DashboardViewContext";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS, DASHBOARD } from "@/lib/permissions";

const lazy = (importFn) => dynamic(importFn, { ssr: false });

const AnalyticsPage    = lazy(() => import("@/app/(dashboard)/admin/analytics/page"));
const MapPage          = lazy(() => import("@/app/maps/page"));
const ReportsPage      = lazy(() => import("@/app/reports/page"));
const SubmitPage       = lazy(() => import("@/app/reporteissue/page"));
const ReportDetail     = lazy(() => import("@/app/reports/[id]/page"));
const UserManagementPage = lazy(() => import("@/app/(dashboard)/admin/page"));
const DistrictPage     = lazy(() => import("@/app/(dashboard)/district-officer/page"));
const NgoPage          = lazy(() => import("@/app/(dashboard)/ngo/page"));
const OperatorPage     = lazy(() => import("@/app/(dashboard)/operator/page"));
const ProfilePage      = lazy(() => import("@/components/profile/ProfilePage"));

const VIEW_COMPONENTS = {
  analytics:    AnalyticsPage,
  map:          MapPage,
  reports:      ReportsPage,
  submit:       SubmitPage,
  reportDetail: ReportDetail,
  users:        UserManagementPage,
  district:     DistrictPage,
  ngo:          NgoPage,
  operator:     OperatorPage,
  profile:      ProfilePage,
};

const VIEW_LABELS = {
  analytics:    "Analytics",
  map:          "Live Map",
  reports:      "Reports",
  submit:       "Submit Issue",
  reportDetail: "Report Detail",
  users:        "User Management",
  district:     "District Panel",
  ngo:          "NGO Portal",
  operator:     "Operator",
  profile:      "Profile",
};

function getDefaultView(role) {
  const perms = ROLE_PERMISSIONS[role] || [];
  const can = (p) => perms.includes(p);

  if (can(DASHBOARD.VIEW_ADMIN_PANEL))    return "analytics";
  if (can(DASHBOARD.VIEW_DISTRICT_PANEL)) return "district";
  if (can(DASHBOARD.VIEW_NGO_PORTAL))     return "ngo";
  if (can(DASHBOARD.VIEW_OPERATOR_PANEL)) return "operator";
  return "reports";
}

export default function DashboardShell({ children }) {
  const { profile, loading: authLoading } = useAuth();
  const [activeView, setActiveView]   = useState(null);
  const [viewParams, setViewParams]   = useState({});
  const [history, setHistory]         = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (profile?.role && activeView === null) {
      setActiveView(getDefaultView(profile.role));
    }
  }, [profile?.role, activeView]);

  const setView = useCallback(
    (view, params = {}) => {
      setHistory((prev) =>
        activeView ? [...prev, { view: activeView, params: viewParams }] : prev
      );
      setActiveView(view);
      setViewParams(params);
      setSidebarOpen(false);
    },
    [activeView, viewParams]
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setActiveView(prev.view);
      setViewParams(prev.params);
    } else {
      setActiveView(getDefaultView(profile?.role));
      setViewParams({});
    }
  }, [history, profile?.role]);

  const clearView = useCallback(() => {
    setActiveView(getDefaultView(profile?.role));
    setViewParams({});
    setHistory([]);
    setSidebarOpen(false);
  }, [profile?.role]);

  const ActiveComponent = activeView ? VIEW_COMPONENTS[activeView] : null;
  const isMap = activeView === "map";

  return (
    <DashboardViewContext.Provider value={{ activeView, viewParams, setView, goBack, clearView }}>
      <DashboardNavbar />

      <div className="flex h-screen pt-16">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 min-h-0 flex flex-col bg-gray-50">
          <div className="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {VIEW_LABELS[activeView] ?? "Dashboard"}
            </span>
          </div>

          {isMap ? (
            <div className="flex-1 h-0 overflow-hidden">
              {ActiveComponent && <ActiveComponent {...viewParams} />}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                {authLoading || activeView === null ? (
                  <DashboardSkeleton />
                ) : ActiveComponent ? (
                  <ActiveComponent {...viewParams} />
                ) : (
                  children
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardViewContext.Provider>
  );
}