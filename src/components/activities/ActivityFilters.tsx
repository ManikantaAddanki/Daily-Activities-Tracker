import React from 'react';
import { Search, X } from 'lucide-react';

interface FiltersState {
  search: string;
  category: string;
  status: string;
  priority: string;
  date: string;
}

interface ActivityFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}

const CATEGORIES = [
  'All',
  'Coding',
  'Study',
  'Work',
  'Exercise',
  'Health',
  'Reading',
  'Personal',
  'Entertainment',
  'Other',
];

const STATUSES = ['All', 'Pending', 'In Progress', 'Completed', 'Skipped'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.category !== 'All' ||
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.date;

  return (
    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
      {/* Top Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by title, description, or notes..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={e => onChange({ ...filters, category: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={e => onChange({ ...filters, status: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={e => onChange({ ...filters, priority: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Priorities' : p}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Date */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Date
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={e => onChange({ ...filters, date: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-slate-400">Filters applied</span>
          <button
            onClick={onReset}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline decoration-dotted font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
