from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """
    Django'nun AbstractUser'ı zaten 'username', 'email', 'first_name', 'last_name'
    gibi alanları içerir. Burada ek düzenlemeler yapabilir, login alanını değiştirebilirsiniz.
    """

    # E-posta alanını unique hale getirerek email bazlı login yapmayı hedefliyorsanız:
    email = models.EmailField(unique=True)
    is_superuser = models.BooleanField(default=False, editable=True)

    # Django'da kimlik doğrulaması için hangi alanın kullanılacağını belirtir.
    # Eğer username yerine email ile login yapılmasını istiyorsanız:
    USERNAME_FIELD = 'username'        # Artık kullanıcılar email ile giriş yapar
    REQUIRED_FIELDS = []  # USERNAME_FIELD olan username REQUIRED_FIELDS listesinden kaldırıldı



    class Meta:
        db_table = 'accounts_customuser'

    def __str__(self):
        # İsterseniz burada username veya email döndürebilirsiniz.
        # Email bazlı giriş yapıyorsanız email'i döndürmek mantıklı olabilir.
        return self.username
        # veya return self.email
