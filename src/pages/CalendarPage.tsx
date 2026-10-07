import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ActivityCard } from '../components/activities/ActivityCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface CalendarPageProps {
  onOpenAddModalWithDate: (date: string) => void;
  onEditActivity: (activity: Activity) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  onOpenAddModalWithDate,
  onEditActivity,
}) => {
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Month bounds
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Load activities for entire month
  useEffect(() => {
    const fetchMonthActivities = async () => {
      setIsLoading(true);
      try {
        const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
          totalDaysInMonth
        ).padStart(2, '0')}`;
        const data = await api.getActivities({
          start_date: startStr,
          end_date: endStr,
        });
        setActivities(data);
      } catch (err: any) {
        showToast(err.message || 'Failed to load calendar activities', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthActivities();
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Group activities by date string
  const activitiesByDate = activities.reduce((acc, act) => {
    if (!acc[act.date]) acc[act.date] = [];
    acc[act.date].push(act);
    return acc;
  }, {} as Record<string, Activity[]>);

  const selectedActivities = activitiesByDate[selectedDateStr] || [];

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Generate calendar grid days
  const calendarCells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ day, dateStr: dStr });
  }

  const isToday = (dStr: string) => {
    return dStr === new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Activity Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse schedule by date and inspect daily workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day View on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Column Calendar View */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center pb-2 border-b border-slate-100 dark:border-slate-800 font-mono text-[11px] font-semibold text-slate-400">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 pt-3">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-16 rounded-xl bg-slate-50/30 dark:bg-slate-950/20" />;
              }

              const count = (activitiesByDate[cell.dateStr] || []).length;
              const isSelected = selectedDateStr === cell.dateStr;
              const isCurrentDay = isToday(cell.dateStr);

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between transition-all text-left group ${
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5 ring-1 ring-slate-900 dark:ring-white'
                      : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium rounded-full w-5 h-5 flex items-center justify-center ${
                        isCurrentDay
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] font-mono tabular-nums text-slate-500 font-semibold">
                        {count}
                      </span>
                    )}
                  </div>

                  {/* Activity Indicator Dots */}
                  <div className="flex gap-1 overflow-hidden">
                    {(activitiesByDate[cell.dateStr] || []).slice(0, 3).map((act, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          act.status === 'Completed'
                            ? 'bg-emerald-500'
                            : act.status === 'In Progress'
                            ? 'bg-sky-500'
                            : 'bg-amber-400'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h2>
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  {selectedActivities.length} activities scheduled
                </span>
              </div>

              <button
                onClick={() => onOpenAddModalWithDate(selectedDateStr)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add for Day</span>
              </button>
            </div>

            {/* List for the selected day */}
            <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {selectedActivities.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  No activities scheduled for this date.
                </div>
              ) : (
                selectedActivities.map(act => (
                  <div
                    key={act.id}
                    onClick={() => onEditActivity(act)}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:underline">
                        {act.title}
                      </h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          act.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : act.status === 'In Progress'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-slate-500 mt-2">
                      <span>{act.category}</span>
                      <span>·</span>
                      <span>
                        {act.start_time} - {act.end_time || `${act.duration}m`}
                      </span>
                      <span>·</span>
                      <span>{act.priority}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
