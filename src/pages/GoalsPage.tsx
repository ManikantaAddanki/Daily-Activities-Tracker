import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { Plus, Target, CheckCircle2, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoalsPage: React.FC = () => {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGoals(selectedDate);
      setGoals(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load goals', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [selectedDate]);

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.toggleGoal(id);
      setGoals(prev => prev.map(g => (g.id === id ? updated : g)));
      if (updated.completed) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.75 },
        });
        showToast('Daily goal completed! 🎯', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle goal', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      showToast('Goal removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete goal', 'error');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Goal title is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createGoal({
        title: newTitle.trim(),
        description: newDescription.trim(),
        target: newTarget.trim(),
        date: selectedDate,
      });
      setGoals(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewTarget('');
      showToast('Goal created successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create goal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed).length;
  const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define daily targets to stay accountable and reinforce habit progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
          />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Target Completion for {selectedDate}
            </span>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {completedGoals} / {totalGoals} ({completionPercentage}%)
          </span>
        </div>

        <ProgressBar value={completionPercentage} height="h-3" color="emerald" />
      </div>

      {/* Goals Checklist */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" label="Loading goals..." />
          </div>
        ) : goals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <Target className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No goals set for this date
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Setting 3 to 5 clear targets each morning increases focus and daily completion rates.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Daily Goal</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {goals.map(goal => (
              <div
                key={goal.id}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div
                  onClick={() => handleToggle(goal.id)}
                  className="flex items-start gap-3.5 flex-1 cursor-pointer"
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                      goal.completed
                        ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-500'
                    }`}
                  >
                    {goal.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-1">
                    <p
                      className={`text-sm font-medium ${
                        goal.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {goal.title}
                    </p>
                    {goal.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {goal.target && (
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                      {goal.target}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Daily Goal"
        subtitle={`Scheduled for ${selectedDate}`}
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Study Python for 2 hours"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Metric / Metric Units
            </label>
            <input
              type="text"
              value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
              placeholder="e.g. 2 hours, 5 problems, 10 pages"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Details or resources..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800"
            >
              {isSubmitting ? 'Saving...' : 'Add Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
