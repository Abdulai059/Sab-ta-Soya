"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SEVERITY_COLORS, PRIORITY_COLORS, WORKER_COLORS, STATUS_CONFIG } from "./constants";
import { daysAgo, buildInitials, formatDate } from "./utils";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";

const DONE_STATUSES = ["disposed", "verified"];

async function fetchDashboard() {
  const thirtyDaysAgo = daysAgo(30);
  const sevenDaysAgo  = daysAgo(7);
  const yesterday     = daysAgo(1);

  // ── Fire all 3 queries in parallel ──────────────────────────────────────
  const [
    { data: reports,     error },
    { data: riskRows },
    { data: doneReports },
  ] = await Promise.all([
    supabase
      .from("sanitation_reports")
      .select("id, severity, status, issue_type, created_at, updated_at, assigned_to")
      .gte("created_at", thirtyDaysAgo.toISOString()),

    supabase
      .from("risk_assessments")
      .select(
        "priority_level, risk_score, near_school, near_water_source, flood_zone, drought_zone, repeated_incident, escalation_required, affected_children_count"
      )
      .gte("calculated_at", thirtyDaysAgo.toISOString()),

    supabase
      .from("sanitation_reports")
      .select(
        "id, status, updated_at, assigned_to, worker:profiles!sanitation_reports_assigned_to_fkey(id, full_name, role)"
      )
      .in("status", DONE_STATUSES),
  ]);

  if (error) throw error;
  if (!reports) return null;

  // ── Metrics ──────────────────────────────────────────────────────────────
  const statusOf  = (r) => (r.status || "").toLowerCase().trim();
  const isDone    = (r) => DONE_STATUSES.includes(statusOf(r));
  const isPending = (r) => statusOf(r) === "pending";

  const total              = reports.length;
  const open               = reports.filter(isPending).length;
  const resolved           = reports.filter(isDone).length;
  const totalInLastWeek    = reports.filter((r) => new Date(r.created_at) >= sevenDaysAgo).length;
  const openSinceYesterday = reports.filter((r) => isPending(r) && new Date(r.created_at) >= yesterday).length;
  const resolvedInLastWeek = reports.filter((r) => isDone(r) && new Date(r.created_at) >= sevenDaysAgo).length;

  const responseTimes = reports
    .filter(isDone)
    .map((r) => (new Date(r.updated_at) - new Date(r.created_at)) / 36e5)
    .filter((h) => h > 0);
  const avgResponseHours = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
    : 0;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const countBy = (arr, key) =>
    arr.reduce((acc, r) => { acc[r[key]] = (acc[r[key]] || 0) + 1; return acc; }, {});

  // ── Severity / issue types / trend / status ───────────────────────────────
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

  // ── Risk assessments ──────────────────────────────────────────────────────
  const rows = riskRows || [];
  const riskPriority = ["critical", "high", "medium", "low"]
    .map((level) => ({
      name: level,
      value: rows.filter((r) => r.priority_level === level).length,
      color: PRIORITY_COLORS[level],
    }))
    .filter((r) => r.value > 0);

  const riskTotal = rows.length || 1;
  const riskScoring = [
    { factor: "Near School",       count: rows.filter((r) => r.near_school).length,         points: 15 },
    { factor: "Near Water Source", count: rows.filter((r) => r.near_water_source).length,   points: 15 },
    { factor: "Flood Zone",        count: rows.filter((r) => r.flood_zone).length,          points: 10 },
    { factor: "Drought Zone",      count: rows.filter((r) => r.drought_zone).length,        points: 10 },
    { factor: "Repeated Incident", count: rows.filter((r) => r.repeated_incident).length,   points: 10 },
    { factor: "Escalation Req.",   count: rows.filter((r) => r.escalation_required).length, points: 0  },
  ].map((f) => ({ ...f, pct: Math.round((f.count / riskTotal) * 100) }));

  // ── Worker performance ────────────────────────────────────────────────────
  const workerMap = {};
  (doneReports || []).forEach((report) => {
    const w = report.worker;
    if (!w?.id || !w?.full_name) return;
    if (!workerMap[w.id]) workerMap[w.id] = { id: w.id, name: w.full_name, role: w.role, cases: 0, lastResolved: null };
    workerMap[w.id].cases += 1;
    workerMap[w.id].lastResolved = report.updated_at;
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
    riskPriority,
    riskScoring,
  };
}

const EMPTY = {
  metrics: { total: 0, open: 0, resolved: 0, avgResponseHours: 0, totalInLastWeek: 0, openSinceYesterday: 0, resolvedInLastWeek: 0 },
  severity: [],
  issueTypes: [],
  trend: [],
  statusSnap: [],
  workers: [],
  riskPriority: [],
  riskScoring: [],
};

export function useDashboardData() {
  const { data = EMPTY, isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: fetchDashboard,
    staleTime: 60_000,        // serve cached data for 60s before refetching
    gcTime: 5 * 60_000,       // keep in cache for 5 min
    refetchOnWindowFocus: false,
  });

  return { ...data, loading };
}
