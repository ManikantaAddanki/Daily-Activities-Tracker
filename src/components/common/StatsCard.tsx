import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: string;
  badge?: string;
  highlight?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  badge,
  highlight = false,
}) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${
        highlight
          ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 dark:border-amber-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            · {badge}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {trend && <span className="font-semibold text-emerald-600 dark:text-emerald-400">{trend}</span>}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
};
