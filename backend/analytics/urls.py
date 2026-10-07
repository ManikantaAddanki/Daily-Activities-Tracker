from django.urls import path
from .views import (
    DashboardAnalyticsView,
    WeeklyAnalyticsView,
    MonthlyAnalyticsView,
    AIProductivityInsightsView
)

urlpatterns = [
    path('dashboard/', DashboardAnalyticsView.as_view(), name='analytics_dashboard'),
    path('weekly/', WeeklyAnalyticsView.as_view(), name='analytics_weekly'),
    path('monthly/', MonthlyAnalyticsView.as_view(), name='analytics_monthly'),
    path('insights/', AIProductivityInsightsView.as_view(), name='ai_insights'),
]
