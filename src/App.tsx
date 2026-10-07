import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Modal } from './components/common/Modal';
import { ActivityForm } from './components/activities/ActivityForm';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { api } from './services/api';
import { Activity } from './types';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { CalendarPage } from './pages/CalendarPage';
import { GoalsPage } from './pages/GoalsPage';
import { MoodPage } from './pages/MoodPage';
import { JournalPage } from './pages/JournalPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ApiDocsPage } from './pages/ApiDocsPage';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Add/Edit Activity modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // Global streak
  const [streakCount, setStreakCount] = useState<number>(12);

  // Sync hash routing if user changes URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (
        [
          'dashboard',
          'activities',
          'calendar',
          'goals',
          'mood',
          'journal',
          'analytics',
          'profile',
          'api-docs',
        ].includes(hash)
      ) {
        setCurrentTab(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
  };

  const handleOpenAddModal = (date?: string) => {
    setEditingActivity(null);
    setPrefilledDate(date || new Date().toISOString().split('T')[0]);
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (act: Activity) => {
    setEditingActivity(act);
    setPrefilledDate(act.date);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (data: Partial<Activity>) => {
    setIsSubmittingActivity(true);
    try {
      if (editingActivity) {
        await api.updateActivity(editingActivity.id, data);
        showToast('Activity updated successfully! 🚀', 'success');
      } else {
        await api.createActivity(data);
        showToast('Activity added to your daily schedule! ✨', 'success');
      }
      setIsActivityModalOpen(false);
      setEditingActivity(null);
      // Trigger update
      api.getDashboardAnalytics().then(res => setStreakCount(res.current_streak)).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to save activity', 'error');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" label="Initializing Daily Activity Tracker..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentStreak={streakCount}
      />

      {/* Main Workspace Frame (offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Bar Header */}
        <Navbar
          onOpenAddModal={() => handleOpenAddModal()}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          currentStreak={streakCount}
        />

        {/* Viewport Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenAddModal={() => handleOpenAddModal()}
              onNavigateTab={handleSelectTab}
              onEditActivity={handleEditActivity}
            />
          )}

          {currentTab === 'activities' && (
            <ActivitiesPage
              onOpenAddModal={() => handleOpenAddModal()}
              onEditActivity={handleEditActivity}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarPage
              onOpenAddModalWithDate={date => handleOpenAddModal(date)}
              onEditActivity={handleEditActivity}
            />
          )}

          {currentTab === 'goals' && <GoalsPage />}

          {currentTab === 'mood' && <MoodPage />}

          {currentTab === 'journal' && <JournalPage />}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === 'api-docs' && <ApiDocsPage />}
        </main>
      </div>

      {/* Activity Add / Edit Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        title={editingActivity ? 'Edit Activity' : 'Add New Daily Activity'}
        subtitle={
          editingActivity
            ? `Update details for "${editingActivity.title}"`
            : 'Schedule a task or habit session for your day'
        }
      >
        <ActivityForm
          initialActivity={
            editingActivity ||
            (prefilledDate
              ? ({ date: prefilledDate } as Activity)
              : null)
          }
          onSubmit={handleSaveActivity}
          onCancel={() => {
            setIsActivityModalOpen(false);
            setEditingActivity(null);
          }}
          isLoading={isSubmittingActivity}
        />
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
