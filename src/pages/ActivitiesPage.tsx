import React, { useState, useEffect } from 'react';
import { Activity, ActivityStatus } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ActivityCard } from '../components/activities/ActivityCard';
import { ActivityFilters } from '../components/activities/ActivityFilters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Plus, ListFilter, LayoutGrid, Table } from 'lucide-react';

interface ActivitiesPageProps {
  onOpenAddModal: () => void;
  onEditActivity: (activity: Activity) => void;
}

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({
  onOpenAddModal,
  onEditActivity,
}) => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    priority: 'All',
    date: '',
  });

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActivities({
        search: filters.search || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        priority: filters.priority !== 'All' ? filters.priority : undefined,
        date: filters.date || undefined,
      });
      setActivities(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch activities', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities();
    }, 200);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleStatusChange = async (id: string, newStatus: ActivityStatus) => {
    try {
      const updated = await api.updateActivityStatus(id, newStatus);
      setActivities(prev => prev.map(a => (a.id === id ? updated : a)));
      showToast(`Activity status changed to ${newStatus}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update activity status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteActivity(deleteTargetId);
      setActivities(prev => prev.map(a => a).filter(a => a.id !== deleteTargetId));
      showToast('Activity deleted successfully', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete activity', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      status: 'All',
      priority: 'All',
      date: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Activities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, filter, update, and manage your scheduled daily habits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <ActivityFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Activities Display */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading activities..." />
        </div>
      ) : activities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
          <ListFilter className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No activities found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or create a brand new daily activity.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activities.map(act => (
            <ActivityCard
              key={act.id}
              activity={act}
              onEdit={onEditActivity}
              onDelete={id => setDeleteTargetId(id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        /* High Density Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {activities.map(act => (
                <tr
                  key={act.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors font-mono tabular-nums"
                >
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white max-w-xs truncate">
                    {act.title}
                  </td>
                  <td className="py-3 px-3 font-sans">{act.category}</td>
                  <td className="py-3 px-3">{act.date}</td>
                  <td className="py-3 px-3">
                    {act.start_time} - {act.end_time || '--'}
                  </td>
                  <td className="py-3 px-3">{act.duration}m</td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={
                        act.priority === 'High'
                          ? 'text-rose-600 dark:text-rose-400 font-medium'
                          : act.priority === 'Medium'
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-slate-500 font-medium'
                      }
                    >
                      {act.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <select
                      value={act.status}
                      onChange={e => handleStatusChange(act.id, e.target.value as ActivityStatus)}
                      className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Skipped">Skipped</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 font-sans">
                    <button
                      onClick={() => onEditActivity(act)}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(act.id)}
                      className="text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
