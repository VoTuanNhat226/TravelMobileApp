# Generated by Django 4.2.13 on 2024-06-16 01:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0025_alter_trip_time_finish_alter_trip_time_start'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trip',
            name='view',
            field=models.CharField(default=None, max_length=100, null=True),
        ),
    ]