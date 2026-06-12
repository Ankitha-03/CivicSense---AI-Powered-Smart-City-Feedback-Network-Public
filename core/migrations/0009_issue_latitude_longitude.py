from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_department_issue_department_notes_issue_resolved_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='issue',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='issue',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
    ]
