import { Leaf, AlertCircle, Flame, Skull } from "lucide-react";

export const MAX_PHOTOS = 4;

export const ISSUE_TYPES = [
  "Open defecation",
  "Blocked drain",
  "Overflowing latrine",
  "Contaminated water source",
  "Waste dumping",
  "Broken handwashing station",
];

export const SEVERITY_OPTIONS = [
  { value: "low",      label: "Low",      Icon: Leaf,        color: "teal"   },
  { value: "medium",   label: "Medium",   Icon: AlertCircle, color: "amber"  },
  { value: "high",     label: "High",     Icon: Flame,       color: "orange" },
  { value: "critical", label: "Critical", Icon: Skull,       color: "red"    },
];

export const severityStyles = {
  teal:   { active: "border-teal-500 bg-teal-50 text-teal-800"     },
  amber:  { active: "border-amber-500 bg-amber-50 text-amber-800"  },
  orange: { active: "border-orange-500 bg-orange-50 text-orange-800" },
  red:    { active: "border-red-500 bg-red-50 text-red-800"        },
};

export const LOCATION_TYPES = [
  "Public toilet",
  "Market drain",
  "School latrine",
  "Health centre",
  "Community borehole",
  "Open field",
  "Roadside",
  "Other",
];
