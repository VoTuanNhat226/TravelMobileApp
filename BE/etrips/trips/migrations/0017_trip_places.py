# Generated by Django 4.2.13 on 2024-05-29 02:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0016_remove_post_image_user_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='trip',
            name='places',
            field=models.ManyToManyField(blank=True, null=True, related_name='place', to='trips.place'),
        ),
    ]
