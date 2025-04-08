# accounts/urls.py

from django.urls import path
from .views import RegisterView, custom_login_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', custom_login_view, name='custom_login'),
]
