import { BarChart2, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";

export default function StatsCard({ value, label, color = "gray", icon: Icon }) {
  const colorClasses = {
    gray: "text-gray-900",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };

  const dotColors = {
    gray: "bg-gray-400",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  const iconBgColors = {
    gray: "bg-gray-100 text-gray-500",
    orange: "bg-orange-100 text-orange-500",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-500",
    purple: "bg-purple-100 text-purple-600",
  };

  const defaultIcons = {
    gray: BarChart2,
    orange: Clock,
    yellow: Clock,
    blue: Zap,
    emerald: CheckCircle,
    red: AlertTriangle,
    purple: Zap,
  };

  const DisplayIcon = Icon || defaultIcons[color];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className={`text-3xl font-semibold ${colorClasses[color]}`}>
          {value}
        </div>
        <div className={`p-2 rounded-lg ${iconBgColors[color]}`}>
          <DisplayIcon size={18} />
        </div>
      </div>
      <div className="text-gray-600 text-sm flex items-center gap-2">
        {label}
      </div>
    </div>
  );
}