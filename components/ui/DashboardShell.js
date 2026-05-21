"use client";

import { useState, useCallback } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";
import dynamic from "next/dynamic";
import { DashboardViewContext } from "@/context/DashboardViewContext";

const Loader = ({ label }) => (
  <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
    Loading {label}…
  </div>
);

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
const AssignWorkerPage = dynamic(() => import("@/components/admin/AssignWorkerPage"), {
  ssr: false,
  loading: () => <Loader label="assignments" />,
});
const WorkerOffersPage = dynamic(() => import("@/components/admin/WorkerOffersPage"), {
  ssr: false,
  loading: () => <Loader label="offers" />,
});

const VIEW_COMPONENTS = {
  map: MapPage,
  reports: ReportsPage,
  submit: SubmitPage,
  reportDetail: ReportDetail,
  assignWorker: AssignWorkerPage,
  workerOffers: WorkerOffersPage,
};

export default function DashboardShell({ children }) {
  const [activeView, setActiveView] = useState(null);
  const [viewParams, setViewParams] = useState({});
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const setView = useCallback(
    (view, params = {}) => {
      setHistory((prev) =>
        activeView ? [...prev, { view: activeView, params: viewParams }] : prev,
      );
      setActiveView(view);
      setViewParams(params);
      setSidebarOpen(false); // close drawer on mobile after selection
    },
    [activeView, viewParams],
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setActiveView(prev.view);
      setViewParams(prev.params);
    } else {
      setActiveView(null);
      setViewParams({});
    }
  }, [history]);

  const clearView = useCallback(() => {
    setActiveView(null);
    setViewParams({});
    setHistory([]);
    setSidebarOpen(false);
  }, []);

  const ActiveComponent = activeView ? VIEW_COMPONENTS[activeView] : null;

  return (
    <DashboardViewContext.Provider
      value={{ activeView, viewParams, setView, goBack, clearView }}
    >
      <div className="flex flex-col min-h-screen">
        {/* Dashboard Navbar */}
        <DashboardNavbar activeNav={activeNav} onNavChange={setActiveNav} />

        <div className="flex flex-1">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <DashboardSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main content */}
          <div className="flex-1 lg:ml-64 min-h-screen bg-gray-50 overflow-y-auto">
            {/* Mobile top bar with hamburger */}
            <div className="lg:hidden sticky top-16 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Open menu"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-700">
                {activeView
                  ? {
                      map: "Live Map",
                      reports: "Reports",
                      submit: "Submit Issue",
                      reportDetail: "Report Detail",
                      assignWorker: "Assign Workers",
                      workerOffers: "Worker Offers",
                    }[activeView]
                  : "Dashboard"}
              </span>
            </div>

            <div className="p-4 sm:p-6 pt-4">
              {ActiveComponent ? <ActiveComponent /> : children}
            </div>
          </div>
        </div>
      </div>
    </DashboardViewContext.Provider>
  );
}
