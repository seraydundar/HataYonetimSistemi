# errors/serializers.py

from rest_framework import serializers
from .models import ErrorReport

class ErrorReportSerializer(serializers.ModelSerializer):
    # Okunacak ek alanlar:
    user_id = serializers.ReadOnlyField(source='user.id')
    user_name = serializers.ReadOnlyField(source='user.username')
    # Eğer user tablosunda 'username' alanı yoksa, mesela 'email' varsa
    #user_name = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = ErrorReport
        fields = [
            'id',
            'user_id',
            'user_name',       # <-- user_name'i mutlaka fields listesine ekleyin
            'baslik',
            'konu',
            'aciklama',
            'oncelik',
            'durum',
            'olusturulma_tarihi',
        ]
        read_only_fields = ('olusturulma_tarihi',)

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)
