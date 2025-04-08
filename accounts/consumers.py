# accounts/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # URL'den user_id parametresini alıyoruz
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.group_name = f"notification_{self.user_id}"
        
        # Kullanıcıyı gruba ekliyoruz
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        
        # Bağlantı kurulduktan sonra bağlantı mesajı gönderiyoruz
        await self.send(json.dumps({
            "type": "notification",
            "message": "Notification WebSocket connected"
        }))

    async def disconnect(self, close_code):
        # Bağlantı koparken kullanıcıyı gruptan çıkartıyoruz
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_message(self, event):
        # Alınan bildirim mesajını WebSocket'e gönderiyoruz
        await self.send(text_data=json.dumps(event))
