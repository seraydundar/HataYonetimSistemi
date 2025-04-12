import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from .models import Message, Conversation

User = get_user_model()

# Mesajı veritabanına kaydedip, Message objesini döndüren yardımcı fonksiyon
@sync_to_async
def save_message(sender_id, conversation_id, message_text):
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        sender = User.objects.get(id=sender_id)
        message = Message.objects.create(sender=sender, conversation=conversation, content=message_text)
        return message
    except Exception as e:
        print("save_message error:", e)
        return None

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'notifications_{self.user_id}'
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'notify',
                    'message': message,
                }
            )
        except Exception as e:
            print("NotificationConsumer receive error:", e)

    async def notify(self, event):
        try:
            message = event['message']
            await self.send(text_data=json.dumps({
                'message': message,
            }))
        except Exception as e:
            print("NotificationConsumer notify error:", e)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # URL'den conversation_id'yi alıyoruz.
            self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
            self.room_group_name = f'chat_{self.conversation_id}'
            
            # Konuşma odasına (conversation room) katılıyoruz.
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            print(f"WebSocket accepted for conversation {self.conversation_id}")
        except Exception as e:
            print("ChatConsumer connect error:", e)
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            print("ChatConsumer disconnect error:", e)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_text = data.get('message', '')
            sender_id = data.get('senderId')
            
            # Mesajı veritabanına kaydet
            saved_message = await save_message(sender_id, self.conversation_id, message_text)
            
            # Eğer mesaj veritabanına kaydedildiyse, grup üzerinden tüm bağlı istemcilere yayınla
            if saved_message:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message_text,
                        'senderId': sender_id,
                    }
                )
        except Exception as e:
            print("ChatConsumer receive error:", e)

    async def chat_message(self, event):
        try:
            message = event['message']
            sender_id = event['senderId']
            await self.send(text_data=json.dumps({
                'message': message,
                'senderId': sender_id,
            }))
        except Exception as e:
            print("ChatConsumer chat_message error:", e)
