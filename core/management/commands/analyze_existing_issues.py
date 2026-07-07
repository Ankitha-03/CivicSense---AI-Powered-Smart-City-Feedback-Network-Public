"""
Management command: analyze_existing_issues

Backfills Gemini Vision analysis for issues that have an uploaded photo
but were submitted before the AI analysis feature was added (or before the
Django server was restarted after the feature was deployed).

Usage:
    python manage.py analyze_existing_issues

A 5-second delay between each API call respects the Gemini free-tier
rate limit of 15 requests per minute.

Module: core.management.commands
Author: Ankitha
"""

# Standard library
import time

# Third-party
from django.core.management.base import BaseCommand

# Local
from core.models import Issue
from core.ai_analysis import analyze_issue_image


class Command(BaseCommand):
    """Gemini Vision backfill for existing issue photos."""

    help = "Run Gemini Vision analysis on issues that have photos but no AI analysis yet."

    def handle(self, *args, **options):
        qs = (
            Issue.objects
            .filter(photos__isnull=False)
            .exclude(photos="")
            .filter(ai_detected_category="")
            .order_by("id")
        )
        total = qs.count()
        self.stdout.write(f"Found {total} issues with unanalyzed photos.")

        for i, issue in enumerate(qs, 1):
            self.stdout.write(f"[{i}/{total}] Issue #{issue.id}: {issue.title[:60]}")
            try:
                result = analyze_issue_image(
                    image_path=issue.photos.path,
                    title=issue.title,
                    description=issue.description,
                    category=issue.category,
                )
                if result:
                    issue.ai_detected_category = result["detected_category"]
                    issue.ai_confidence = result["confidence"]
                    issue.ai_matches_report = result["matches_report"]
                    issue.ai_description = result["description"]
                    issue.ai_severity = result["severity_assessment"]
                    issue.save(update_fields=[
                        "ai_detected_category", "ai_confidence",
                        "ai_matches_report", "ai_description", "ai_severity",
                    ])
                    self.stdout.write(self.style.SUCCESS(
                        f"  -> {result['detected_category']} ({result['confidence']}%)"
                    ))
                else:
                    self.stdout.write("  -> No result returned, skipping.")
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"  -> Error: {exc}"))

            if i < total:
                time.sleep(5)  # Respect free-tier rate limits between requests

        self.stdout.write(self.style.SUCCESS("Done."))
