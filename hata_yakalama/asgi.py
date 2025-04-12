import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hata_yakalama.settings')

import django
django.setup()  # Django uygulamaları ve modeller tamamen yükleniyor

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path
from accounts.consumers import ChatConsumer, NotificationConsumer

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/chat/<int:conversation_id>/", ChatConsumer.as_asgi()),
            path("ws/notification/<int:user_id>/", NotificationConsumer.as_asgi()),
        ])
    ),
})
