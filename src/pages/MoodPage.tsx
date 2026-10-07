import React, { useState, useEffect } from 'react';
import { MoodEntry, MoodType } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Smile, Calendar as CalendarIcon, Check } from 'lucide-react';

export const MoodPage: React.FC = () => {
  const { showToast } = useToast();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMoodData = async () => {
    setIsLoading(true);
    try {
      const history = await api.getMoods();
      setMoodHistory(history);

      const entry = history.find(m => m.date === selectedDate);
      if (entry) {
        setCurrentMood(entry.mood);
        setCurrentNote(entry.note || '');
      } else {
        setCurrentMood(null);
        setCurrentNote('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load mood history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodData();
  }, [selectedDate]);

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMood) {
      showToast('Please select how you felt today', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await api.saveMood({
        date: selectedDate,
        mood: currentMood,
        note: currentNote.trim(),
      });
      setMoodHistory(prev => {
        const filtered = prev.filter(m => m.date !== saved.date);
        return [saved, ...filtered];
      });
      showToast('Mood entry saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save mood', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const MOOD_OPTIONS: { type: MoodType; emoji: string; label: string; desc: string }[] = [
    { type: 'Excellent', emoji: '😄', label: 'Excellent', desc: 'High energy, achieved goals, felt energized' },
    { type: 'Good', emoji: '🙂', label: 'Good', desc: 'Steady focus, productive day, peaceful mindset' },
    { type: 'Normal', emoji: '😐', label: 'Normal', desc: 'Routine tasks completed, standard energy' },
    { type: 'Bad', emoji: '😔', label: 'Bad', desc: 'Fatigued, encountered roadblocks, distracted' },
    { type: 'Very Bad', emoji: '😫', label: 'Very Bad', desc: 'Overwhelmed, burnout, tough day' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mood Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your daily energy levels and correlate emotional well-being with productivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
          />
        </div>
      </div>

      {/* Main Form */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            How was your day on {selectedDate}?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select the mood that best captures your overall mental clarity and momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {MOOD_OPTIONS.map(m => (
            <button
              key={m.type}
              type="button"
              onClick={() => setCurrentMood(m.type)}
              className={`p-4 rounded-xl border text-center transition-all ${
                currentMood === m.type
                  ? 'border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5 ring-2 ring-slate-900 dark:ring-white scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="text-3xl mb-2">{m.emoji}</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">{m.label}</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                {m.desc}
              </div>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Personal Reflection Note
          </label>
          <textarea
            rows={3}
            value={currentNote}
            onChange={e => setCurrentNote(e.target.value)}
            placeholder="e.g. Completed all study goals and hit personal best workout..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveMood}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Mood'}</span>
          </button>
        </div>
      </div>

      {/* Mood History Timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Mood History Log
        </h2>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : moodHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No mood history logged yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {moodHistory.map(item => {
              const matched = MOOD_OPTIONS.find(m => m.type === item.mood);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDate(item.date)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{matched?.emoji || '😐'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {item.mood}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-400">
                          {item.date}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Edit →</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
