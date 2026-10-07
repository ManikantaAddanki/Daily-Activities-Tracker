from django.urls import path
from .views import GoalListCreateView, GoalDetailView, GoalToggleView

urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goal_list_create'),
    path('<int:pk>/', GoalDetailView.as_view(), name='goal_detail'),
    path('<int:pk>/toggle/', GoalToggleView.as_view(), name='goal_toggle'),
]
