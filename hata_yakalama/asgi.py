import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from accounts.consumers import NotificationConsumer

# Django ayarlarımızı hata_yakalama projesine göre ayarlıyoruz
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hata_yakalama.settings')

# HTTP istekleri için Django ASGI uygulamasını alıyoruz
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            
            path("ws/notification/<int:user_id>/", NotificationConsumer.as_asgi()),
            
        ])
    ),
})
