# accounts/views.py

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt

from .models import CustomUser
from .serializers import CustomUserSerializer

class RegisterView(generics.CreateAPIView):
    """
    Kullanıcı kayıt view.
    POST /api/accounts/register/
    Gövde: { "username": <str>, "email": <str>, "password": <str> }
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login_view(request):
    """
    Kullanıcı giriş view.
    POST /api/accounts/login/
    Gövde: { "username": <str>, "password": <str> }
    """
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

    # Kullanıcı doğrulandı, session'a ekleyelim.
    login(request, user)
    return Response(
        {
            "message": "Giriş başarılı.",
            "user_id": user.id,
            "username": user.username,
        },
        status=status.HTTP_200_OK
    )
