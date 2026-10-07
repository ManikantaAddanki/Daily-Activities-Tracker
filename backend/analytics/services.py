from datetime import date, timedelta
from django.db.models import Count, Sum, Q
from django.contrib.auth.models import User
from activities.models import Activity
from goals.models import Goal
from mood.models import Mood

def calculate_user_streaks(user: User):
    """
    Calculates current streak and longest streak based on calendar dates.
    A day is counted as active if the user completed at least 1 activity
    (or met their profile daily target if configured).
    """
    profile = getattr(user, 'profile', None)
    target = profile.daily_activity_target if profile else 1

    # Get all dates where completed activities count >= 1
    daily_completed = (
        Activity.objects.filter(user=user, status='Completed')
        .values('date')
        .annotate(completed_count=Count('id'))
        .order_by('-date')
    )

    completed_date_set = {entry['date'] for entry in daily_completed if entry['completed_count'] >= 1}
    
    if not completed_date_set:
        return {'current_streak': 0, 'longest_streak': 0}

    sorted_dates = sorted(list(completed_date_set), reverse=True)
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Calculate Current Streak
    current_streak = 0
    test_date = today
    if today not in completed_date_set:
        # If user hasn't completed today's target yet, streak might still be alive from yesterday
        if yesterday in completed_date_set:
            test_date = yesterday
        else:
            test_date = None

    if test_date:
        while test_date in completed_date_set:
            current_streak += 1
            test_date -= timedelta(days=1)

    # Calculate Longest Streak in history
    longest_streak = 0
    if sorted_dates:
        all_dates_asc = sorted(list(completed_date_set))
        temp_streak = 1
        longest_streak = 1
        for i in range(1, len(all_dates_asc)):
            if all_dates_asc[i] - all_dates_asc[i - 1] == timedelta(days=1):
                temp_streak += 1
            else:
                temp_streak = 1
            if temp_streak > longest_streak:
                longest_streak = temp_streak

    return {
        'current_streak': current_streak,
        'longest_streak': max(longest_streak, current_streak)
    }

def get_dashboard_summary(user: User):
    today = date.today()
    streaks = calculate_user_streaks(user)

    today_activities = Activity.objects.filter(user=user, date=today)
    total_today = today_activities.count()
    completed_today = today_activities.filter(status='Completed').count()
    pending_today = today_activities.filter(status__in=['Pending', 'In Progress']).count()
    skipped_today = today_activities.filter(status='Skipped').count()

    completion_percentage = int((completed_today / total_today * 100)) if total_today > 0 else 0

    today_goals = Goal.objects.filter(user=user, date=today)
    recent_activities = Activity.objects.filter(user=user).order_by('-date', '-created_at')[:8]
    today_mood = Mood.objects.filter(user=user, date=today).first()

    return {
        'today': today.isoformat(),
        'total_activities': total_today,
        'completed_activities': completed_today,
        'pending_activities': pending_today,
        'skipped_activities': skipped_today,
        'completion_percentage': completion_percentage,
        'current_streak': streaks['current_streak'],
        'longest_streak': streaks['longest_streak'],
        'today_goals_count': today_goals.count(),
        'today_goals_completed': today_goals.filter(completed=True).count(),
        'today_mood': today_mood.mood if today_mood else None,
        'today_mood_note': today_mood.note if today_mood else ''
    }

def get_weekly_analytics(user: User):
    today = date.today()
    start_of_week = today - timedelta(days=6) # Rolling 7 days
    activities = Activity.objects.filter(user=user, date__range=[start_of_week, today])

    day_labels = []
    days_data = []
    day_completion_map = {}

    for i in range(7):
        curr_d = start_of_week + timedelta(days=i)
        day_str = curr_d.strftime('%a')
        day_acts = activities.filter(date=curr_d)
        total = day_acts.count()
        completed = day_acts.filter(status='Completed').count()
        duration_minutes = day_acts.filter(status='Completed').aggregate(total_dur=Sum('duration'))['total_dur'] or 0
        
        day_completion_map[curr_d.strftime('%A')] = completed
        days_data.append({
            'date': curr_d.isoformat(),
            'day': day_str,
            'full_day': curr_d.strftime('%A'),
            'total': total,
            'completed': completed,
            'pending': day_acts.filter(status__in=['Pending', 'In Progress']).count(),
            'skipped': day_acts.filter(status='Skipped').count(),
            'productive_hours': round(duration_minutes / 60.0, 1)
        })

    total_count = activities.count()
    completed_count = activities.filter(status='Completed').count()
    pending_count = activities.filter(status__in=['Pending', 'In Progress']).count()
    skipped_count = activities.filter(status='Skipped').count()
    total_minutes = activities.filter(status='Completed').aggregate(Sum('duration'))['duration__sum'] or 0

    most_productive_day = max(day_completion_map, key=day_completion_map.get) if day_completion_map else "None"

    # Category breakdown
    cat_counts = (
        activities.filter(status='Completed')
        .values('category')
        .annotate(count=Count('id'), total_minutes=Sum('duration'))
        .order_by('-count')
    )
    most_active_cat = cat_counts[0]['category'] if cat_counts else "Work"

    return {
        'start_date': start_of_week.isoformat(),
        'end_date': today.isoformat(),
        'days': days_data,
        'total_activities': total_count,
        'completed_activities': completed_count,
        'pending_activities': pending_count,
        'skipped_activities': skipped_count,
        'completion_percentage': int((completed_count / total_count * 100)) if total_count > 0 else 0,
        'total_productive_hours': round(total_minutes / 60.0, 1),
        'most_productive_day': most_productive_day,
        'most_active_category': most_active_cat,
        'category_breakdown': list(cat_counts)
    }

def get_monthly_analytics(user: User):
    today = date.today()
    start_of_month = today - timedelta(days=29) # Rolling 30 days
    activities = Activity.objects.filter(user=user, date__range=[start_of_month, today])

    total_count = activities.count()
    completed_count = activities.filter(status='Completed').count()
    pending_count = activities.filter(status__in=['Pending', 'In Progress']).count()
    skipped_count = activities.filter(status='Skipped').count()
    total_minutes = activities.filter(status='Completed').aggregate(Sum('duration'))['duration__sum'] or 0

    return {
        'start_date': start_of_month.isoformat(),
        'end_date': today.isoformat(),
        'total_activities': total_count,
        'completed_activities': completed_count,
        'pending_activities': pending_count,
        'skipped_activities': skipped_count,
        'completion_percentage': int((completed_count / total_count * 100)) if total_count > 0 else 0,
        'total_productive_hours': round(total_minutes / 60.0, 1),
    }
