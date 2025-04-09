# errors/urls.py
from django.urls import path
from .views import ErrorReportListCreate

urlpatterns = [
    path('errors/', ErrorReportListCreate.as_view(), name='error-list-create'),
]
