import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardTitle } from "./DashboardCard";
import ResolutionGauge from "./ResolutionGauge";
import { TOOLTIP_STYLE } from "./constants";

const PRIORITY_ORDER = ["critical", "high", "medium", "low"];

const PRIORITY_LABEL = {
  critical: "Critical",
  high:     "High",
  medium:   "Medium",
  low:      "Low",
};

export default function RiskAssessmentChart({ riskPriority, resolved, total }) {
  // Ensure consistent order
  const ordered = PRIORITY_ORDER
    .map((lvl) => riskPriority.find((r) => r.name === lvl))
    .filter(Boolean);

  const riskTotal = ordered.reduce((s, r) => s + r.value, 0);

  return (
    <Card>
      <CardTitle>Risk assessment breakdown</CardTitle>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          {riskTotal === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No risk data yet</p>
          ) : (
            <>
              <div className="relative w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordered}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      strokeWidth={0}
                      paddingAngle={3}
                    >
                      {ordered.map((r, i) => (
                        <Cell key={i} fill={r.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v, n) => [v, PRIORITY_LABEL[n] ?? n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-gray-800">{riskTotal}</p>
                  <p className="text-xs text-gray-400">assessed</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3">
                {ordered.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center gap-1.5 text-xs text-gray-600 capitalize"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: r.color }}
                    />
                    {PRIORITY_LABEL[r.name]}
                    <span className="font-semibold text-gray-800">{r.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden lg:block w-px bg-gray-100 self-stretch my-2" />

        <div className="w-full lg:w-52 flex items-center justify-center">
          <ResolutionGauge resolved={resolved} total={total} />
        </div>
      </div>
    </Card>
  );
}
