export default function NGOPage() {
  const stats = [
    { label: "Projects Active", value: "12",    color: "text-green-600",  sub: "Currently running" },
    { label: "People Reached",  value: "8,432", color: "text-blue-600",   sub: "Beneficiaries" },
    { label: "Impact Score",    value: "87%",   color: "text-purple-600", sub: "Effectiveness rate" },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">NGO Dashboard</h1>
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
