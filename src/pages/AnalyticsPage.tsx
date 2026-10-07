import React, { useState, useEffect } from 'react';
import { WeeklyAnalytics, MonthlyAnalytics } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StatsCard } from '../components/common/StatsCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { WeeklyBarChart, CategoryDistribution } from '../components/charts/ActivityCharts';
import {
  BarChart3,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Award,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [weekly, monthly, aiResult] = await Promise.all([
        api.getWeeklyAnalytics(),
        api.getMonthlyAnalytics(),
        api.getAiInsights(),
      ]);
      setWeeklyData(weekly);
      setMonthlyData(monthly);
      setInsights(aiResult.insights || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load analytics data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefreshAiInsights = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.getAiInsights();
      setInsights(res.insights);
      showToast('Productivity insights updated! ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate insights', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Computing productivity metrics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Productivity Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Weekly velocity, completion benchmarks, category distributions, and AI insights.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* AI Productivity Insights Card (Section 16) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-slate-50/50 dark:to-slate-900 border border-indigo-500/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                AI Productivity Insights 🤖
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pattern recognition and actionable behavioral feedback
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshAiInsights}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-indigo-200/50 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5"
            >
              <span className="text-indigo-500 font-bold shrink-0">·</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Weekly Completion"
          value={`${weeklyData?.completion_percentage || 0}%`}
          subtext={`${weeklyData?.completed_activities || 0} of ${weeklyData?.total_activities || 0} done`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          trend="+12%"
        />
        <StatsCard
          label="Total Productive Hours"
          value={`${weeklyData?.total_productive_hours || 0}h`}
          subtext="Recorded focus time"
          icon={<Clock className="w-4 h-4 text-sky-500" />}
        />
        <StatsCard
          label="Most Productive Day"
          value={weeklyData?.most_productive_day || 'None'}
          subtext="Peak completion frequency"
          icon={<Award className="w-4 h-4 text-amber-500" />}
        />
        <StatsCard
          label="Top Category"
          value={weeklyData?.most_active_category || 'Coding'}
          subtext="Dominant habit focus"
          icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
        />
      </div>

      {/* Charts Grid: Weekly Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activities Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Weekly Activities Distribution
              </h2>
              <span className="text-xs text-slate-400">
                Completed tasks across rolling 7 days
              </span>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {weeklyData?.start_date} → {weeklyData?.end_date}
            </span>
          </div>

          {weeklyData?.days && <WeeklyBarChart days={weeklyData.days} />}
        </div>

        {/* Category Breakdown Progress */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Category Distribution
            </h2>
            <span className="text-xs text-slate-400">
              Breakdown by hours and completion counts
            </span>
          </div>

          {weeklyData?.category_breakdown && (
            <CategoryDistribution categories={weeklyData.category_breakdown} />
          )}
        </div>
      </div>

      {/* Monthly Benchmark Summary */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          30-Day Monthly Benchmark
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div>
            <span className="text-xs text-slate-400 block">Total Scheduled</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {monthlyData?.total_activities || 0}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Completed</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {monthlyData?.completed_activities || 0}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Monthly Rate</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {monthlyData?.completion_percentage || 0}%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Focus Time</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {monthlyData?.total_productive_hours || 0} hrs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
