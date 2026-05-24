"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/lib/realtimeInvalidator";
import {
  SEVERITY_COLORS,
  PRIORITY_COLORS,
  WORKER_COLORS,
  STATUS_CONFIG,
} from "./constants";
import { daysAgo, buildInitials, formatDate } from "./utils";

const DONE_STATUSES = ["disposed", "verified"];

const RISK_FACTORS = [
  { key: "near_school",        label: "Near School",       points: 15 },
  { key: "near_water_source",  label: "Near Water Source", points: 15 },
  { key: "flood_zone",         label: "Flood Zone",        points: 10 },
  { key: "drought_zone",       label: "Drought Zone",      points: 10 },
  { key: "repeated_incident",  label: "Repeated Incident", points: 10 },
  { key: "escalation_required",label: "Escalation Req.",   points: 0  },
];

const PRIORITY_LEVELS = ["critical", "high", "medium", "low"];

const EMPTY_STATE = {
  metrics: {
    total:              0,
    open:               0,
    resolved:           0,
    avgResponseHours:   0,
    totalInLastWeek:    0,
    openSinceYesterday: 0,
    resolvedInLastWeek: 0,
  },
  severity:    [],
  issueTypes:  [],
  trend:       [],
  statusSnap:  [],
  workers:     [],
  riskPriority:[],
  riskScoring: [],
};

async function fetchReports(since) {
  const { data, error } = await supabase
    .from("sanitation_reports")
    .select("id, severity, status, issue_type, created_at, updated_at, assigned_to")
    .gte("created_at", since.toISOString());

  if (error) throw error;
  return data ?? [];
}

async function fetchRiskAssessments() {
  const { data, error } = await supabase
    .from("risk_assessments")
    .select(
      "priority_level, risk_score, near_school, near_water_source, flood_zone, drought_zone, repeated_incident, escalation_required, affected_children_count"
    );

  if (error) throw error;
  return data ?? [];
}

async function fetchResolvedReports() {
  const { data, error } = await supabase
    .from("sanitation_reports")
    .select(
      "id, status, updated_at, assigned_to, worker:profiles!sanitation_reports_assigned_to_fkey(id, full_name, role)"
    )
    .in("status", DONE_STATUSES);

  if (error) throw error;
  return data ?? [];
}

const normalizeStatus = (report) =>
  (report.status || "").toLowerCase().trim();

const isDone    = (report) => DONE_STATUSES.includes(normalizeStatus(report));
const isPending = (report) => normalizeStatus(report) === "pending";

const countBy = (arr, key) =>
  arr.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});

const sumStatusKeys = (statusCounts, keys) =>
  keys.reduce((sum, k) => sum + (statusCounts[(k || "").toLowerCase()] || 0), 0);

function buildMetrics(reports, sevenDaysAgo, yesterday) {
  const total    = reports.length;
  const open     = reports.filter(isPending).length;
  const resolved = reports.filter(isDone).length;

  const totalInLastWeek    = reports.filter((r) => new Date(r.created_at) >= sevenDaysAgo).length;
  const openSinceYesterday = reports.filter((r) => isPending(r) && new Date(r.created_at) >= yesterday).length;
  const resolvedInLastWeek = reports.filter((r) => isDone(r)    && new Date(r.created_at) >= sevenDaysAgo).length;

  const responseTimes = reports
    .filter(isDone)
    .map((r) => (new Date(r.updated_at) - new Date(r.created_at)) / 36e5)
    .filter((h) => h > 0);

  const avgResponseHours = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
    : 0;

  return { total, open, resolved, avgResponseHours, totalInLastWeek, openSinceYesterday, resolvedInLastWeek };
}

function buildSeverity(reports) {
  return Object.entries(countBy(reports, "severity")).map(([name, value]) => ({
    name,
    value,
    color: SEVERITY_COLORS[name] ?? "#999",
  }));
}

function buildIssueTypes(reports) {
  return Object.entries(countBy(reports, "issue_type"))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([type, count]) => ({ type, count }));
}

function buildTrend(reports) {
  const dayMap = reports.reduce((acc, r) => {
    const day = formatDate(r.created_at, { day: "2-digit", month: "short" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(dayMap).map(([day, incidents]) => ({ day, incidents }));
}

function buildStatusSnapshot(reports) {
  const statusCounts = countBy(reports, "status");
  return STATUS_CONFIG.map((s) => ({
    ...s,
    count: sumStatusKeys(statusCounts, s.keys),
  }));
}

function buildRiskPriority(riskRows) {
  return PRIORITY_LEVELS
    .map((level) => ({
      name:  level,
      value: riskRows.filter((r) => r.priority_level === level).length,
      color: PRIORITY_COLORS[level],
    }))
    .filter((r) => r.value > 0);
}

function buildRiskScoring(riskRows) {
  const total = riskRows.length || 1;

  return RISK_FACTORS.map(({ key, label, points }) => {
    const count = riskRows.filter((r) => r[key]).length;
    return {
      factor: label,
      points,
      count,
      pct: Math.round((count / total) * 100),
    };
  });
}

function buildWorkers(resolvedReports) {
  const workerMap = resolvedReports.reduce((acc, report) => {
    const w = report.worker;
    if (!w?.id || !w?.full_name) return acc;

    if (!acc[w.id]) {
      acc[w.id] = { id: w.id, name: w.full_name, role: w.role, cases: 0, lastResolved: null };
    }

    acc[w.id].cases        += 1;
    acc[w.id].lastResolved  = report.updated_at;

    return acc;
  }, {});

  return Object.values(workerMap)
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 5)
    .map((w, i) => ({
      id:           w.id,
      name:         w.name,
      role:         w.role ?? "operator",
      initials:     buildInitials(w.name),
      cases:        w.cases,
      lastResolved: w.lastResolved,
      color:        WORKER_COLORS[i],
    }));
}

async function fetchDashboard() {
  const thirtyDaysAgo = daysAgo(30);
  const sevenDaysAgo  = daysAgo(7);
  const yesterday     = daysAgo(1);

  const [reports, riskRows, resolvedReports] = await Promise.all([
    fetchReports(thirtyDaysAgo),
    fetchRiskAssessments(),
    fetchResolvedReports(),
  ]);

  if (reports.length === 0) {
    console.warn("[Dashboard] No reports in the last 30 days — data may be older than the window.");
  }

  return {
    metrics:      buildMetrics(reports, sevenDaysAgo, yesterday),
    severity:     buildSeverity(reports),
    issueTypes:   buildIssueTypes(reports),
    trend:        buildTrend(reports),
    statusSnap:   buildStatusSnapshot(reports),
    riskPriority: buildRiskPriority(riskRows),
    riskScoring:  buildRiskScoring(riskRows),
    workers:      buildWorkers(resolvedReports),
  };
}

export function useDashboardData() {
  const { data = EMPTY_STATE, isLoading: loading } = useQuery({
    queryKey:           QUERY_KEYS.dashboard,
    queryFn:            fetchDashboard,
    staleTime:          60_000,
    gcTime:             5 * 60_000,
    refetchOnWindowFocus: false,
  });

  return { ...data, loading };
}