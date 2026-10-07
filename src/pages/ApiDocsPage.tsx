import React, { useState } from 'react';
import { Code2, Database, Terminal, Server, FileText, Check, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ApiDocsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<'endpoints' | 'models' | 'setup'>('endpoints');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    showToast(`Copied ${label} to clipboard`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const endpoints = [
    {
      method: 'POST',
      url: '/api/auth/register/',
      desc: 'Registers a new user account with full name, username, email, and password.',
      auth: false,
      payload: '{\n  "username": "alex",\n  "email": "alex@example.com",\n  "full_name": "Alex Morgan",\n  "password": "Password123!",\n  "confirm_password": "Password123!"\n}',
    },
    {
      method: 'POST',
      url: '/api/auth/login/',
      desc: 'Authenticates via username/email and returns JWT access & refresh tokens.',
      auth: false,
      payload: '{\n  "username": "alex",\n  "password": "Password123!"\n}',
    },
    {
      method: 'POST',
      url: '/api/auth/refresh/',
      desc: 'Generates a fresh JWT access token using valid refresh token.',
      auth: false,
      payload: '{\n  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n}',
    },
    {
      method: 'GET',
      url: '/api/activities/',
      desc: 'Retrieves user activities. Supports ?search, ?category, ?status, ?priority, ?date, ?start_date, ?end_date',
      auth: true,
      payload: null,
    },
    {
      method: 'POST',
      url: '/api/activities/',
      desc: 'Creates a new daily activity with category, time window, priority, and notes.',
      auth: true,
      payload: '{\n  "title": "Django REST Testing",\n  "category": "Coding",\n  "date": "2026-09-28",\n  "start_time": "09:00",\n  "end_time": "10:30",\n  "duration": 90,\n  "priority": "High",\n  "status": "Pending",\n  "notes": "Verify serializers"\n}',
    },
    {
      method: 'PATCH',
      url: '/api/activities/<id>/status/',
      desc: 'Updates activity status (Pending, In Progress, Completed, Skipped).',
      auth: true,
      payload: '{\n  "status": "Completed"\n}',
    },
    {
      method: 'GET',
      url: '/api/goals/',
      desc: 'Lists user daily goals. Filterable by ?date=YYYY-MM-DD.',
      auth: true,
      payload: null,
    },
    {
      method: 'PATCH',
      url: '/api/goals/<id>/toggle/',
      desc: 'Toggles completed boolean status of the daily goal.',
      auth: true,
      payload: '{}',
    },
    {
      method: 'POST',
      url: '/api/moods/',
      desc: 'Upserts the daily mood (Excellent, Good, Normal, Bad, Very Bad) and reflection note.',
      auth: true,
      payload: '{\n  "date": "2026-09-28",\n  "mood": "Excellent",\n  "note": "Hit all daily targets"\n}',
    },
    {
      method: 'POST',
      url: '/api/journal/',
      desc: 'Saves daily journal entries: accomplishments, improvements, and content.',
      auth: true,
      payload: '{\n  "date": "2026-09-28",\n  "accomplishments": "Completed backend APIs",\n  "improvements": "More frequent breaks",\n  "content": "Deep work routine works great."\n}',
    },
    {
      method: 'GET',
      url: '/api/analytics/dashboard/',
      desc: 'Returns streak stats, today completion percentage, and active goal metrics.',
      auth: true,
      payload: null,
    },
    {
      method: 'GET',
      url: '/api/analytics/weekly/',
      desc: 'Provides 7-day completion breakdown, most active categories, and productive hours.',
      auth: true,
      payload: null,
    },
    {
      method: 'POST',
      url: '/api/analytics/insights/',
      desc: 'Generates AI & heuristic productivity insights from recent user habit history.',
      auth: true,
      payload: '{}',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Django 5.0 + DRF
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              MySQL 8.0
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Backend Architecture & REST APIs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Documentation, Django schema definitions, migration commands, and API payloads.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSection('endpoints')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSection === 'endpoints'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            REST Endpoints
          </button>
          <button
            onClick={() => setActiveSection('models')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSection === 'models'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Django Models
          </button>
          <button
            onClick={() => setActiveSection('setup')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSection === 'setup'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Setup & Commands
          </button>
        </div>
      </div>

      {/* SECTION 1: Endpoints */}
      {activeSection === 'endpoints' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            All endpoints support JSON formatting and require standard JWT Bearer header{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">
              Authorization: Bearer &lt;token&gt;
            </code>{' '}
            for protected resources.
          </div>

          <div className="space-y-3">
            {endpoints.map((ep, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold font-mono rounded ${
                        ep.method === 'GET'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                          : ep.method === 'POST'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {ep.url}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400">
                    {ep.auth ? 'Protected (JWT)' : 'Public'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ep.desc}
                </p>

                {ep.payload && (
                  <div className="relative mt-2">
                    <div className="absolute right-2 top-2">
                      <button
                        onClick={() => copyToClipboard(ep.payload!, ep.url)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs"
                      >
                        {copiedCode === ep.url ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto leading-relaxed">
                      {ep.payload}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Django Models */}
      {activeSection === 'models' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Django ORM Schema Architecture</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every model includes relational foreign keys to the authenticated user, indexed date fields for rapid calendar queries, and custom queryset filters.
            </p>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed">
{`# 1. accounts/models.py
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    daily_activity_target = models.PositiveIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

# 2. activities/models.py
class Activity(models.Model):
    CATEGORY_CHOICES = [('Study','Study'),('Coding','Coding'),('Work','Work'),
                        ('Exercise','Exercise'),('Health','Health'),('Reading','Reading')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.DateField(default=date.today)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=30)
    priority = models.CharField(max_length=20, choices=[('Low','Low'),('Medium','Medium'),('High','High')])
    status = models.CharField(max_length=20, default='Pending')
    notes = models.TextField(blank=True)

# 3. goals/models.py
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    date = models.DateField(default=date.today)
    target = models.CharField(max_length=100, blank=True)
    completed = models.BooleanField(default=False)

# 4. mood/models.py
class Mood(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moods')
    date = models.DateField(default=date.today)
    mood = models.CharField(max_length=20)
    note = models.TextField(blank=True)

# 5. journal/models.py
class Journal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals')
    date = models.DateField(default=date.today)
    accomplishments = models.TextField(blank=True)
    improvements = models.TextField(blank=True)`}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 3: Setup & Commands */}
      {activeSection === 'setup' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-500" />
              <span>Step-by-Step Django & MySQL Deployment</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">1. MySQL Database Creation</p>
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px]">
{`CREATE DATABASE daily_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tracker_user'@'localhost' IDENTIFIED BY 'tracker_password_123';
GRANT ALL PRIVILEGES ON daily_tracker_db.* TO 'tracker_user'@'localhost';
FLUSH PRIVILEGES;`}
                </pre>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">2. Environment Setup & Migrations</p>
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px]">
{`cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Run migrations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser`}
                </pre>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">3. Start Django Server</p>
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px]">
{`python manage.py runserver 0.0.0.0:8000`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
