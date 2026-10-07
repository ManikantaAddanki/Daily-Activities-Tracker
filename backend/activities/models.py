from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, date

class Activity(models.Model):
    CATEGORY_CHOICES = [
        ('Study', 'Study'),
        ('Coding', 'Coding'),
        ('Work', 'Work'),
        ('Exercise', 'Exercise'),
        ('Health', 'Health'),
        ('Reading', 'Reading'),
        ('Personal', 'Personal'),
        ('Entertainment', 'Entertainment'),
        ('Other', 'Other'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Skipped', 'Skipped'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Work')
    date = models.DateField(default=date.today)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=30, help_text="Duration in minutes")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', 'start_time', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f"{self.title} ({self.date}) - {self.status}"

    def save(self, *args, **kwargs):
        # Auto calculate duration if start_time and end_time are provided
        if self.start_time and self.end_time:
            t1 = datetime.combine(date.min, self.start_time)
            t2 = datetime.combine(date.min, self.end_time)
            diff = (t2 - t1).total_seconds() / 60
            if diff > 0:
                self.duration = int(diff)
        super().save(*args, **kwargs)
