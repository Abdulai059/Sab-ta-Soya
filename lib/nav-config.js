import {
  Map,
  Bell,
  ClipboardList,
  School,
  BarChart3,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    id: "map",
    label: "Risk Map",
    icon: Map,
    href: null,
  },
  {
    id: "alerts",
    label: "Emergency Alerts",
    icon: Bell,
    href: "/alerts",
  },
  {
    id: "report",
    label: "Report Incident",
    icon: ClipboardList,
    href: "/report",
  },
  {
    id: "schools",
    label: "School Safety",
    icon: School,
    href: "/schools",
  },
  {
    id: "insights",
    label: "Insights",
    icon: BarChart3,
    href: "/insights",
  },
  {
    id: "admin",
    label: "Admin",
    icon: Settings,
    href: "/admin",
  },
];

export const ROLE_COLORS = {
  admin: "bg-violet-100 text-violet-700",
  operator: "bg-emerald-100 text-emerald-700",
  district_officer: "bg-sky-100 text-sky-700",
  ngo: "bg-amber-100 text-amber-700",
};
