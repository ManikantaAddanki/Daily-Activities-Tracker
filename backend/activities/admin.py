from django.contrib import admin
from .models import Activity

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'date', 'duration', 'priority', 'status')
    list_filter = ('category', 'priority', 'status', 'date')
    search_fields = ('title', 'description', 'notes', 'user__username')
