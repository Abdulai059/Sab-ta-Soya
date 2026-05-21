"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabase";

const SEVERITY_COLORS = {
  critical: "#E24B4A",
  high: "#EF9F27",
  medium: "#378ADD",
  low: "#1D9E75",
};

const WORKER_COLORS = ["#1D9E75", "#378ADD", "#7F77DD", "#EF9F27", "#D4537E"];

const TYPE_COLORS = [
  "#1D9E75",
  "#378ADD",
  "#EF9F27",
  "#E24B4A",
  "#7F77DD",
  "#D4537E",
];

const SEVERITY_TO_MM = { critical: 48, high: 30, medium: 15, low: 5 };

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

function useDashboardData() {
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    avgResponseHours: 0,
  });
  const [severity, setSeverity] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [trend, setTrend] = useState([]);
  const [statusSnap, setStatusSnap] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch reports with their assignments to get resolved_at
        const { data: reports } = await supabase
          .from("sanitation_reports")
          .select(
            "id, severity, status, issue_type, created_at, report_assignments(resolved_at)",
          )
          .gte("created_at", thirtyDaysAgo.toISOString());

        if (!reports) return;

        const total = reports.length;
        const open = reports.filter(
          (r) => r.status !== "resolved" && r.status !== "completed",
        ).length;
        const resolved = reports.filter(
          (r) => r.status === "resolved" || r.status === "completed",
        ).length;

        // Calculate response times using assignment resolved_at
        const responseTimes = reports
          .filter((r) => r.report_assignments?.[0]?.resolved_at && r.created_at)
          .map(
            (r) =>
              (new Date(r.report_assignments[0].resolved_at) -
                new Date(r.created_at)) /
              (1000 * 60 * 60),
          );

        const avgResponseHours = responseTimes.length
          ? parseFloat(
              (
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
              ).toFixed(1),
            )
          : 0;

        setMetrics({ total, open, resolved, avgResponseHours });

        const severityCounts = {};
        reports.forEach((r) => {
          severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
        });
        setSeverity(
          Object.entries(severityCounts).map(([name, value]) => ({
            name,
            value,
            color: SEVERITY_COLORS[name] ?? "#888",
          })),
        );

        const typeCounts = {};
        reports.forEach((r) => {
          typeCounts[r.issue_type] = (typeCounts[r.issue_type] || 0) + 1;
        });
        setIssueTypes(
          Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([type, count]) => ({ type, count })),
        );

        const dayMap = {};
        reports.forEach((r) => {
          const day = new Date(r.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          });
          dayMap[day] = (dayMap[day] || 0) + 1;
        });

        const { data: climateEvents } = await supabase
          .from("climate_events")
          .select("start_date, severity")
          .gte("start_date", thirtyDaysAgo.toISOString());

        const rainfallMap = {};
        climateEvents?.forEach((e) => {
          const day = new Date(e.start_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          });
          rainfallMap[day] =
            (rainfallMap[day] || 0) + (SEVERITY_TO_MM[e.severity] ?? 8);
        });

        setTrend(
          Object.keys(dayMap)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((day) => ({
              day,
              incidents: dayMap[day],
              rainfall: rainfallMap[day] ?? 0,
            })),
        );

        const statusCounts = {};
        reports.forEach((r) => {
          statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
        });

        const bySeverity = {};
        reports.forEach((r) => {
          bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
        });

        setStatusSnap([
          {
            label: "Pending",
            count:
              (statusCounts["pending"] ?? 0) + (statusCounts["Pending"] ?? 0),
            color: "#7F77DD",
            textColor: "#3730A3",
            bg: "#EEF2FF",
          },
          {
            label: "Assigned",
            count: statusCounts["assigned"] ?? 0,
            color: "#378ADD",
            textColor: "#1E40AF",
            bg: "#EFF6FF",
          },
          {
            label: "Completed",
            count: statusCounts["completed"] ?? 0,
            color: "#1D9E75",
            textColor: "#065F46",
            bg: "#ECFDF5",
          },
          {
            label: "Resolved",
            count: statusCounts["resolved"] ?? 0,
            color: "#1D9E75",
            textColor: "#065F46",
            bg: "#ECFDF5",
          },
          {
            label: "Cancelled",
            count: statusCounts["cancelled"] ?? 0,
            color: "#9CA3AF",
            textColor: "#4B5563",
            bg: "#F3F4F6",
          },
          {
            label: "Critical",
            count: bySeverity["critical"] ?? 0,
            color: "#E24B4A",
            textColor: "#791F1F",
            bg: "#FEF2F2",
          },
          {
            label: "High",
            count: bySeverity["high"] ?? 0,
            color: "#EF9F27",
            textColor: "#92400E",
            bg: "#FFFBEB",
          },
          {
            label: "Medium",
            count: bySeverity["medium"] ?? 0,
            color: "#378ADD",
            textColor: "#1E40AF",
            bg: "#EFF6FF",
          },
          {
            label: "Low",
            count: bySeverity["low"] ?? 0,
            color: "#1D9E75",
            textColor: "#065F46",
            bg: "#ECFDF5",
          },
        ]);

        const { data: assignments } = await supabase
          .from("report_assignments")
          .select("assigned_to, resolved_at, profiles:assigned_to(full_name)")
          .not("resolved_at", "is", null);

        const workerMap = {};
        assignments?.forEach((a) => {
          const id = a.assigned_to;
          const name = a.profiles?.full_name ?? "Unknown";
          if (!workerMap[id]) workerMap[id] = { name, cases: 0 };
          workerMap[id].cases += 1;
        });

        setWorkers(
          Object.values(workerMap)
            .sort((a, b) => b.cases - a.cases)
            .slice(0, 5)
            .map((w, i) => ({
              name: w.name,
              initials: w.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              cases: w.cases,
              color: WORKER_COLORS[i],
            })),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { metrics, severity, issueTypes, trend, statusSnap, workers, loading };
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
      {children}
    </p>
  );
}

function MetricCard({ icon: Icon, label, value, delta, deltaUp }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6 text-gray-600" />
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            deltaUp
              ? "bg-red-50 text-red-500"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {delta}
        </span>
      </div>
      <p className="text-3xl font-semibold text-gray-800 leading-none mb-1">
        {value}
      </p>
      <p className="text-xs text-gray-400">{label}</p>
    </Card>
  );
}

function ResolutionGauge({ resolved, total }) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const data = [{ value: pct }, { value: 100 - pct }];
  return (
    <div className="flex flex-col items-center pt-2 pb-1">
      <div className="relative w-36 h-20">
        <ResponsiveContainer width="100%" height={90}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={48}
              outerRadius={62}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#1D9E75" />
              <Cell fill="#F3F4F6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <p className="text-2xl font-semibold text-gray-800">{pct}%</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">resolution rate</p>
    </div>
  );
}

function WorkerRow({ worker, max }) {
  const pct = Math.round((worker.cases / max) * 100);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
        style={{ background: worker.color + "18", color: worker.color }}
      >
        {worker.initials}
      </div>
      <span className="text-sm text-gray-700 flex-1 font-medium">
        {worker.name}
      </span>
      <span className="text-xs text-gray-400 mr-3 tabular-nums">
        {worker.cases} resolved
      </span>
      <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: worker.color }}
        />
      </div>
    </div>
  );
}

export default function AuthorityDashboard() {
  const { metrics, severity, issueTypes, trend, statusSnap, workers, loading } =
    useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 mt-15">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h1 className="text-lg font-semibold text-gray-800">Sab'ta Soya</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium">
              Authority
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5 ml-7">
            Northern Ghana sanitation intelligence
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={ClipboardList}
          label="Total reports"
          value={metrics.total}
          delta="+14 this week"
          deltaUp
        />
        <MetricCard
          icon={AlertTriangle}
          label="Open incidents"
          value={metrics.open}
          delta="+6 since yesterday"
          deltaUp
        />
        <MetricCard
          icon={CheckCircle}
          label="Resolved"
          value={metrics.resolved}
          delta="+11 this week"
        />
        <MetricCard
          icon={Clock}
          label="Avg response"
          value={`${metrics.avgResponseHours}h`}
          delta="↓ improving"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Incidents — last 30 days</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#E24B4A"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#E24B4A", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Severity breakdown</CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
            {severity.map((s) => (
              <span
                key={s.name}
                className="flex items-center gap-1.5 text-xs text-gray-500 capitalize"
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ background: s.color }}
                />
                {s.name}{" "}
                <span className="font-medium text-gray-700">{s.value}</span>
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={severity}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
                paddingAngle={2}
              >
                {severity.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Incidents by type</CardTitle>
          <ResponsiveContainer
            width="100%"
            height={Math.max(200, issueTypes.length * 42 + 40)}
          >
            <BarChart data={issueTypes} layout="vertical">
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                width={135}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {issueTypes.map((_, i) => (
                  <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Status snapshot</CardTitle>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {statusSnap.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3"
                style={{ background: s.bg }}
              >
                <p className="text-xs font-medium" style={{ color: s.color }}>
                  {s.label}
                </p>
                <p
                  className="text-2xl font-semibold mt-1"
                  style={{ color: s.textColor }}
                >
                  {s.count}
                </p>
              </div>
            ))}
          </div>
          <ResolutionGauge resolved={metrics.resolved} total={metrics.total} />
        </Card>
      </div>

      <Card>
        <CardTitle>Worker performance — resolved cases</CardTitle>
        {workers.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No assignment data yet
          </p>
        ) : (
          workers.map((w, i) => (
            <WorkerRow key={i} worker={w} max={workers[0].cases} />
          ))
        )}
      </Card>

      <Card>
        <CardTitle>Incidents vs rainfall — climate correlation</CardTitle>
        <div className="flex gap-5 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#E24B4A" }}
            />
            Incidents
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#378ADD", opacity: 0.5 }}
            />
            Rainfall (mm)
          </span>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <ComposedChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              width={36}
              label={{
                value: "mm",
                angle: -90,
                position: "insideRight",
                style: { fontSize: 10, fill: "#9CA3AF" },
              }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              yAxisId="right"
              dataKey="rainfall"
              fill="#378ADD"
              opacity={0.2}
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="left"
              dataKey="incidents"
              type="monotone"
              stroke="#E24B4A"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#E24B4A", strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <p className="text-center text-xs text-gray-300 pb-4">
        Sab'ta Soya · UNICEF StartUp Lab 2026 · Northern Ghana
      </p>
    </div>
  );
}
