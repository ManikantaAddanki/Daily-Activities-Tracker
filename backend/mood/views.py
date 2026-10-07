from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import date
from .models import Mood
from .serializers import MoodSerializer

class MoodListCreateView(generics.ListCreateAPIView):
    serializer_class = MoodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Mood.objects.filter(user=user)
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
        return queryset

    def create(self, request, *args, **kwargs):
        # Allow update if entry for date already exists
        target_date = request.data.get('date', str(date.today()))
        mood_instance = Mood.objects.filter(user=request.user, date=target_date).first()

        if mood_instance:
            serializer = self.get_serializer(mood_instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MoodDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = MoodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Mood.objects.filter(user=self.request.user)

class TodayMoodView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = date.today()
        mood = Mood.objects.filter(user=request.user, date=today).first()
        if mood:
            return Response(MoodSerializer(mood).data)
        return Response({'date': str(today), 'mood': None, 'note': ''})
