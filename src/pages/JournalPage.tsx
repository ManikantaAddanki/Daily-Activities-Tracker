import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BookOpen, Check, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [accomplishments, setAccomplishments] = useState('');
  const [improvements, setImprovements] = useState('');
  const [content, setContent] = useState('');
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchJournals = async () => {
    setIsLoading(true);
    try {
      const data = await api.getJournals();
      setJournals(data);

      const entry = data.find(j => j.date === selectedDate);
      if (entry) {
        setAccomplishments(entry.accomplishments || '');
        setImprovements(entry.improvements || '');
        setContent(entry.content || '');
      } else {
        setAccomplishments('');
        setImprovements('');
        setContent('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load journals', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [selectedDate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplishments.trim() && !improvements.trim() && !content.trim()) {
      showToast('Please enter reflections before saving', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await api.saveJournal({
        date: selectedDate,
        accomplishments: accomplishments.trim(),
        improvements: improvements.trim(),
        content: content.trim(),
      });
      setJournals(prev => {
        const filtered = prev.filter(j => j.date !== saved.date);
        return [saved, ...filtered];
      });
      showToast('Journal entry saved successfully! 📖', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save journal', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteJournal(id);
      setJournals(prev => prev.filter(j => j.id !== id));
      if (selectedDate === journals.find(j => j.id === id)?.date) {
        setAccomplishments('');
        setImprovements('');
        setContent('');
      }
      showToast('Journal entry removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete journal', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capture what went well, identify areas for improvement, and maintain long-term self-awareness.
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

      {/* Main Journal Form */}
      <form onSubmit={handleSave} className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Journal Entry
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
            Reflections for {selectedDate}
          </h2>
        </div>

        {/* Prompt 1: Accomplishments */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            What did you accomplish today?
          </label>
          <textarea
            rows={3}
            value={accomplishments}
            onChange={e => setAccomplishments(e.target.value)}
            placeholder="Key wins, completed tasks, new skills acquired, positive habits maintained..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-none"
          />
        </div>

        {/* Prompt 2: Improvements */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            What can you improve tomorrow?
          </label>
          <textarea
            rows={3}
            value={improvements}
            onChange={e => setImprovements(e.target.value)}
            placeholder="Distractions to reduce, energy management, scheduling adjustments..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-none"
          />
        </div>

        {/* Prompt 3: Additional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            General Notes & Thoughts (Optional)
          </label>
          <textarea
            rows={2}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Ideas, bookmarks, reading notes..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Journal'}</span>
          </button>
        </div>
      </form>

      {/* Past Entries Log */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Past Reflections
        </h2>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : journals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No reflections saved yet. Write your thoughts above to start your journal.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journals.map(entry => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                      {entry.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDate(entry.date)}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {entry.accomplishments && (
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase text-slate-400">Accomplishments</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">
                      {entry.accomplishments}
                    </p>
                  </div>
                )}

                {entry.improvements && (
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase text-slate-400">Improvements</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">
                      {entry.improvements}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
