from rest_framework import serializers
from .models import Mood

class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = ['id', 'date', 'mood', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']
