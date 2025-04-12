from django.urls import path
from .views import custom_logout_view, custom_login_view, RegisterView, UserListView, CustomUserDetail

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', custom_login_view, name='login'),
    path('logout/', custom_logout_view, name='logout'),
    # Yönetici olmayan kullanıcıları listeleyen endpoint
    path('', UserListView.as_view(), name='user-list'),
    path('users/', UserListView.as_view(), name='user-list-alt'),
    # Belirli bir kullanıcı için detay endpoint'i (ör: /api/accounts/1/)
    path('<int:pk>/', CustomUserDetail.as_view(), name='user-detail'),
]
