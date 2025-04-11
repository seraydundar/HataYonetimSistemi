# accounts/permissions.py

from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    """
    Bu izin sınıfı, sadece is_superuser True olan kullanıcıların
    erişim iznine sahip olmasını sağlar.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)
