from django.contrib import admin
from .models import Journal

@admin.register(Journal)
class JournalAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'created_at', 'updated_at')
    search_fields = ('user__username', 'accomplishments', 'improvements', 'content')
    list_filter = ('date',)
