"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield, Phone, Flag, ChevronRight } from "lucide-react";
import { HEALTH_TIPS } from "@/data/safety-tips";
import { CATEGORIES, CATEGORY_STYLES, EMERGENCY_CONTACTS } from "@/data/safety-tips-config";
import TipCard from "@/components/safety-tips/TipCard";

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
    <div className="min-h-screen max-w-[1200px] mx-auto">

      <div className="border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-10">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isActive ? styles.active : styles.pill + " hover:opacity-80"}`}
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
              <> in <span className="font-semibold text-gray-900">{CATEGORIES.find((c) => c.id === activeCategory)?.label}</span></>
            )}
            {search && <> matching "<span className="font-semibold text-gray-900">{search}</span>"</>}
          </p>
          {criticalCount > 0 && (
            <span className="text-xs text-red-600 font-medium">{criticalCount} critical</span>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((tip) => <TipCard key={tip.id} tip={tip} />)}
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
          <Link href="/reporteissue" className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
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
              <a key={c.number} href={`tel:${c.number}`} className="flex flex-col bg-white rounded-lg border border-red-200 px-4 py-3 hover:bg-red-50 transition-colors">
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
