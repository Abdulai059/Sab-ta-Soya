function Bone({ className = "" }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

function MainCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* ReportHeader */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Bone className="w-24 h-4" />
            <Bone className="w-16 h-5 rounded-full" />
          </div>
          <Bone className="w-64 h-7" />
        </div>
        <Bone className="w-20 h-6 rounded-full" />
      </div>

      {/* ReportInfo — description */}
      <div className="mb-6">
        <Bone className="w-28 h-4 mb-3" />
        <Bone className="w-full h-3 mb-1.5" />
        <Bone className="w-4/5 h-3 mb-1.5" />
        <Bone className="w-3/5 h-3" />
      </div>

      {/* ReportInfo — grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Bone className="w-5 h-5 rounded-md mt-0.5 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Bone className="w-16 h-3" />
              <Bone className="w-32 h-4" />
              <Bone className="w-24 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Bone className="w-28 h-5 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1.5">
                <Bone className="w-32 h-4" />
                <Bone className="w-20 h-3" />
              </div>
              <div className="space-y-1.5 items-end flex flex-col">
                <Bone className="w-24 h-3" />
                <Bone className="w-16 h-3" />
              </div>
            </div>
            <Bone className="w-full h-3 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationImagesSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Bone className="w-28 h-4" />
        <Bone className="w-14 h-5 rounded-full" />
      </div>
      <div className="px-4 pt-3 pb-4">
        <Bone className="w-full aspect-video rounded-lg" />
        <div className="flex gap-2 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bone key={i} className="w-16 h-16 rounded-lg shrink-0" />
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-3 flex gap-3">
        <Bone className="w-20 h-3" />
        <Bone className="w-24 h-3" />
      </div>
    </div>
  );
}

function StatusHistorySkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Bone className="w-32 h-5 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="relative pl-6 border-l-2 border-gray-100 pb-3 last:pb-0">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full skeleton" />
            <Bone className="w-40 h-3.5 mb-1.5" />
            <Bone className="w-24 h-2.5 mb-1" />
            <Bone className="w-20 h-2.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Bone className="w-28 h-5 mb-4" />
      <div className="space-y-2">
        <Bone className="w-full h-10 rounded-lg" />
        <Bone className="w-full h-10 rounded-lg" />
        <Bone className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
}

export default function ReportDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:pt-30 pt-0 animate-pulse">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Bone className="w-32 h-4 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col — main card + assignments */}
          <div className="lg:col-span-2 space-y-6">
            <MainCardSkeleton />
            <AssignmentsCardSkeleton />
          </div>

          {/* Right col — images, history, actions */}
          <div className="space-y-6">
            <LocationImagesSkeleton />
            <StatusHistorySkeleton />
            <QuickActionsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
