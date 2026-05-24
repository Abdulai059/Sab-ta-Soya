import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Card, CardTitle } from "./DashboardCard";
import { TOOLTIP_STYLE } from "./constants";

// Each bar gets a distinct colour from this palette
const BAR_COLORS = [
  "#E24B4A", // near school   → red-ish (high impact)
  "#378ADD", // near water    → blue
  "#7F77DD", // flood zone    → purple
  "#EF9F27", // drought zone  → amber
  "#1D9E75", // repeated      → green
  "#D4537E", // escalation    → pink
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: "8px 12px", minWidth: 180 }}>
      <p className="text-xs font-semibold text-gray-700 mb-1">{d.factor}</p>
      <p className="text-xs text-gray-500">
        Affected reports: <span className="font-bold text-gray-800">{d.count}</span>
      </p>
      <p className="text-xs text-gray-500">
        % of assessed: <span className="font-bold text-gray-800">{d.pct}%</span>
      </p>
      {d.points > 0 && (
        <p className="text-xs text-gray-500">
          Score contribution: <span className="font-bold text-gray-800">+{d.points} pts</span>
        </p>
      )}
    </div>
  );
};

export default function RiskScoringChart({ riskScoring }) {
  const hasData = riskScoring.some((r) => r.count > 0);

  return (
    <Card>
      <CardTitle>Risk score factor breakdown</CardTitle>
      <p className="text-xs text-gray-400 mb-4 -mt-1">
        How many assessed reports triggered each scoring factor (last 30 days)
      </p>

      {!hasData ? (
        <p className="text-sm text-gray-400 py-6 text-center">No risk data yet</p>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={Math.max(220, riskScoring.length * 44 + 40)}
        >
          <BarChart
            data={riskScoring}
            layout="vertical"
            margin={{ left: 0, right: 40, top: 4, bottom: 4 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              domain={[0, "dataMax"]}
            />
            <YAxis
              type="category"
              dataKey="factor"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {riskScoring.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
              <LabelList
                dataKey="pct"
                position="right"
                formatter={(v) => `${v}%`}
                style={{ fontSize: 10, fill: "#9CA3AF" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Score legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
        {riskScoring.filter((r) => r.points > 0).map((r, i) => (
          <div key={r.factor} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
            />
            <span className="text-[10px] text-gray-500 leading-tight">
              {r.factor}
              <span className="font-semibold text-gray-700 ml-1">+{r.points}pts</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
