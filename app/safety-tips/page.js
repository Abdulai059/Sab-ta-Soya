"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Hand, Baby, Skull, Droplets, Home, Users, Search,
  AlertTriangle, AlertCircle, Info, Phone, Flag,
  ChevronRight, Shield, Flame, Thermometer, Activity,
  Bug, CloudRain, CloudLightning, Trash2, Heart, Eye,
} from "lucide-react";
import { HEALTH_TIPS } from "@/data/safety-tips";

const ICON_MAP = {
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

const CATEGORIES = [
  { id: "all",                   label: "All Tips",            icon: Shield,   color: "gray"    },
  { id: "hand_hygiene",          label: "Hand Hygiene",        icon: Hand,     color: "blue"    },
  { id: "child_safety",          label: "Child Safety",        icon: Baby,     color: "pink"    },
  { id: "fecal_diseases",        label: "Fecal-Oral Diseases", icon: Skull,    color: "red"     },
  { id: "safe_water",            label: "Safe Water & Food",   icon: Droplets, color: "cyan"    },
  { id: "latrine_safety",        label: "Latrine Safety",      icon: Home,     color: "amber"   },
  { id: "community_environment", label: "Community",           icon: Users,    color: "emerald" },
];

const CATEGORY_STYLES = {
  gray:    { pill: "bg-gray-100 text-gray-700 border-gray-200",         active: "bg-gray-800 text-white border-gray-800"         },
  blue:    { pill: "bg-blue-50 text-blue-700 border-blue-200",          active: "bg-blue-600 text-white border-blue-600"          },
  pink:    { pill: "bg-pink-50 text-pink-700 border-pink-200",          active: "bg-pink-600 text-white border-pink-600"          },
  red:     { pill: "bg-red-50 text-red-700 border-red-200",             active: "bg-red-600 text-white border-red-600"            },
  cyan:    { pill: "bg-cyan-50 text-cyan-700 border-cyan-200",          active: "bg-cyan-600 text-white border-cyan-600"          },
  amber:   { pill: "bg-amber-50 text-amber-700 border-amber-200",       active: "bg-amber-500 text-white border-amber-500"        },
  emerald: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", active: "bg-emerald-600 text-white border-emerald-600"    },
};

const SEVERITY = {
  critical:     { label: "Critical",      cls: "bg-red-100 text-red-700 border-red-200",       dot: "bg-red-500"   },
  important:    { label: "Important",     cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  good_to_know: { label: "Good to know",  cls: "bg-blue-100 text-blue-700 border-blue-200",    dot: "bg-blue-400"  },
};

const EMERGENCY_CONTACTS = [
  { label: "Ghana Health Service (Northern)", number: "0302-682-000" },
  { label: "National Ambulance Service",      number: "0302-774-915" },
  { label: "Emergency",                       number: "112"          },
];

function TipCard({ tip }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[tip.icon] ?? AlertCircle;
  const sev = SEVERITY[tip.severity] ?? SEVERITY.good_to_know;

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer ${
        expanded ? "shadow-md" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{tip.title}</h3>
            <span className={`shrink-0 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${sev.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
              {sev.label}
            </span>
          </div>

          <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {tip.body}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1">
              {tip.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              {expanded ? "Show less" : "Read more"}
              <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SafetyTipsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = HEALTH_TIPS.filter((tip) => {
    const matchCat = activeCategory === "all" || tip.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      tip.title.toLowerCase().includes(q) ||
      tip.body.toLowerCase().includes(q) ||
      tip.tags.some((t) => t.includes(q));
    return matchCat && matchSearch;
  });

  const criticalCount = filtered.filter((t) => t.severity === "critical").length;

  return (
    <div className="min-h-screen max-w-[1200px] mx-auto ">

      <div className="border-b border-gray-200">
        <div className=" px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Safety Tips</h1>
              <p className="text-gray-500 mt-1 text-sm max-w-xl">
                Sanitation and hygiene guidance for communities in Northern Ghana.
                Protecting families from fecal-oral diseases, one habit at a time.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {HEALTH_TIPS.filter((t) => t.severity === "critical").length} critical tips
                </span>
                <span className="text-xs text-gray-400">
                  {HEALTH_TIPS.length} total tips across 6 categories
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tips by keyword, disease, or topic…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const styles = CATEGORY_STYLES[cat.color];
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive ? styles.active : styles.pill + " hover:opacity-80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> tips
            {activeCategory !== "all" && (
              <> in <span className="font-semibold text-gray-900">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </span></>
            )}
            {search && (
              <> matching "<span className="font-semibold text-gray-900">{search}</span>"</>
            )}
          </p>
          {criticalCount > 0 && (
            <span className="text-xs text-red-600 font-medium">{criticalCount} critical</span>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No tips found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different keyword or category</p>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Flag className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Spotted a sanitation hazard?</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Report open defecation, blocked drains, overflowing latrines, or contaminated water sources.
              </p>
            </div>
          </div>
          <Link
            href="/reporteissue"
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Report an issue
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-semibold text-red-900">Emergency Contacts — Northern Ghana</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EMERGENCY_CONTACTS.map((c) => (
              <a
                key={c.number}
                href={`tel:${c.number}`}
                className="flex flex-col bg-white rounded-lg border border-red-200 px-4 py-3 hover:bg-red-50 transition-colors"
              >
                <span className="text-[11px] text-red-500 font-medium">{c.label}</span>
                <span className="text-lg font-bold text-red-700 font-mono mt-0.5">{c.number}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}