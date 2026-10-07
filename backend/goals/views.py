from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import date
from .models import Goal
from .serializers import GoalSerializer

class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Goal.objects.filter(user=user)
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

class GoalToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            goal = Goal.objects.get(pk=pk, user=request.user)
        except Goal.DoesNotExist:
            return Response({'error': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)

        goal.completed = not goal.completed
        goal.save()
        return Response(GoalSerializer(goal).data)
