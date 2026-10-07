from django.contrib import admin
from .models import Goal

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'date', 'target', 'completed')
    list_filter = ('completed', 'date')
    search_fields = ('title', 'description', 'user__username')
