# errors/views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ErrorReport
from .serializers import ErrorReportSerializer

class ErrorReportListCreate(generics.ListCreateAPIView):
    serializer_class = ErrorReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Gelen sorgu parametresindeki "user" değerini alıyoruz
        user_param = self.request.query_params.get('user')
        # Eğer giriş yapan kullanıcı superuser ise ve "user" parametresi varsa,
        # sadece belirtilen kullanıcıya ait hata raporlarını döndür.
        if self.request.user.is_superuser and user_param:
            return ErrorReport.objects.filter(user__id=user_param)
        # Süper kullanıcı ise ve parametre verilmemişse tüm hata raporlarını döndür.
        if self.request.user.is_superuser:
            return ErrorReport.objects.all()
        # Diğer kullanıcılar için, sadece kendi oluşturdukları hata raporlarını döndür.
        return ErrorReport.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ErrorReportDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ErrorReportSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        # Eğer giriş yapan kullanıcı superuser ise tüm hata raporlarını döndür
        if self.request.user.is_superuser:
            return ErrorReport.objects.all()
        # Diğer durumlarda yalnızca kendi hatalarını döndür
        return ErrorReport.objects.filter(user=self.request.user)
