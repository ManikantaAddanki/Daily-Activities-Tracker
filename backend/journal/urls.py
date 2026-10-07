from django.urls import path
from .views import JournalListCreateView, JournalDetailView, TodayJournalView

urlpatterns = [
    path('', JournalListCreateView.as_view(), name='journal_list_create'),
    path('today/', TodayJournalView.as_view(), name='journal_today'),
    path('<int:pk>/', JournalDetailView.as_view(), name='journal_detail'),
]
