from rest_framework import serializers
from .models import CustomUser, Conversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'created_by', 'created_at')
        read_only_fields = ('participants', 'created_by', 'created_at')

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    # Modeldeki 'content' alanını dışa 'message' olarak sunuyoruz
    message = serializers.CharField(source='content', read_only=True)
    # Conversation'ı PrimaryKeyRelatedField olarak sunuyoruz
    conversation = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'message', 'timestamp')


class CustomUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()  # Hesaplanan alan: role

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password', 'is_superuser', 'role')
        extra_kwargs = {
            'password': {'write_only': True},
            'is_superuser': {'required': False},
        }

    def get_role(self, obj):
        return "admin" if obj.is_superuser else "user"

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
