import React, { useState, useEffect } from 'react';
import { Activity, ActivityCategory, ActivityPriority, ActivityStatus } from '../../types';

interface ActivityFormProps {
  initialActivity?: Activity | null;
  onSubmit: (data: Partial<Activity>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES: ActivityCategory[] = [
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

const PRIORITIES: ActivityPriority[] = ['Low', 'Medium', 'High'];
const STATUSES: ActivityStatus[] = ['Pending', 'In Progress', 'Completed', 'Skipped'];

export const ActivityForm: React.FC<ActivityFormProps> = ({
  initialActivity,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialActivity?.title || '');
  const [description, setDescription] = useState(initialActivity?.description || '');
  const [category, setCategory] = useState<ActivityCategory>(initialActivity?.category || 'Coding');
  const [date, setDate] = useState(
    initialActivity?.date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(initialActivity?.start_time || '09:00');
  const [endTime, setEndTime] = useState(initialActivity?.end_time || '10:00');
  const [duration, setDuration] = useState<number>(initialActivity?.duration || 60);
  const [priority, setPriority] = useState<ActivityPriority>(initialActivity?.priority || 'Medium');
  const [status, setStatus] = useState<ActivityStatus>(initialActivity?.status || 'Pending');
  const [notes, setNotes] = useState(initialActivity?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recalculate duration automatically when startTime or endTime changes
  useEffect(() => {
    if (startTime && endTime) {
      const [h1, m1] = startTime.split(':').map(Number);
      const [h2, m2] = endTime.split(':').map(Number);
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff > 0) {
        setDuration(diff);
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (startTime && endTime) {
      const [h1, m1] = startTime.split(':').map(Number);
      const [h2, m2] = endTime.split(':').map(Number);
      if (h1 * 60 + m1 >= h2 * 60 + m2) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      start_time: startTime,
      end_time: endTime,
      duration,
      priority,
      status,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Activity Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Build Django REST Authentication View"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
        />
        {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Key objectives, tasks, or resources for this session..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-none"
        />
      </div>

      {/* Category & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as ActivityCategory)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono"
          />
          {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
        </div>
      </div>

      {/* Time & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono"
          />
          {errors.endTime && <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Duration (min)
          </label>
          <input
            type="number"
            min={5}
            step={5}
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono"
          />
        </div>
      </div>

      {/* Priority & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  priority === p
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ActivityStatus)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Personal Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Reflections, blockers, or takeaways..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-none"
        />
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
        >
          {isLoading
            ? 'Saving...'
            : initialActivity
            ? 'Update Activity'
            : 'Add Activity'}
        </button>
      </div>
    </form>
  );
};
