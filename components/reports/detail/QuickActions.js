export default function QuickActions({ profile }) {
  if (!profile) return null;

  return (
    <div className="bg-white rounded-xl pb-20 border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <button className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-primary text-gray-700 rounded-lg font-semibold text-sm transition-colors">
          Update Status
        </button>
        <button className="w-full px-4 py-2 bg-brand-soft-highlight hover:bg-brand-soft-highlight text-gray-700 rounded-lg text-sm font-semibold transition-colors">
          Assign Team
        </button>
        <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors">
          Add Note
        </button>
      </div>
    </div>
  );
}
