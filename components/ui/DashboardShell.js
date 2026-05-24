"use client";

import { useState, useCallback, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";
import dynamic from "next/dynamic";
import { DashboardViewContext } from "@/context/DashboardViewContext";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS, DASHBOARD } from "@/lib/permissions";
import { Menu } from "lucide-react";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";

const Loader = ({ label }) => (
  <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    Loading {label}…
  </div>
);

const AnalyticsPage = dynamic(() => import("@/app/(dashboard)/admin/analytics/page"), {
  ssr: false,
  loading: () => <Loader label="analytics" />,
});
const MapPage = dynamic(() => import("@/app/maps/page"), {
  ssr: false,
  loading: () => <Loader label="map" />,
});
const ReportsPage = dynamic(() => import("@/app/reports/page"), {
  ssr: false,
  loading: () => <Loader label="reports" />,
});
const SubmitPage = dynamic(() => import("@/app/reporteissue/page"), {
  ssr: false,
  loading: () => <Loader label="form" />,
});
const ReportDetail = dynamic(() => import("@/app/reports/[id]/page"), {
  ssr: false,
  loading: () => <Loader label="report" />,
});

const UserManagementPage = dynamic(() => import("@/app/(dashboard)/admin/page"), {
  ssr: false,
  loading: () => <Loader label="users" />,
});
const DistrictPage = dynamic(() => import("@/app/(dashboard)/district-officer/page"), {
  ssr: false,
  loading: () => <Loader label="district" />,
});
const NgoPage = dynamic(() => import("@/app/(dashboard)/ngo/page"), {
  ssr: false,
  loading: () => <Loader label="NGO portal" />,
});
const OperatorPage = dynamic(() => import("@/app/(dashboard)/operator/page"), {
  ssr: false,
  loading: () => <Loader label="operator" />,
});

const VIEW_COMPONENTS = {
  analytics: AnalyticsPage,
  map: MapPage,
  reports: ReportsPage,
  submit: SubmitPage,
  reportDetail: ReportDetail,
  users: UserManagementPage,
  district: DistrictPage,
  ngo: NgoPage,
  operator: OperatorPage,
};

const VIEW_LABELS = {
  analytics: "Analytics",
  map: "Live Map",
  reports: "Reports",
  submit: "Submit Issue",
  reportDetail: "Report Detail",
  users: "User Management",
  district: "District Panel",
  ngo: "NGO Portal",
  operator: "Operator",
};

/** Pick the best default view for a role */
function getDefaultView(role) {
  const perms = ROLE_PERMISSIONS[role] || [];
  const isAdmin = perms.includes(DASHBOARD.VIEW_ADMIN_PANEL);
  const isDistrict = perms.includes(DASHBOARD.VIEW_DISTRICT_PANEL) && !isAdmin;
  const isNgo = perms.includes(DASHBOARD.VIEW_NGO_PORTAL) && !isAdmin;
  const isOperator = perms.includes(DASHBOARD.VIEW_OPERATOR_PANEL) && !isAdmin;

  if (isAdmin) return "analytics";
  if (isDistrict) return "district";
  if (isNgo) return "ngo";
  if (isOperator) return "operator";
  return "reports";
}

export default function DashboardShell({ children }) {
  const { profile, loading: authLoading } = useAuth();
  const [activeView, setActiveView] = useState(null);
  const [viewParams, setViewParams] = useState({});
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set the default view once the profile loads
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

  return (
    <DashboardViewContext.Provider
      value={{ activeView, viewParams, setView, goBack, clearView }}
    >
      {/* ── Fixed top navbar ─────────────────────────────────────────── */}
      <DashboardNavbar />

      {/* ── Body: sidebar + content, starts below navbar ─────────────── */}
      <div className="flex h-screen pt-16">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Fixed sidebar ──────────────────────────────────────────── */}
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── Main content ───────────────────────────────────────────── */}
        <main className="flex-1 lg:ml-64 min-h-0 flex flex-col bg-gray-50">

          {/* Mobile header bar with hamburger */}
          <div className="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {activeView ? (VIEW_LABELS[activeView] ?? "Dashboard") : "Dashboard"}
            </span>
          </div>

          {/* Map — fills all remaining space, no padding, no scroll */}
          {activeView === "map" ? (
            <div className="flex-1 h-0 overflow-hidden">
              {ActiveComponent && <ActiveComponent {...viewParams} />}
            </div>
          ) : (
            /* All other views — scrollable with padding */
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
