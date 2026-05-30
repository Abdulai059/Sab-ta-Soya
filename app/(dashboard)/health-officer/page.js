export default function HealthOfficerPage() {
  const stats = [
    { label: "Health Risk Reports", value: "11", color: "text-pink-600",   sub: "Active cases" },
    { label: "Inspections Done",    value: "34", color: "text-blue-600",   sub: "This month" },
    { label: "Resolved",            value: "28", color: "text-green-600",  sub: "This month" },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Health Officer Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
