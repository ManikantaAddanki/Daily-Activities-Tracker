export interface Profile {
  full_name: string;
  profile_image: string | null;
  bio: string;
  daily_activity_target: number;
  total_activities?: number;
  completed_activities?: number;
  current_streak?: number;
  longest_streak?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  date_joined: string;
  profile: Profile;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export type ActivityCategory =
  | 'Study'
  | 'Coding'
  | 'Work'
  | 'Exercise'
  | 'Health'
  | 'Reading'
  | 'Personal'
  | 'Entertainment'
  | 'Other';

export type ActivityPriority = 'Low' | 'Medium' | 'High';

export type ActivityStatus = 'Pending' | 'In Progress' | 'Completed' | 'Skipped';

export interface Activity {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration: number; // minutes
  priority: ActivityPriority;
  status: ActivityStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  date: string;
  target: string;
  completed: boolean;
  created_at: string;
}

export type MoodType = 'Excellent' | 'Good' | 'Normal' | 'Bad' | 'Very Bad';

export interface MoodEntry {
  id: string;
  user_id?: string;
  date: string;
  mood: MoodType | null;
  note: string;
  created_at?: string;
}

export interface JournalEntry {
  id: string;
  user_id?: string;
  date: string;
  accomplishments: string;
  improvements: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  today: string;
  total_activities: number;
  completed_activities: number;
  pending_activities: number;
  skipped_activities: number;
  completion_percentage: number;
  current_streak: number;
  longest_streak: number;
  today_goals_total: number;
  today_goals_completed: number;
  today_mood: MoodType | null;
  today_mood_note: string;
  recent_activities: Activity[];
}

export interface DayWeeklyMetric {
  date: string;
  day: string;
  full_day: string;
  total: number;
  completed: number;
  pending: number;
  skipped: number;
  productive_hours: number;
}

export interface CategoryMetric {
  category: string;
  count: number;
  total_hours: number;
}

export interface WeeklyAnalytics {
  start_date: string;
  end_date: string;
  days: DayWeeklyMetric[];
  total_activities: number;
  completed_activities: number;
  pending_activities: number;
  skipped_activities: number;
  completion_percentage: number;
  total_productive_hours: number;
  most_productive_day: string;
  most_active_category: string;
  category_breakdown: CategoryMetric[];
}

export interface MonthlyAnalytics {
  start_date: string;
  end_date: string;
  total_activities: number;
  completed_activities: number;
  pending_activities: number;
  skipped_activities: number;
  completion_percentage: number;
  total_productive_hours: number;
}
