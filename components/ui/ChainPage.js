"use client";

import { useState } from "react";
import Image from "next/image";

const stages = [
  {
    id: 0,
    label: "Containment",
    sub: "Household level",
    image: "/images_toilet/toilet_1.png",
    color: "#dff0c8",
    accent: "#3b6d11",
    techs: ["Pit latrine", "Septic tank", "Holding tank", "Arborloos", "Pour-flush latrine"],
    actors: "Households, communities",
    desc: "Waste is captured and stored safely at the point of generation. Containment quality determines household health risk and the complexity of downstream management.",
  },
  {
    id: 1,
    label: "Emptying",
    sub: "Community level",
    image: "/images_toilet/toilet_3.png",
    color: "#cef0e0",
    accent: "#0d5c47",
    techs: ["Vacuum trucks", "Gulper pump", "Manual emptying", "Rodi pump", "Small-scale operators"],
    actors: "FSM operators, private sector",
    desc: "Accumulated faecal sludge or septage is removed from the containment structure on a scheduled or demand-driven basis.",
  },
  {
    id: 2,
    label: "Transport",
    sub: "City / utility level",
    image: "/images_toilet/toilet_5.png",
    color: "#e8e6fd",
    accent: "#534ab7",
    techs: ["Tanker trucks", "Sewer network", "Drain channels", "Motorised tricycles"],
    actors: "Utilities, government, operators",
    desc: "Waste moves from the collection point to a treatment facility. Informal dumping at this stage is a major public health risk in low-income settings.",
  },
  {
    id: 3,
    label: "Treatment",
    sub: "Regional level",
    image: "/images_toilet/toilet_7.png",
    color: "#d9d6fb",
    accent: "#3c3489",
    techs: ["Stabilisation ponds", "Constructed wetlands", "Anaerobic digesters", "Co-composting", "FSTP"],
    actors: "WWTP operators, utilities",
    desc: "Pathogens and pollutants are reduced to safe levels before outputs re-enter the environment or resource markets.",
  },
  {
    id: 4,
    label: "End use",
    sub: "Environment & market",
    image: "/images_toilet/toilet_8.png",
    color: "#d4f7e7",
    accent: "#0f6e56",
    techs: ["Soil amendment", "Irrigation water", "Biogas energy", "Safe discharge", "Landfill"],
    actors: "Farmers, energy buyers, environment",
    desc: "Treated outputs re-enter the economy as resources: nutrient-rich compost, treated effluent for irrigation, or biogas energy.",
  },
];

export default function ChainPage() {
  const [active, setActive] = useState(0);
  const activeStage = stages[active];

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col gap-10">

        <header>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#888] uppercase mb-3">
            Sanitation systems
          </p>
          <h1 className="text-3xl sm:text-4xl font-light text-[#1a1a1a] leading-tight mb-3">
            The sanitation <span className="font-semibold">value chain</span>
          </h1>
          <p className="text-sm text-[#666] max-w-md leading-relaxed">
            Five interconnected stages that move waste from household containment
            through to safe end use or disposal.
          </p>
        </header>

        <div>
          <div className="hidden sm:flex relative items-start justify-between">
            <div className="absolute left-8 right-8 top-[36px] h-px bg-[#ddd] z-0" />
            {stages.map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className="relative z-10 flex flex-col items-center gap-2 focus:outline-none"
                  style={{ minWidth: 72 }}
                >
                  <div className="rounded-xl overflow-hidden transition-all duration-200 border-[3px]">
                    <Image src={s.image} alt={s.label} width={82} height={82} className="w-full h-full object-cover" />
                  </div>
                  <span
                    className="text-[11px] font-semibold text-center leading-tight max-w-[72px]"
                    style={{ color: isActive ? s.accent : "#888" }}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex sm:hidden flex-col gap-2">
            {stages.map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 border text-left"
                  style={{
                    background: isActive ? s.color : "#fff",
                    borderColor: isActive ? s.accent : "#e5e7eb",
                  }}
                >
                  <div
                    className="rounded-lg overflow-hidden shrink-0 border-2"
                    style={{ width: 44, height: 44, borderColor: isActive ? s.accent : "transparent" }}
                  >
                    <Image src={s.image} alt={s.label} width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight" style={{ color: isActive ? s.accent : "#1a1a1a" }}>
                      {s.label}
                    </p>
                    <p className="text-xs text-[#888] mt-0.5">{s.sub}</p>
                  </div>
                  {isActive && (
                    <span className="ml-auto text-xs font-bold shrink-0" style={{ color: s.accent }}>●</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-2xl p-5 sm:p-8 transition-all duration-300 border"
          style={{ background: activeStage.color, borderColor: activeStage.accent + "22" }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div
              className="rounded-xl overflow-hidden shrink-0 border-[3px]"
              style={{ width: 64, height: 64, borderColor: activeStage.accent }}
            >
              <Image src={activeStage.image} alt={activeStage.label} width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <div className="pt-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] leading-tight">
                {activeStage.label}
              </h2>
              <p className="text-xs font-medium mt-1" style={{ color: activeStage.accent }}>
                {activeStage.sub}
              </p>
            </div>
          </div>

          <p className="text-sm text-[#444] leading-relaxed mb-6">{activeStage.desc}</p>

          <div className="mb-5">
            <p className="text-[10px] font-semibold tracking-widest text-[#999] uppercase mb-2.5">
              Technologies
            </p>
            <div className="flex flex-wrap gap-2">
              {activeStage.techs.map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: "#fff", color: activeStage.accent, border: `1px solid ${activeStage.accent}30` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#999] uppercase mb-2">
              Key actors
            </p>
            <p className="text-sm font-medium" style={{ color: activeStage.accent }}>
              {activeStage.actors}
            </p>
          </div>

          <div className="flex justify-between mt-8 pt-5 border-t border-black/5">
            <button
              onClick={() => setActive((active + stages.length - 1) % stages.length)}
              className="text-xs font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
              style={{ color: activeStage.accent }}
            >
              ← {stages[(active + stages.length - 1) % stages.length].label}
            </button>
            <button
              onClick={() => setActive((active + 1) % stages.length)}
              className="text-xs font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
              style={{ color: activeStage.accent }}
            >
              {stages[(active + 1) % stages.length].label} →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {stages.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="rounded-xl overflow-hidden text-left transition-all duration-200 border focus:outline-none"
              style={{
                borderColor: active === s.id ? s.accent : "transparent",
                boxShadow: active === s.id ? `0 0 0 2px ${s.accent}` : "none",
              }}
            >
              <div className="relative h-16 sm:h-20 w-full">
                <Image src={s.image} alt={s.label} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: s.accent, opacity: 0.55 }} />
                <div className="absolute inset-0 flex flex-col justify-end p-2">
                  <div className="text-[9px] sm:text-[10px] font-bold text-white leading-none mb-0.5">
                    {String(s.id + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-white leading-tight">
                    {s.label}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}