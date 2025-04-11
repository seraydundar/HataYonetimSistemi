# accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser  # Veya kullandığınız kullanıcı modelini import edin

class CustomUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()  # Computed field for role

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password', 'is_superuser', 'role')
        extra_kwargs = {
            'password': {'write_only': True},  # Şifreyi yazma amaçlı tutulur
            'is_superuser': {'required': False},  # İsteğe bağlı olarak güncellenebilir
        }

    def get_role(self, obj):
        return "admin" if obj.is_superuser else "user"

    def update(self, instance, validated_data):
        # Şifre alanı geldiyse, şifreyi hashleyerek atayın.
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
