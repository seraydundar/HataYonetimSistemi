# accounts/views.py
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt

from .models import CustomUser
from .serializers import CustomUserSerializer
from .permissions import IsSuperUser  # Yeni oluşturduğumuz izin sınıfı

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = []  # Yeni kullanıcı kaydı için izin sınıfı gerekli değil

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def custom_login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "username ve password alanları gereklidir."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"error": "Kullanıcı adı veya şifre yanlış."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    login(request, user)
    user_data = CustomUserSerializer(user).data
    return Response(
        {
            "message": "Giriş başarılı.",
            "user": user_data
        },
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def custom_logout_view(request):
    logout(request)
    response = Response({"message": "Çıkış başarılı."}, status=status.HTTP_200_OK)
    response.delete_cookie(settings.SESSION_COOKIE_NAME)
    return response

custom_logout_view = csrf_exempt(custom_logout_view)

# Yeni oluşturduğumuz özel izin sınıfını kullanarak admin erişimini kontrol ediyoruz.
class CustomUserList(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsSuperUser]

class CustomUserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsSuperUser]
