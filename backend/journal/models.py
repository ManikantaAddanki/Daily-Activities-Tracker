from django.db import models
from django.contrib.auth.models import User
from datetime import date

class Journal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals')
    date = models.DateField(default=date.today)
    accomplishments = models.TextField(blank=True, default='', help_text="What did you accomplish today?")
    improvements = models.TextField(blank=True, default='', help_text="What can you improve tomorrow?")
    content = models.TextField(blank=True, default='', help_text="General notes or reflections")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-updated_at']
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - Journal {self.date}"
