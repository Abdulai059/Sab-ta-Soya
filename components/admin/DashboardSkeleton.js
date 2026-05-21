function Bone({ className = "" }) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
}

function CardShell({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-5 ${className}`}>
      {children}
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <CardShell>
      <div className="flex items-start justify-between mb-3">
        <Bone className="w-6 h-6 rounded-md" />
        <Bone className="w-20 h-5 rounded-full" />
      </div>
      <Bone className="w-16 h-8 mb-2" />
      <Bone className="w-28 h-3" />
    </CardShell>
  );
}

function ChartCardSkeleton({ height = "h-52" }) {
  return (
    <CardShell>
      <Bone className="w-36 h-3 mb-4" />
      <Bone className={`w-full ${height} rounded-xl`} />
    </CardShell>
  );
}

function StatusSnapshotSkeleton() {
  return (
    <CardShell>
      <Bone className="w-36 h-3 mb-4" />
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-[90px] rounded-xl" />
        ))}
      </div>
    </CardShell>
  );
}

function WorkerRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Bone className="w-32 h-3" />
        <Bone className="w-24 h-2.5" />
      </div>
      <Bone className="w-16 h-6 rounded-full" />
      <Bone className="w-20 h-1.5 rounded-full" />
      <Bone className="w-14 h-7 rounded-full" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-5 max-w-[1400px] pt-15 mx-auto animate-pulse">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bone className="w-6 h-6 rounded-md" />
            <Bone className="w-32 h-5" />
            <Bone className="w-16 h-5 rounded-full" />
          </div>
          <Bone className="w-52 h-3 ml-8" />
        </div>
        <Bone className="w-14 h-6 rounded-full" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Trend + Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCardSkeleton height="h-52" />
        <ChartCardSkeleton height="h-52" />
      </div>

      {/* Issue types + Status snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCardSkeleton height="h-64" />
        <StatusSnapshotSkeleton />
      </div>

      {/* Worker performance */}
      <CardShell>
        <Bone className="w-48 h-3 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <WorkerRowSkeleton key={i} />
        ))}
      </CardShell>
    </div>
  );
}
