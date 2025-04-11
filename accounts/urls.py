from django.urls import path
from .views import custom_logout_view, custom_login_view, RegisterView, CustomUserList, CustomUserDetail

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', custom_login_view, name='login'),
    path('logout/', custom_logout_view, name='logout'),
    path('', CustomUserList.as_view(), name='user-list'),  # /api/accounts/ isteği bu view ile karşılanır.
    path('<int:pk>/', CustomUserDetail.as_view(), name='user-detail'),
]
