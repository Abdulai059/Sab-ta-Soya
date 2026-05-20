export default function DistrictOfficerPage() {
  const stats = [
    { label: "Total Reports",  value: "156", color: "text-blue-600",   sub: "All time" },
    { label: "Active Cases",   value: "23",  color: "text-orange-600", sub: "Currently ongoing" },
    { label: "Response Rate",  value: "94%", color: "text-green-600",  sub: "This month" },
    { label: "Coverage",       value: "78%", color: "text-purple-600", sub: "District covered" },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">District Officer Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2">{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
