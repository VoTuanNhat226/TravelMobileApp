# Generated by Django 4.2.13 on 2024-05-29 08:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0018_post_trip_post'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trip',
            name='time_intend',
        ),
        migrations.AddField(
            model_name='trip',
            name='time_finish',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='trip',
            name='time_start',
            field=models.DateField(null=True),
        ),
    ]
