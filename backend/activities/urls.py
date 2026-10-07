from django.urls import path
from .views import ActivityListCreateView, ActivityDetailView, ActivityStatusUpdateView

urlpatterns = [
    path('', ActivityListCreateView.as_view(), name='activity_list_create'),
    path('<int:pk>/', ActivityDetailView.as_view(), name='activity_detail'),
    path('<int:pk>/status/', ActivityStatusUpdateView.as_view(), name='activity_status_update'),
]
