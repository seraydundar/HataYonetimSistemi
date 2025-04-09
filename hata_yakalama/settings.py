"""
Django settings for hata_Ayıklama project.
"""

from pathlib import Path
from datetime import timedelta

# Proje kök dizini
BASE_DIR = Path(__file__).resolve().parent.parent

# Güvenlik Ayarları
SECRET_KEY = 'django-insecure-cxzdzr-hi^d(im3ml&g47!xch=7!qqbi2m$mpt9cx^)i+zl&ic'
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']

# Uygulamalar
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'corsheaders',  # CORS için
    'rest_framework',
    'channels',     # Django Channels (WebSocket Desteği)
    'accounts',     # Kullanıcı işlemleri için oluşturduğumuz app
    'errors',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ROOT_URLCONF = 'hata_yakalama.urls'

# Middleware (CORS en üstte olması gerek)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Ayarları
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = [
    'authorization',
    'content-type',
    'x-requested-with',
    'accept',
]

# WebSocket (Channels) Yapılandırması: Redis kullanımı
ASGI_APPLICATION = "hata_yakalama.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [("127.0.0.1", 6379)]},
    },
}

# Veritabanı Ayarları (PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'hata_ayiklama',
        'USER': 'postgres',
        'PASSWORD': '1963',
        'HOST': 'localhost',
        'PORT': '5433',
    }
}

# REST Framework Ayarları
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT ayarları (varsa)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=31),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

AUTH_USER_MODEL = 'accounts.CustomUser'

# Statik Dosyalar
STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Loglama
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
        'file': {'class': 'logging.FileHandler', 'filename': 'hata_ayıklama.log'},
    },
    'loggers': {
        'django': {'handlers': ['console', 'file'], 'level': 'INFO'},
        'hata_ayıklama': {'handlers': ['console', 'file'], 'level': 'DEBUG', 'propagate': True},
    },
}

# Cache (Redis) Ayarları
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
    }
}

# settings.py
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


# Ek olarak session cookie ayarları:
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False
