# errors/urls.py
from django.urls import path
from .views import ErrorReportListCreate, ErrorReportDetail

urlpatterns = [
    path('errors/', ErrorReportListCreate.as_view(), name='error-list-create'),
    path('errors/<int:pk>/', ErrorReportDetail.as_view(), name='error-detail'),
]
