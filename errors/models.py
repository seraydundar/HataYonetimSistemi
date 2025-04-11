# errors/models.py
from django.db import models
from django.conf import settings

class ErrorReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    baslik = models.CharField(max_length=100)
    konu = models.CharField(max_length=200)
    aciklama = models.TextField()
    oncelik = models.CharField(max_length=20, default='Düşük')
    durum = models.CharField(max_length=20, default='Beklemede')
    olusturulma_tarihi = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.baslik



