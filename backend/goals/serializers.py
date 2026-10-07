from rest_framework import serializers
from .models import Goal

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'title', 'description', 'date', 'target', 'completed', 'created_at']
        read_only_fields = ['id', 'created_at']
