import { Filter, ArrowUpDown } from "lucide-react";

const STATUS_FILTERS = [
  { id: 'all', label: 'All History' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Declined' },
  { id: 'expired', label: 'Expired' }
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' }
];

export default function HistoryFilters({ activeFilter, onFilterChange, sortOrder, onSortChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === filter.id
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-gray-500" />
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
