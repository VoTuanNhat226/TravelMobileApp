# Generated by Django 4.2.13 on 2024-05-31 00:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0023_alter_trip_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='trip_list',
            field=models.ManyToManyField(blank=True, null=True, related_name='trip_list', to='trips.trip'),
        ),
    ]