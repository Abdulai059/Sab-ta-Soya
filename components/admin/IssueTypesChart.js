import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardTitle } from "./DashboardCard";
import { TOOLTIP_STYLE, TYPE_COLORS } from "./constants";

export default function IssueTypesChart({ issueTypes }) {
  return (
    <Card>
      <CardTitle>Incidents by type</CardTitle>
      {issueTypes.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No data yet</p>
      ) : (
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
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {issueTypes.map((_, i) => (
                <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
