export const SEVERITY_COLORS = {
  critical: "#E24B4A",
  high: "#EF9F27",
  medium: "#378ADD",
  low: "#1D9E75",
};

export const WORKER_COLORS = ["#1D9E75", "#378ADD", "#7F77DD", "#EF9F27", "#D4537E"];

export const TYPE_COLORS = [
  "#1D9E75",
  "#378ADD",
  "#7F77DD",
  "#EF9F27",
  "#D4537E",
  "#64748B",
];

export const STATUS_CONFIG = [
  {
    label: "Pending",
    keys: ["pending"],
    color: "#D97706",
    bg: "#FEF3C7",
    textColor: "#92400E",
    icon: "⏳",
  },
  {
    label: "Assigned",
    keys: ["assigned"],
    color: "#3B82F6",
    bg: "#EFF6FF",
    textColor: "#1E40AF",
    icon: "📋",
  },
  {
    label: "In Progress",
    keys: ["in progress", "in_progress"],
    color: "#8B5CF6",
    bg: "#F5F3FF",
    textColor: "#5B21B6",
    icon: "🔧",
  },
  {
    label: "Resolved",
    keys: ["resolved", "completed"],
    color: "#22C55E",
    bg: "#F0FDF4",
    textColor: "#15803D",
    icon: "✅",
  },
];

export const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};
