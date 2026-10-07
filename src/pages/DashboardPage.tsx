import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { DashboardSummary, Goal, Activity, ActivityStatus, MoodType } from '../types';
import { StatsCard } from '../components/common/StatsCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ActivityCard } from '../components/activities/ActivityCard';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  Target,
  Smile,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardPageProps {
  onOpenAddModal: () => void;
  onNavigateTab: (tab: any) => void;
  onEditActivity: (activity: Activity) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddModal,
  onNavigateTab,
  onEditActivity,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moodSaving, setMoodSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [moodNote, setMoodNote] = useState('');

  const loadDashboardData = async () => {
    try {
      const [sum, goalList, moodData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getGoals(),
        api.getTodayMood(),
      ]);
      setSummary(sum);
      setGoals(goalList);
      setSelectedMood(moodData.mood);
      setMoodNote(moodData.note || '');
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleGoal = async (id: string) => {
    try {
      const updated = await api.toggleGoal(id);
      setGoals(prev => prev.map(g => (g.id === id ? updated : g)));
      if (updated.completed) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
        });
        showToast('Goal completed! Keep going! 🎯', 'success');
      }
      // Refresh summary counts
      api.getDashboardAnalytics().then(setSummary).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to update goal', 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ActivityStatus) => {
    try {
      await api.updateActivityStatus(id, newStatus);
      showToast(`Activity marked as ${newStatus}`, 'info');
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await api.deleteActivity(id);
      showToast('Activity deleted', 'info');
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete activity', 'error');
    }
  };

  const handleQuickMoodSelect = async (mood: MoodType) => {
    setMoodSaving(true);
    try {
      await api.saveMood({ mood, note: moodNote });
      setSelectedMood(mood);
      showToast(`Mood recorded: ${mood}`, 'success');
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save mood', 'error');
    } finally {
      setMoodSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading dashboard summary..." />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = user?.profile?.full_name || user?.username || 'User';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Welcome Zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting()}, {displayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily habits, hit completion targets, and maintain your streak.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Activity</span>
        </button>
      </div>

      {/* Progress & Streak Hero Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daily Progress Target
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {summary?.completion_percentage || 0}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({summary?.completed_activities || 0} of {summary?.total_activities || 0} activities completed today)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-xs font-semibold font-mono tabular-nums">
                {summary?.current_streak || 0} Day Streak
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold font-mono tabular-nums">
                Best: {summary?.longest_streak || 0}
              </span>
            </div>
          </div>
        </div>

        <ProgressBar
          value={summary?.completion_percentage || 0}
          height="h-3"
          color={
            (summary?.completion_percentage || 0) >= 80
              ? 'emerald'
              : (summary?.completion_percentage || 0) >= 40
              ? 'sky'
              : 'amber'
          }
        />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Activities"
          value={summary?.total_activities || 0}
          subtext="Scheduled for today"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatsCard
          label="Completed"
          value={summary?.completed_activities || 0}
          subtext="Done and logged"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          trend={`${summary?.completion_percentage || 0}%`}
        />
        <StatsCard
          label="Pending / In Progress"
          value={summary?.pending_activities || 0}
          subtext="Awaiting completion"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
        />
        <StatsCard
          label="Current Streak"
          value={`${summary?.current_streak || 0} Days`}
          subtext={`Personal best: ${summary?.longest_streak || 0} days`}
          icon={<Flame className="w-4 h-4 text-amber-500" />}
          highlight={true}
        />
      </div>

      {/* Two Column Layout: Goals & Quick Mood */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Goals & Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Goals Section */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Today's Goals
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {goals.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No daily goals set for today.
                  <button
                    onClick={() => onNavigateTab('goals')}
                    className="block mx-auto mt-2 text-slate-900 dark:text-white underline font-medium"
                  >
                    Add a goal
                  </button>
                </div>
              ) : (
                goals.slice(0, 4).map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => handleToggleGoal(goal.id)}
                    className="py-3 flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          goal.completed
                            ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900'
                            : 'border-slate-300 dark:border-slate-700 group-hover:border-slate-500'
                        }`}
                      >
                        {goal.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span
                        className={`text-xs font-medium truncate ${
                          goal.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {goal.title}
                      </span>
                    </div>

                    {goal.target && (
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                        {goal.target}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activities Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent Activities
              </h2>
              <button
                onClick={() => onNavigateTab('activities')}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {(!summary?.recent_activities || summary.recent_activities.length === 0) ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
                  No activities created yet. Click "New Activity" above to get started.
                </div>
              ) : (
                summary.recent_activities.slice(0, 5).map(act => (
                  <ActivityCard
                    key={act.id}
                    activity={act}
                    onEdit={onEditActivity}
                    onDelete={handleDeleteActivity}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Mood Tracker & Productivity Widget */}
        <div className="space-y-6">
          {/* Quick Mood Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  How was your day?
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('mood')}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                History
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[
                { type: 'Excellent' as MoodType, emoji: '😄', label: 'Great' },
                { type: 'Good' as MoodType, emoji: '🙂', label: 'Good' },
                { type: 'Normal' as MoodType, emoji: '😐', label: 'Okay' },
                { type: 'Bad' as MoodType, emoji: '😔', label: 'Low' },
                { type: 'Very Bad' as MoodType, emoji: '😫', label: 'Bad' },
              ].map(m => (
                <button
                  key={m.type}
                  type="button"
                  disabled={moodSaving}
                  onClick={() => handleQuickMoodSelect(m.type)}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    selectedMood === m.type
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs scale-105'
                      : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xl mb-1">{m.emoji}</span>
                  <span className="text-[10px] font-medium leading-none">{m.label}</span>
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">Today: </span>
                {selectedMood}
                {moodNote && <p className="italic mt-1 text-[11px]">"{moodNote}"</p>}
              </div>
            )}
          </div>

          {/* Quick Journal Prompt Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Daily Reflection
              </h3>
              <button
                onClick={() => onNavigateTab('journal')}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Write Journal →
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Take 2 minutes to record your wins and note 1 thing to improve tomorrow. Reflection cements habit consistency.
            </p>
            <button
              onClick={() => onNavigateTab('journal')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Open Daily Journal
            </button>
          </div>

          {/* Quick AI Insight preview */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-transparent border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Productivity Insight</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your completion rate peaks when morning activities are scheduled between 8:30 AM and 11:30 AM.
            </p>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1 block"
            >
              Explore Full Analytics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
