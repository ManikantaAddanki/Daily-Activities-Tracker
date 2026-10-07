import React from 'react';
import { Activity, ActivityStatus } from '../../types';
import {
  Clock,
  MoreVertical,
  CheckCircle2,
  PlayCircle,
  Clock4,
  SkipForward,
  Edit2,
  Trash2,
} from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ActivityStatus) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const getPriorityStyle = (priority: Activity['priority']) => {
    switch (priority) {
      case 'High':
        return 'text-rose-600 dark:text-rose-400';
      case 'Medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'Low':
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
        activity.status === 'Completed'
          ? 'border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5'
          : activity.status === 'Skipped'
          ? 'border-slate-200/60 dark:border-slate-800 opacity-60'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-semibold tracking-tight ${
                activity.status === 'Completed'
                  ? 'line-through text-slate-500 dark:text-slate-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {activity.title}
            </h3>
          </div>

          {activity.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          )}

          {/* Unboxed Metadata Line with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 font-mono tabular-nums">
            <span className="font-sans font-medium text-slate-700 dark:text-slate-300">
              {activity.category}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDuration(activity.duration)}</span>
            {activity.start_time && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {activity.start_time}
                  {activity.end_time ? ` - ${activity.end_time}` : ''}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className={`font-sans font-medium ${getPriorityStyle(activity.priority)}`}>
              {activity.priority} Priority
            </span>
          </div>

          {activity.notes && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 italic">
              Note: {activity.notes}
            </div>
          )}
        </div>

        {/* Right: Quick Status Actions & Menu */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Status Buttons */}
          <button
            onClick={() =>
              onStatusChange(activity.id, activity.status === 'Completed' ? 'Pending' : 'Completed')
            }
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              activity.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={activity.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              onStatusChange(activity.id, activity.status === 'In Progress' ? 'Pending' : 'In Progress')
            }
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              activity.status === 'In Progress'
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-400'
                : 'text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Mark In Progress"
          >
            <PlayCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              onStatusChange(activity.id, activity.status === 'Skipped' ? 'Pending' : 'Skipped')
            }
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              activity.status === 'Skipped'
                ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Mark Skipped"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Context Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-20 py-1 text-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(activity);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(activity.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
