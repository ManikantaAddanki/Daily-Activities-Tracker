import React from 'react';
import { DayWeeklyMetric, CategoryMetric } from '../../types';

interface WeeklyBarChartProps {
  days: DayWeeklyMetric[];
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ days }) => {
  const maxCompleted = Math.max(...days.map(d => d.completed), 4);

  return (
    <div className="w-full">
      <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
        {days.map(day => {
          const heightPercent = Math.max(8, Math.round((day.completed / maxCompleted) * 100));
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px] font-mono tabular-nums bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-0.5 px-1.5 rounded shadow pointer-events-none whitespace-nowrap">
                {day.completed} / {day.total} ({day.productive_hours}h)
              </div>

              {/* Bar container */}
              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end p-0.5 overflow-hidden">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                    day.completed >= 3
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : day.completed > 0
                      ? 'bg-slate-800 dark:bg-slate-300'
                      : 'bg-transparent'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day label */}
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CategoryDistributionProps {
  categories: CategoryMetric[];
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ categories }) => {
  const totalCompleted = categories.reduce((sum, c) => sum + c.count, 0);

  if (categories.length === 0 || totalCompleted === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No completed activities recorded this period.
      </div>
    );
  }

  const categoryColorMap: Record<string, string> = {
    Coding: 'bg-sky-500',
    Study: 'bg-indigo-500',
    Work: 'bg-amber-500',
    Exercise: 'bg-emerald-500',
    Health: 'bg-teal-500',
    Reading: 'bg-purple-500',
    Personal: 'bg-rose-500',
    Entertainment: 'bg-orange-500',
    Other: 'bg-slate-400',
  };

  return (
    <div className="space-y-3.5">
      {categories.map(cat => {
        const percent = Math.round((cat.count / totalCompleted) * 100);
        const bg = categoryColorMap[cat.category] || 'bg-slate-500';
        return (
          <div key={cat.category} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {cat.category}
              </span>
              <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {cat.count} acts · {cat.total_hours}h ({percent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${bg}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
