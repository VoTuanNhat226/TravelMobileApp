# Generated by Django 4.2.13 on 2024-05-24 03:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0010_place_active_post_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='like',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
