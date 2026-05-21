import { ROLES, ROLE_METADATA } from "@/lib/permissions";

const roleList = Object.values(ROLES);

export default function RoleSelect({ value, onChange, size = "sm" }) {
  const sizeClasses =
    size === "sm"
      ? "px-2 py-1.5 text-sm"
      : "px-2 py-1 text-xs";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-gray-200 rounded-lg ${sizeClasses} text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white`}
    >
      {roleList.map((role) => (
        <option key={role} value={role}>
          {ROLE_METADATA[role]?.label || role.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
