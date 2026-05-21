function Bone({ className = "" }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <Bone className="w-10 h-8" />
        <Bone className="w-9 h-9 rounded-lg" />
      </div>
      <Bone className="w-28 h-3 mt-1" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-5 py-3.5 border-r border-gray-200">
        <Bone className="w-20 h-3.5" />
      </td>
      <td className="px-5 py-3.5 border-r border-gray-200">
        <Bone className="w-40 h-3.5 mb-1.5" />
        <Bone className="w-28 h-2.5" />
      </td>
      <td className="px-5 py-3.5 border-r border-gray-200">
        <Bone className="w-16 h-5 rounded-md" />
      </td>
      <td className="px-5 py-3.5 border-r border-gray-200">
        <Bone className="w-16 h-5 rounded-md" />
      </td>
      <td className="px-5 py-3.5 border-r border-gray-200">
        <Bone className="w-16 h-3" />
      </td>
      <td className="px-5 py-3.5 border-r border-gray-200">
        <Bone className="w-16 h-3" />
      </td>
      <td className="px-5 py-3.5">
        <Bone className="w-7 h-7 rounded-lg" />
      </td>
    </tr>
  );
}

export default function ReportsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-[1500px] mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <Bone className="w-56 h-8 mb-3" />
          <Bone className="w-80 h-4" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6 mt-4 bg-white p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} className="w-24 h-9 rounded-lg" />
          ))}
          <div className="ml-auto">
            <Bone className="w-52 h-9 rounded-lg" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Ref ID", "Issue / Location", "Severity", "Status", "Reported", "Location", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left">
                      <Bone className="w-16 h-3" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-1">
          <Bone className="w-32 h-4" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="w-9 h-9 rounded-lg" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
