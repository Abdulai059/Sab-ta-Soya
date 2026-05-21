export default function CommunityOfficerPage() {
  const stats = [
    { label: "Reports Filed",    value: "18", color: "text-emerald-600", sub: "This month" },
    { label: "Pending Actions",  value: "5",  color: "text-yellow-600",  sub: "Require attention" },
    { label: "Resolved Today",   value: "9",  color: "text-green-600",   sub: "Successfully completed" },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Community Officer Dashboard</h1>
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
