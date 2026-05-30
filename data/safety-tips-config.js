import {
  Hand, Baby, Skull, Droplets, Home, Users,
  Search, AlertTriangle, AlertCircle, Phone, Flag,
  Shield, Flame, Thermometer, Activity,
  Bug, CloudRain, CloudLightning, Trash2, Heart, Eye,
} from "lucide-react";

export const ICON_MAP = {
  "hand-wash":       Hand,
  "clock":           AlertCircle,
  "leaf":            Activity,
  "steps":           Hand,
  "shield-child":    Shield,
  "eye":             Eye,
  "trash":           Trash2,
  "alert-triangle":  AlertTriangle,
  "home":            Home,
  "droplets":        Droplets,
  "skull":           Skull,
  "thermometer":     Thermometer,
  "alert-circle":    AlertCircle,
  "activity":        Activity,
  "baby":            Baby,
  "shield":          Shield,
  "bug":             Bug,
  "flame":           Flame,
  "container":       Droplets,
  "search":          Search,
  "utensils":        Activity,
  "tool":            Home,
  "heart":           Heart,
  "x-circle":        AlertCircle,
  "trash-2":         Trash2,
  "cloud-rain":      CloudRain,
  "cloud-lightning": CloudLightning,
  "flag":            Flag,
  "phone":           Phone,
};

export const CATEGORIES = [
  { id: "all",                   label: "All Tips",            icon: Shield,   color: "gray"    },
  { id: "hand_hygiene",          label: "Hand Hygiene",        icon: Hand,     color: "blue"    },
  { id: "child_safety",          label: "Child Safety",        icon: Baby,     color: "pink"    },
  { id: "fecal_diseases",        label: "Fecal-Oral Diseases", icon: Skull,    color: "red"     },
  { id: "safe_water",            label: "Safe Water & Food",   icon: Droplets, color: "cyan"    },
  { id: "latrine_safety",        label: "Latrine Safety",      icon: Home,     color: "amber"   },
  { id: "community_environment", label: "Community",           icon: Users,    color: "emerald" },
];

export const CATEGORY_STYLES = {
  gray:    { pill: "bg-gray-100 text-gray-700 border-gray-200",         active: "bg-gray-800 text-white border-gray-800"         },
  blue:    { pill: "bg-blue-50 text-blue-700 border-blue-200",          active: "bg-blue-600 text-white border-blue-600"          },
  pink:    { pill: "bg-pink-50 text-pink-700 border-pink-200",          active: "bg-pink-600 text-white border-pink-600"          },
  red:     { pill: "bg-red-50 text-red-700 border-red-200",             active: "bg-red-600 text-white border-red-600"            },
  cyan:    { pill: "bg-cyan-50 text-cyan-700 border-cyan-200",          active: "bg-cyan-600 text-white border-cyan-600"          },
  amber:   { pill: "bg-amber-50 text-amber-700 border-amber-200",       active: "bg-amber-500 text-white border-amber-500"        },
  emerald: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", active: "bg-emerald-600 text-white border-emerald-600"    },
};

export const SEVERITY = {
  critical:     { label: "Critical",     cls: "bg-red-100 text-red-700 border-red-200",       dot: "bg-red-500"   },
  important:    { label: "Important",    cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  good_to_know: { label: "Good to know", cls: "bg-blue-100 text-blue-700 border-blue-200",    dot: "bg-blue-400"  },
};

export const EMERGENCY_CONTACTS = [
  { label: "Ghana Health Service (Northern)", number: "0302-682-000" },
  { label: "National Ambulance Service",      number: "0302-774-915" },
  { label: "Emergency",                       number: "112"          },
];
