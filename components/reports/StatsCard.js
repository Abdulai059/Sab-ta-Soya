import { BarChart2, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";

export default function StatsCard({ value, label, color = "gray", icon: Icon }) {

  const colorMap = {
    gray:    { text: "text-gray-900",    iconBg: "bg-gray-100",    iconText: "text-gray-500",    dot: "bg-gray-400"    },
    orange:  { text: "text-orange-600",  iconBg: "bg-orange-100",  iconText: "text-orange-500",  dot: "bg-orange-500"  },
    yellow:  { text: "text-yellow-600",  iconBg: "bg-yellow-100",  iconText: "text-yellow-600",  dot: "bg-yellow-500"  },
    blue:    { text: "text-blue-600",    iconBg: "bg-blue-100",    iconText: "text-blue-600",    dot: "bg-blue-500"    },
    emerald: { text: "text-emerald-600", iconBg: "bg-emerald-100", iconText: "text-emerald-600", dot: "bg-emerald-500" },
    red:     { text: "text-red-600",     iconBg: "bg-red-100",     iconText: "text-red-500",     dot: "bg-red-500"     },
    purple:  { text: "text-purple-600",  iconBg: "bg-purple-100",  iconText: "text-purple-600",  dot: "bg-purple-500"  },
  };

  const defaultIcons = {
    gray: BarChart2, orange: Clock, yellow: Clock,
    blue: Zap, emerald: CheckCircle, red: AlertTriangle, purple: Zap,
  };
  

  const { text, iconBg, iconText, dot } = colorMap[color] ?? colorMap.gray;
  const DisplayIcon = Icon ?? defaultIcons[color];

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">

      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-500 font-medium leading-tight max-w-[70%]">{label}</p>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconText}`}>
          <DisplayIcon size={18} />
        </div>
      </div>

      <p className={`text-3xl font-semibold leading-none mb-2 ${text}`}>{value}</p>

    </div>
  );
}