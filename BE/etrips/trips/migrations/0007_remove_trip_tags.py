# Generated by Django 4.2.11 on 2024-04-28 11:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0006_rename_name_place_title_rename_name_trip_title_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trip',
            name='tags',
        ),
    ]
