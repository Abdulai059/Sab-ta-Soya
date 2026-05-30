"use client";

import { ChevronDown } from "lucide-react";

export const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition";

export function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-gray-400" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        {children}
      </span>
    </div>
  );
}

export function FieldLabel({ children, required }) {
  return (
    <span className="text-[13px] text-gray-500 mb-1 block">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </span>
  );
}

export function Field({ label, required, children }) {
  return (
    <div className="flex flex-col">
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function SelectInput({ options, placeholder, value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputCls + " appearance-none pr-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={typeof o === "string" ? o : o.id} value={typeof o === "string" ? o : o.name}>
            {typeof o === "string" ? o : o.name}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function ToggleRow({ icon: Icon, iconColor, label, badge, badgeColor, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50">
      <Icon size={16} className={iconColor} />
      <span className="text-[13px] text-gray-600 flex-1">{label}</span>
      {badge && (
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-400 cursor-pointer"
      />
    </div>
  );
}

export function Divider() {
  return <hr className="border-gray-100 my-5" />;
}
