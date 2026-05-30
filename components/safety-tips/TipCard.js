"use client";

import { useState } from "react";
import { AlertCircle, ChevronRight } from "lucide-react";
import { ICON_MAP, SEVERITY } from "@/data/safety-tips-config";

export default function TipCard({ tip }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[tip.icon] ?? AlertCircle;
  const sev  = SEVERITY[tip.severity] ?? SEVERITY.good_to_know;

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer ${expanded ? "shadow-md" : ""}`}
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
