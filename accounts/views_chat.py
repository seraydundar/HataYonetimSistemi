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
        if request.user.is_superuser:
            partner_id = request.data.get('partnerId')
            if not partner_id:
                return Response({"detail": "partnerId gerekli."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                partner_user = User.objects.get(pk=partner_id)
            except User.DoesNotExist:
                return Response({"detail": "Partner bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Normal kullanıcı: gönderilen partnerId'yi kontrol edelim.
            partner_id = request.data.get('partnerId')
            if partner_id:
                try:
                    partner_user = User.objects.get(pk=partner_id, is_superuser=True)
                except User.DoesNotExist:
                    return Response(
                        {"detail": "Seçilen partner admin değil veya bulunamadı."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # partnerId gönderilmemişse, ilk admin otomatik seçilsin.
                partner_user = User.objects.filter(is_superuser=True).first()
                if not partner_user:
                    return Response({"detail": "Admin kullanıcı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        # Mevcut Conversation kontrolü (her iki durumda da)
        conversation = Conversation.objects.filter(participants=request.user).filter(participants=partner_user).first()
        if conversation:
            serializer = self.get_serializer(conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Yeni Conversation oluşturma
        data = request.data.copy()
        data.pop('partnerId', None)  # Modelde bu alan yok.
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        # created_by alanı view tarafından set ediliyor.
        conversation = serializer.save(created_by=request.user)
        conversation.participants.add(request.user)
        conversation.participants.add(partner_user)
        headers = self.get_success_headers(serializer.data)
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        conversation = self.get_object()
        # Sadece superuserler ilgili endpoint'e ulaşabilir.
        if not request.user.is_superuser:
            return Response({"detail": "Yetkiniz yok."}, status=status.HTTP_403_FORBIDDEN)

        # Eğer tüm katılımcılar admin ise, herhangi bir admin bu sohbeti silebilir.
        admin_participants = conversation.participants.filter(is_superuser=True)
        if admin_participants.count() == conversation.participants.count():
            return super().destroy(request, *args, **kwargs)
        else:
            # Eğer sohbetin katılımcılarından biri admin değilse,
            # sadece sohbetin yaratıcısı (created_by) silme yetkisine sahip olsun.
            if conversation.created_by != request.user:
                return Response(
                    {"detail": "Bu sohbeti silemezsiniz. Yalnızca kendi oluşturduğunuz sohbetleri silebilirsiniz."},
                    status=status.HTTP_403_FORBIDDEN
                )
            return super().destroy(request, *args, **kwargs)

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
