export function AssignPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pt-20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton rounded-lg w-48 h-7" />
          <div className="skeleton rounded-lg w-64 h-4" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton rounded-full w-24 h-7" />
          <div className="skeleton rounded-full w-24 h-7" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="skeleton h-1 w-full" />
            <div className="skeleton h-40 w-full" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton rounded w-20 h-3" />
                <div className="skeleton rounded-full w-16 h-5" />
              </div>
              <div className="skeleton rounded w-3/4 h-4" />
              <div className="skeleton rounded-lg w-full h-12" />
              <div className="skeleton rounded-lg w-full h-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
