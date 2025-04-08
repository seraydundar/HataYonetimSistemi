# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    class Meta:
        db_table = 'accounts_customuser'
        
    def __str__(self):
        return self.username
