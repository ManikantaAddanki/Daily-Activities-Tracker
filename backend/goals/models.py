from django.db import models
from django.contrib.auth.models import User
from datetime import date

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    date = models.DateField(default=date.today)
    target = models.CharField(max_length=100, blank=True, default='', help_text="e.g. '2 hours', '5 problems', '10 pages'")
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'completed', '-created_at']

    def __str__(self):
        return f"{self.title} - {'Done' if self.completed else 'Pending'}"
