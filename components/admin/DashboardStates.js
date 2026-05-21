import { TrendingUp } from "lucide-react";

export function WorkersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
        <TrendingUp className="w-5 h-5 text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-400">No resolved cases yet</p>
        <p className="text-xs text-gray-300 mt-1">
          Data will appear once workers resolve assignments
        </p>
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard…</p>
      </div>
    </div>
  );
}
