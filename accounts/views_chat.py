# src/views_chat.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()

class ConversationListView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Conversation.objects.all()
        else:
            # Normal kullanıcı: admin ile yapılan konuşmaları getirir.
            return Conversation.objects.filter(participants=user).filter(participants__is_superuser=True)

    def create(self, request, *args, **kwargs):
        partner_id = request.data.get('partnerId')
        if not partner_id:
            return Response({"detail": "partnerId gerekli."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            partner_user = User.objects.get(pk=partner_id)
        except User.DoesNotExist:
            return Response({"detail": "Partner bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        
        # Mevcut Conversation kontrolü
        conversation = Conversation.objects.filter(participants=request.user).filter(participants=partner_user).first()
        if conversation:
            serializer = self.get_serializer(conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Yeni Conversation oluşturma
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        conversation.participants.add(request.user)
        conversation.participants.add(partner_user)
        headers = self.get_success_headers(serializer.data)
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
     conversation_id = self.kwargs.get('conversation_id')
     return Message.objects.filter(conversation_id=conversation_id).order_by('timestamp')


    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_id')
        conversation = Conversation.objects.get(id=conversation_id)
        serializer.save(sender=self.request.user, conversation=conversation)
