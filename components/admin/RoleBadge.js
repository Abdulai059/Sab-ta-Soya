import { ROLE_METADATA } from "@/lib/permissions";

export default function RoleBadge({ role }) {
  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
        ROLE_METADATA[role]?.color || "bg-gray-100 text-gray-700"
      }`}
    >
      {ROLE_METADATA[role]?.label || role}
    </span>
  );
}
