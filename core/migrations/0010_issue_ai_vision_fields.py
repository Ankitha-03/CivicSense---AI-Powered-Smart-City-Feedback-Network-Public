from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_issue_latitude_longitude'),
    ]

    operations = [
        migrations.AddField(
            model_name='issue',
            name='ai_detected_category',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='issue',
            name='ai_matches_report',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='issue',
            name='ai_description',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='issue',
            name='ai_severity',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
