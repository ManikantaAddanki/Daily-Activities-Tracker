from django.contrib import admin
from .models import Mood

@admin.register(Mood)
class MoodAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'mood', 'created_at')
    list_filter = ('mood', 'date')
    search_fields = ('user__username', 'note')
