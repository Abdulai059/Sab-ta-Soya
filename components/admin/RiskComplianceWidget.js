"use client";

import { useState } from "react";

function DonutChart({ segments }) {
  const r = 60, cx = 80, cy = 80, stroke = 28;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((s) => {
    const dash  = (s.value / 100) * circumference;
    const gap   = circumference - dash;
    const slice = { ...s, dash, gap, offset };
    offset += dash;
    return slice;
  });

  const donutTotal = segments.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111">100%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#888">overall</text>
    </svg>
  );
}

function GaugeChart({ compliant, pending, nonCompliant, centerPct, centerLabel }) {
  const r = 68, cx = 90, cy = 90;
  const halfC  = Math.PI * r;
  const total3 = (compliant + pending + nonCompliant) || 1;
  const segments = [
    { value: compliant,    color: "#22c55e" },
    { value: pending,      color: "#f59e0b" },
    { value: nonCompliant, color: "#ef4444" },
  ];
  let offset = 0;
  const slices = segments.map((s) => {
    const dash = (s.value / total3) * halfC;
    const gap  = halfC * 2;
    const sl   = { ...s, dash, gap, offset };
    offset += dash;
    return sl;
  });

  return (
    <svg width={180} height={110} viewBox="0 0 180 110">
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#f1f1f1" strokeWidth="18"
      />
      {slices.map((s, i) => (
        <path
          key={i}
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={s.color}
          strokeWidth="18"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
        />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="800" fill="#111">{centerPct}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#888">{centerLabel}</text>
    </svg>
  );
}

function LevelBadge({ level }) {
  const colors = { high: "bg-red-500", medium: "bg-amber-400", low: "bg-green-500" };
  return (
    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${colors[level] ?? "bg-gray-400"}`}>
      {level}
    </span>
  );
}

const GAUGE_FILTERS = [
  { key: "compliant",    label: "Verified",  color: "text-green-500" },
  { key: "pending",      label: "Resolved",  color: "text-amber-400" },
  { key: "nonCompliant", label: "Cancelled", color: "text-red-500"   },
];

export default function RiskComplianceWidget({ data = {} }) {
  const { date = "", donut = [], gauge = {}, alerts = [] } = data;
  const donutTotal = donut.reduce((s, d) => s + d.value, 0) || 1;

  const [gaugeFilter, setGaugeFilter] = useState("compliant");

  const gaugeTotal = (gauge.compliant ?? 0) + (gauge.pending ?? 0) + (gauge.nonCompliant ?? 0) || 1;
  const pct = (n) => Math.round(((n ?? 0) / gaugeTotal) * 100) + "%";

  const activeFilter = GAUGE_FILTERS.find((f) => f.key === gaugeFilter);
  const centerPct    = pct(gauge[gaugeFilter] ?? 0);
  const centerLabel  = activeFilter?.label ?? "";

  return (
    <div className="flex gap-4 p-0 bg-[#f4f5f7] min-h-screen font-['DM_Sans',sans-serif] items-start">

      <div className="bg-white rounded-2xl p-5 shadow-sm flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Risk assessment breakdown</h2>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {date}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <DonutChart segments={donut} />
            {donut.slice(0, 3).map((d, i) => {
              const pctLabel = Math.round((d.value / donutTotal) * 100) + "%";
              const pos = [
                "absolute top-[22px] left-[5px]",
                "absolute top-[22px] right-[2px]",
                "absolute bottom-[22px] left-[2px]",
              ][i];
              return (
                <span key={i} className={`${pos} text-[10px] font-semibold text-gray-500`}>
                  {pctLabel}
                </span>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            {donut.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm flex-1 min-w-[220px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">resolution rate</h2>
          <div className="flex gap-1">
            {GAUGE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setGaugeFilter(f.key)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                  gaugeFilter === f.key
                    ? "bg-gray-100 border-gray-300 text-gray-700"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <GaugeChart
            compliant={gauge.compliant ?? 0}
            pending={gauge.pending ?? 0}
            nonCompliant={gauge.nonCompliant ?? 0}
            centerPct={centerPct}
            centerLabel={centerLabel}
          />
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-2xl font-bold text-green-500">{gauge.compliant}</div>
              <div className="text-xs text-gray-400">Verified · {pct(gauge.compliant)}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{gauge.pending}</div>
              <div className="text-xs text-gray-400">Resolved · {pct(gauge.pending)}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{gauge.nonCompliant}</div>
              <div className="text-xs text-gray-400">Cancelled · {pct(gauge.nonCompliant)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm w-[240px] shrink-0">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Alerts</h2>
        <div className="flex flex-col gap-4">
          {alerts.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No recent reports</p>
          ) : alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className="mt-0.5 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                {a.icon === "clock" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-800 truncate">{a.company}</span>
                  <LevelBadge level={a.level} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{a.note}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-5 flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
          View All Alerts
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>

    </div>
  );
}
