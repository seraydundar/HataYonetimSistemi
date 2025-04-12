from django.db import migrations

def set_default_created_by(apps, schema_editor):
    Conversation = apps.get_model('accounts', 'Conversation')
    User = apps.get_model('accounts', 'CustomUser')
    default_admin = User.objects.filter(is_superuser=True).first()
    if default_admin:
        Conversation.objects.filter(created_by__isnull=True).update(created_by=default_admin.id)

def reverse_func(apps, schema_editor):
    Conversation = apps.get_model('accounts', 'Conversation')
    Conversation.objects.filter().update(created_by=None)

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_conversation_created_by'),
    ]

    operations = [
        migrations.RunPython(set_default_created_by, reverse_func),
    ]
