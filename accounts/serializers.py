# accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    # Şifre, sadece POST işlemleri için gönderilecek
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password')
    
    def create(self, validated_data):
        # create_user metodu, girilen düz şifreyi hashleyerek kaydeder
        user = CustomUser.objects.create_user(**validated_data)
        return user
