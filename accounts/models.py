from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    """
    Django'nun AbstractUser'ı zaten 'username', 'email', 'first_name', 'last_name'
    gibi alanları içerir. Ek olarak email alanını unique yaptık.
    """
    email = models.EmailField(unique=True)
    # Django zaten is_superuser alanını oluşturduğundan gerek olmayabilir, fakat ihtiyaç duyuyorsanız
    is_superuser = models.BooleanField(default=False, editable=True)

    # Kullanıcıların giriş için hangi alanı kullandığını belirler.
    USERNAME_FIELD = 'username'  
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'accounts_customuser'

    def __str__(self):
        return self.username

class Conversation(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='created_conversations',
        on_delete=models.CASCADE
        # Artık null=False (default) olacak
    )

    def __str__(self):
        return ", ".join([user.username for user in self.participants.all()])






class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name="messages", on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Mesajın kısa bir özetini döndürür.
        return f"{self.sender.username}: {self.content[:20]}"
