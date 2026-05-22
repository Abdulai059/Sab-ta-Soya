import { Card } from "./DashboardCard";

export default function MetricCard({ icon: Icon, label, value, delta, deltaUp }) {
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
