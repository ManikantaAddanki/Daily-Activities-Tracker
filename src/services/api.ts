import {
  AuthResponse,
  User,
  Activity,
  Goal,
  MoodEntry,
  JournalEntry,
  NotificationItem,
  DashboardSummary,
  WeeklyAnalytics,
  MonthlyAnalytics,
} from '../types';

const API_BASE = '/api';

class ApiService {
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  public setTokens(access: string, refresh?: string) {
    localStorage.setItem('access_token', access);
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
  }

  public clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getAccessToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration & refresh
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            this.setTokens(data.access);
            headers['Authorization'] = `Bearer ${data.access}`;
            response = await fetch(url, {
              ...options,
              headers,
            });
          } else {
            this.clearTokens();
            window.dispatchEvent(new CustomEvent('auth:expired'));
          }
        } catch {
          this.clearTokens();
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      } else {
        this.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    if (!response.ok) {
      let errData: any = {};
      try {
        errData = await response.json();
      } catch {
        errData = { error: response.statusText || 'An error occurred' };
      }
      const errorMsg =
        errData.error ||
        errData.detail ||
        (typeof errData === 'object' ? Object.values(errData).flat().join(', ') : 'Request failed');
      throw new Error(errorMsg || `Error ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // --- Auth APIs ---
  async login(payload: { username?: string; email?: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setTokens(res.tokens.access, res.tokens.refresh);
    localStorage.setItem('current_user', JSON.stringify(res.user));
    return res;
  }

  async register(payload: {
    username: string;
    email: string;
    full_name: string;
    password: string;
    confirm_password: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setTokens(res.tokens.access, res.tokens.refresh);
    localStorage.setItem('current_user', JSON.stringify(res.user));
    return res;
  }

  async logout(): Promise<void> {
    try {
      const refresh = this.getRefreshToken();
      if (refresh) {
        await this.request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh }),
        });
      }
    } catch {
      // Ignore errors on logout
    } finally {
      this.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile/');
  }

  async updateProfile(payload: { full_name?: string; bio?: string; daily_activity_target?: number; email?: string }): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async changePassword(payload: { old_password: string; new_password: string; confirm_new_password: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Activities APIs ---
  async getActivities(params?: {
    category?: string;
    status?: string;
    priority?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<Activity[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.set(k, String(v));
        }
      });
    }
    const qs = query.toString();
    return this.request<Activity[]>(`/activities/${qs ? `?${qs}` : ''}`);
  }

  async getActivity(id: string): Promise<Activity> {
    return this.request<Activity>(`/activities/${id}/`);
  }

  async createActivity(payload: Partial<Activity>): Promise<Activity> {
    return this.request<Activity>('/activities/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateActivity(id: string, payload: Partial<Activity>): Promise<Activity> {
    return this.request<Activity>(`/activities/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async updateActivityStatus(id: string, status: Activity['status']): Promise<Activity> {
    return this.request<Activity>(`/activities/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteActivity(id: string): Promise<void> {
    return this.request<void>(`/activities/${id}/`, {
      method: 'DELETE',
    });
  }

  // --- Goals APIs ---
  async getGoals(date?: string): Promise<Goal[]> {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.request<Goal[]>(`/goals/${qs}`);
  }

  async createGoal(payload: { title: string; description?: string; date?: string; target?: string }): Promise<Goal> {
    return this.request<Goal>('/goals/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async toggleGoal(id: string): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}/toggle/`, {
      method: 'PATCH',
    });
  }

  async deleteGoal(id: string): Promise<void> {
    return this.request<void>(`/goals/${id}/`, {
      method: 'DELETE',
    });
  }

  // --- Mood Tracker APIs ---
  async getMoods(): Promise<MoodEntry[]> {
    return this.request<MoodEntry[]>('/moods/');
  }

  async getTodayMood(): Promise<MoodEntry> {
    return this.request<MoodEntry>('/moods/today/');
  }

  async saveMood(payload: { date?: string; mood: string; note?: string }): Promise<MoodEntry> {
    return this.request<MoodEntry>('/moods/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Journal APIs ---
  async getJournals(): Promise<JournalEntry[]> {
    return this.request<JournalEntry[]>('/journal/');
  }

  async getTodayJournal(): Promise<JournalEntry> {
    return this.request<JournalEntry>('/journal/today/');
  }

  async saveJournal(payload: {
    date?: string;
    accomplishments?: string;
    improvements?: string;
    content?: string;
  }): Promise<JournalEntry> {
    return this.request<JournalEntry>('/journal/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteJournal(id: string): Promise<void> {
    return this.request<void>(`/journal/${id}/`, {
      method: 'DELETE',
    });
  }

  // --- Analytics APIs ---
  async getDashboardAnalytics(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/analytics/dashboard/');
  }

  async getWeeklyAnalytics(): Promise<WeeklyAnalytics> {
    return this.request<WeeklyAnalytics>('/analytics/weekly/');
  }

  async getMonthlyAnalytics(): Promise<MonthlyAnalytics> {
    return this.request<MonthlyAnalytics>('/analytics/monthly/');
  }

  async getAiInsights(): Promise<{ insights: string[]; source: string; generated_at: string }> {
    return this.request<{ insights: string[]; source: string; generated_at: string }>('/analytics/insights/', {
      method: 'POST',
    });
  }

  // --- Notifications APIs ---
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications/');
  }

  async markNotificationRead(id: string): Promise<NotificationItem> {
    return this.request<NotificationItem>(`/notifications/${id}/read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/read-all/', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
