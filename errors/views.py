# errors/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ErrorReport
from .serializers import ErrorReportSerializer

class ErrorReportListCreate(generics.ListCreateAPIView):
    serializer_class = ErrorReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ErrorReport.objects.all()
        user_id = self.request.query_params.get('userId')
        if user_id:
            queryset = queryset.filter(user__id=user_id)
        return queryset

    def perform_create(self, serializer):
        # request.user güvenilir kaynaktan geldiği için kullanabilirsiniz.
        serializer.save(user=self.request.user)
