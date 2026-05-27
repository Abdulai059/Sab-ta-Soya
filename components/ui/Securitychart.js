"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CardTitle } from "../admin/DashboardCard";

const GRADE_SCALE = [
  { label: "C",  color: "#b91c1c", range: [0,  60]  },
  // { label: "H",  color: "#dc2626", range: [60, 70]  },
  { label: "H",  color: "#f97316", range: [70, 75]  },
  { label: "M",  color: "#eab308", range: [75, 80]  },
  { label: "L",  color: "#22c55e", range: [80, 90]  },
  { label: "A+", color: "#3b82f6", range: [90, 100] },

];

function getGradeForPct(pct) {
  for (const g of GRADE_SCALE) {
    if (pct >= g.range[0] && pct < g.range[1]) return g;
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

function ScoreBar({ scorePct, assessmentAvgPct }) {
  const currentGrade = getGradeForPct(scorePct);

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-1.5">
        {GRADE_SCALE.map((g) => {
          const width = ((g.range[1] - g.range[0]) / 100) * 100;
          const isActive = g.label === currentGrade.label;
          return (
            <div key={g.label} style={{ width: `${width}%` }} className="flex justify-center">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded"
                style={{
                  color:      isActive ? "#fff" : g.color,
                  background: isActive ? g.color : "transparent",
                  border:     `1px solid ${g.color}`,
                }}
              >
                {g.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative h-3 overflow-visible flex gap-1">
        {GRADE_SCALE.map((g) => {
          const width = ((g.range[1] - g.range[0]) / 100) * 100;
          return (
            <div
              key={g.label}
              className="h-full rounded-full"
              style={{ width: `${width}%`, background: g.color, opacity: 0.85 }}
            />
          );
        })}

        {/* Your score marker */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${scorePct}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-0.5 h-3 bg-gray-800" />
          <div
            className="mt-1 text-[9px] font-bold text-gray-700 whitespace-nowrap text-center leading-tight"
            style={{ marginTop: 4 }}
          >
            RESOLUTION RATE
          </div>
        </div>

        {/* Assessment avg marker */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${assessmentAvgPct}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-0.5 h-3 border-l border-dashed border-gray-500" />
          <div
            className="text-[9px] text-gray-400 whitespace-nowrap text-center leading-tight"
            style={{ marginTop: 4 }}
          >
            ASSESSMENT AVG
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-1">
        {[0, 60, 70, 80, 90, 100].map((v) => (
          <span key={v} className="text-[10px] text-gray-400">{v}%</span>
        ))}
      </div>
    </div>
  );
}

function DonutCenter({ value, label, delta, deltaUp }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {label && <span className="text-[11px] text-gray-400">{label}</span>}
      {delta && (
        <span
          className="text-[11px] font-semibold flex items-center gap-0.5 mt-0.5"
          style={{ color: deltaUp ? "#ef4444" : "#22c55e" }}
        >
          {deltaUp ? "▼" : "▲"} {delta}
        </span>
      )}
    </div>
  );
}

const PAGE_SIZE = 5;

export default function SecurityDashboard({
  scorePct = 0,
  assessmentAvgPct = 0,
  weekDelta = 0,
  openCritical = 0,
  assetData = [],
  totalReports = 0,
  weeklyPct = 0,
  sprsData = [],
  openCount = 0,
}) {
  const currentGrade = getGradeForPct(scorePct);
  const weekLabel = weekDelta > 0 ? `▲ +${weekDelta} this week` : "No new this week";

  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(assetData.length / PAGE_SIZE);
  const pageData = assetData.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pageTotal = pageData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className=" font-['DM_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <div className="max-w-full mx-auto flex flex-col gap-4">

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
           <CardTitle>Sanitation Health Score</CardTitle>

          <p className="text-xs text-gray-400 mb-5">
            Overall resolution rate — percentage of reported sanitation incidents that have been resolved
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex items-center gap-4 shrink-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                style={{ background: currentGrade.color }}
              >
                {currentGrade.label}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">{scorePct}%</span>
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {weekLabel}
                  </span>
                </div>
                <div className="text-sm font-semibold text-amber-500">
                  {scorePct >= 80 ? "Good" : scorePct >= 70 ? "Adequate" : scorePct >= 60 ? "Needs Attention" : "Critical"}
                </div>
                <div className="text-xs text-gray-400">{openCritical} open critical incidents</div>
              </div>
            </div>

            <div className="flex-1 w-full pt-1">
              <ScoreBar scorePct={scorePct} assessmentAvgPct={assessmentAvgPct} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                   <CardTitle>Reports by Issue Type</CardTitle> 
                <p className="text-xs text-gray-400">
                  Distribution of reported sanitation incidents by category this month
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <span className="text-[10px] text-gray-400">{page + 1} / {totalPages || 1}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              {pageData.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{d.name}</span>
                  <span className="text-[10px] font-semibold text-gray-700">{d.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center mt-2">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {pageData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter
                  value={pageTotal}
                  label="reports"
                  delta={page === 0 ? `${weeklyPct}%` : null}
                  deltaUp={true}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="mb-1">
               <CardTitle>Response Status Breakdown</CardTitle> 
              <p className="text-xs text-gray-400">
                Where every reported incident currently stands in the resolution pipeline
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap mt-2 mb-2">
              {sprsData.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    {d.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center mt-2">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sprsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {sprsData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter
                  value={openCount}
                  label={`${totalReports} total`}
                  delta={null}
                  deltaUp={false}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
