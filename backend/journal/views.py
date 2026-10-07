from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import date
from .models import Journal
from .serializers import JournalSerializer

class JournalListCreateView(generics.ListCreateAPIView):
    serializer_class = JournalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Journal.objects.filter(user=user)
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
        return queryset

    def create(self, request, *args, **kwargs):
        target_date = request.data.get('date', str(date.today()))
        journal = Journal.objects.filter(user=request.user, date=target_date).first()

        if journal:
            serializer = self.get_serializer(journal, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class JournalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JournalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Journal.objects.filter(user=self.request.user)

class TodayJournalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = date.today()
        journal = Journal.objects.filter(user=request.user, date=today).first()
        if journal:
            return Response(JournalSerializer(journal).data)
        return Response({
            'date': str(today),
            'accomplishments': '',
            'improvements': '',
            'content': ''
        })
