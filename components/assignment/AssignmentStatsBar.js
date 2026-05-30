export default function AssignmentStatsBar({ pending, assigned, active, total }) {
  const stats = [
    { label: "Pending", value: pending, color: "text-orange-600" },
    { label: "Assigned", value: assigned, color: "text-blue-600" },
    { label: "Active", value: active, color: "text-purple-600" },
    { label: "History", value: total, color: "text-gray-900" },
  ];

  return (
    <div className="flex items-center gap-3">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
          <p className="text-xs text-gray-500 leading-none">{label}</p>
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
