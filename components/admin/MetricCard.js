import { Card } from "./DashboardCard";

export default function MetricCard({ icon: Icon, iconBg, iconColor, label, value, delta, deltaUp }) {
  return (
    <Card className="flex flex-col justify-between p-5 min-w-[160px]">

    
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-500 font-medium leading-tight max-w-[70%]">{label}</p>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: iconBg ?? "#f3f4f6" }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor ?? "#6b7280" }} />
        </div>
      </div>

  
      <p className="text-3xl font-semibold text-gray-800 leading-none mb-2">{value}</p>

      {delta && (
        <p className={`text-xs font-medium ${deltaUp ? "text-red-500" : "text-emerald-500"}`}>
          {delta}
        </p>
      )}

    </Card>
  );
}