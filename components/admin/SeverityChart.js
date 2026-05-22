import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardTitle } from "./DashboardCard";
import ResolutionGauge from "./ResolutionGauge";
import { TOOLTIP_STYLE } from "./constants";

export default function SeverityChart({ severity, resolved, total }) {
  return (
    <Card>
      <CardTitle>Severity breakdown</CardTitle>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          <div className="relative w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={3}
                >
                  {severity.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v, n) => [v, n]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-gray-800">
                {severity.reduce((s, r) => s + r.value, 0)}
              </p>
              <p className="text-xs text-gray-400">total</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3">
            {severity.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-1.5 text-xs text-gray-600 capitalize"
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: s.color }}
                />
                {s.name}
                <span className="font-semibold text-gray-800">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block w-px bg-gray-100 self-stretch my-2" />
        <div className="w-full lg:w-52 flex items-center justify-center">
          <ResolutionGauge resolved={resolved} total={total} />
        </div>
      </div>
    </Card>
  );
}
