from django.db import models
from django.contrib.auth.models import User
from datetime import date

class Mood(models.Model):
    MOOD_CHOICES = [
        ('Excellent', '😄 Excellent'),
        ('Good', '🙂 Good'),
        ('Normal', '😐 Normal'),
        ('Bad', '😔 Bad'),
        ('Very Bad', '😫 Very Bad'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moods')
    date = models.DateField(default=date.today)
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.mood}"
