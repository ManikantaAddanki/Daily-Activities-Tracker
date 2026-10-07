from django.urls import path
from .views import MoodListCreateView, MoodDetailView, TodayMoodView

urlpatterns = [
    path('', MoodListCreateView.as_view(), name='mood_list_create'),
    path('today/', TodayMoodView.as_view(), name='mood_today'),
    path('<int:pk>/', MoodDetailView.as_view(), name='mood_detail'),
]
