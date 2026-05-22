"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SEVERITY_COLORS, WORKER_COLORS, STATUS_CONFIG } from "./constants";
import { daysAgo, buildInitials, formatDate } from "./utils";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";

async function fetchDashboard() {
  const thirtyDaysAgo = daysAgo(30);
  const sevenDaysAgo  = daysAgo(7);
  const yesterday     = daysAgo(1);

  const { data: reports, error } = await supabase
    .from("sanitation_reports")
    .select("id, severity, status, issue_type, created_at, report_assignments(resolved_at, assigned_at)")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error) throw error;
  if (!reports) return null;

  const statusOf  = (r) => (r.status || "").toLowerCase().trim();
  const isResolved = (r) => ["resolved", "completed"].includes(statusOf(r));
  const isPending  = (r) => statusOf(r) === "pending";

  const total              = reports.length;
  const open               = reports.filter(isPending).length;
  const resolved           = reports.filter(isResolved).length;
  const totalInLastWeek    = reports.filter((r) => new Date(r.created_at) >= sevenDaysAgo).length;
  const openSinceYesterday = reports.filter((r) => isPending(r) && new Date(r.created_at) >= yesterday).length;
  const resolvedInLastWeek = reports.filter((r) => isResolved(r) && new Date(r.created_at) >= sevenDaysAgo).length;

  const responseTimes = reports
    .filter((r) => r.report_assignments?.[0]?.resolved_at)
    .map((r) => (new Date(r.report_assignments[0].resolved_at) - new Date(r.created_at)) / 36e5);

  const avgResponseHours = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
    : 0;

  const countBy = (arr, key) =>
    arr.reduce((acc, r) => { acc[r[key]] = (acc[r[key]] || 0) + 1; return acc; }, {});

  const severity = Object.entries(countBy(reports, "severity")).map(([name, value]) => ({
    name, value, color: SEVERITY_COLORS[name] || "#999",
  }));

  const issueTypes = Object.entries(countBy(reports, "issue_type"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([type, count]) => ({ type, count }));

  const dayMap = {};
  reports.forEach((r) => {
    const day = formatDate(r.created_at, { day: "2-digit", month: "short" });
    dayMap[day] = (dayMap[day] || 0) + 1;
  });
  const trend = Object.entries(dayMap).map(([day, incidents]) => ({ day, incidents }));

  const statusCounts = countBy(reports, "status");
  const getCount = (...keys) =>
    keys.reduce((sum, k) => sum + (statusCounts[(k || "").toLowerCase()] || 0), 0);
  const statusSnap = STATUS_CONFIG.map((s) => ({ ...s, count: getCount(...s.keys) }));

  // Worker performance
  const { data: resolvedReports } = await supabase
    .from("sanitation_reports")
    .select(
      `id, status, updated_at, reported_by,
       reporter:profiles!sanitation_reports_reported_by_fkey(id, full_name, role),
       report_assignments(
         assigned_to, resolved_at,
         worker:profiles!report_assignments_assigned_to_fkey(id, full_name, role)
       )`
    )
    .in("status", ["resolved", "Resolved", "completed"]);

  const workerMap = {};
  const addWorker = (id, name, role, timestamp) => {
    if (!id || !name) return;
    if (!workerMap[id]) workerMap[id] = { id, name, role, cases: 0, lastResolved: null };
    workerMap[id].cases += 1;
    workerMap[id].lastResolved = timestamp;
  };

  resolvedReports?.forEach((report) => {
    const assignments = report.report_assignments || [];
    if (assignments.length > 0) {
      assignments.forEach((ra) =>
        addWorker(ra.assigned_to, ra.worker?.full_name, ra.worker?.role, ra.resolved_at || report.updated_at)
      );
    } else {
      addWorker(report.reported_by, report.reporter?.full_name, report.reporter?.role, report.updated_at);
    }
  });

  const workers = Object.values(workerMap)
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 5)
    .map((w, i) => ({
      id: w.id,
      name: w.name,
      role: w.role || "operator",
      initials: buildInitials(w.name),
      cases: w.cases,
      lastResolved: w.lastResolved,
      color: WORKER_COLORS[i],
    }));

  return {
    metrics: { total, open, resolved, avgResponseHours, totalInLastWeek, openSinceYesterday, resolvedInLastWeek },
    severity,
    issueTypes,
    trend,
    statusSnap,
    workers,
  };
}

const EMPTY = {
  metrics: { total: 0, open: 0, resolved: 0, avgResponseHours: 0, totalInLastWeek: 0, openSinceYesterday: 0, resolvedInLastWeek: 0 },
  severity: [],
  issueTypes: [],
  trend: [],
  statusSnap: [],
  workers: [],
};

export function useDashboardData() {
  const { data = EMPTY, isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: fetchDashboard,
  });

  return { ...data, loading };
}
