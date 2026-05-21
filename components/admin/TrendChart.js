import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardTitle } from "./DashboardCard";
import { TOOLTIP_STYLE } from "./constants";

export default function TrendChart({ trend }) {
  return (
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
          <Tooltip contentStyle={TOOLTIP_STYLE} />
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
  );
}
