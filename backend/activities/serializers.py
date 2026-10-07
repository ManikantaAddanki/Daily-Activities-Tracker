from rest_framework import serializers
from .models import Activity

class ActivitySerializer(serializers.ModelSerializer):
    duration_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id',
            'title',
            'description',
            'category',
            'date',
            'start_time',
            'end_time',
            'duration',
            'duration_formatted',
            'priority',
            'status',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration_formatted']

    def get_duration_formatted(self, obj):
        mins = obj.duration or 0
        hours = mins // 60
        rem_mins = mins % 60
        if hours > 0 and rem_mins > 0:
            return f"{hours}h {rem_mins}m"
        elif hours > 0:
            return f"{hours}h"
        return f"{mins}m"

    def validate(self, attrs):
        start = attrs.get('start_time') or getattr(self.instance, 'start_time', None)
        end = attrs.get('end_time') or getattr(self.instance, 'end_time', None)
        if start and end and start >= end:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})
        return attrs
