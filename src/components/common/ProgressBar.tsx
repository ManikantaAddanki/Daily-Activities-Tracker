import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  height?: string;
  color?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 'h-2.5',
  color = 'emerald',
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const colorMap = {
    emerald: 'bg-emerald-500 dark:bg-emerald-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    indigo: 'bg-indigo-500 dark:bg-indigo-400',
    rose: 'bg-rose-500 dark:bg-rose-400',
    sky: 'bg-sky-500 dark:bg-sky-400',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mb-1.5">
          <span>Completion</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${colorMap[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
