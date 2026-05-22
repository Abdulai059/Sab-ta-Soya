"use client";

import { useState, useCallback } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";
import dynamic from "next/dynamic";
import { DashboardViewContext } from "@/context/DashboardViewContext";
import { Menu } from "lucide-react";

const Loader = ({ label }) => (
  <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
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
const MyOffersPage = dynamic(() => import("@/components/worker/MyOffersPage"), {
  ssr: false,
  loading: () => <Loader label="my offers" />,
});

const VIEW_COMPONENTS = {
  map: MapPage,
  reports: ReportsPage,
  submit: SubmitPage,
  reportDetail: ReportDetail,
  assignWorker: AssignWorkerPage,
  workerOffers: WorkerOffersPage,
  myOffers: MyOffersPage,
};

const VIEW_LABELS = {
  map: "Live Map",
  reports: "Reports",
  submit: "Submit Issue",
  reportDetail: "Report Detail",
  assignWorker: "Assign Workers",
  workerOffers: "Worker Offers",
  myOffers: "My Offers",
};

export default function DashboardShell({ children }) {
  const [activeView, setActiveView] = useState(null);
  const [viewParams, setViewParams] = useState({});
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

        {/* ── Scrollable main content ────────────────────────────────── */}
        <main className="flex-1 lg:ml-64 overflow-y-auto bg-gray-50 min-h-0">

          {/* Mobile header bar with hamburger */}
          <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
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

          {/* Page content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {ActiveComponent ? (
              <ActiveComponent {...viewParams} />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </DashboardViewContext.Provider>
  );
}
