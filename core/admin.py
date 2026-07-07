"""
Django admin registrations for the CivicSense core application.

Registers Department, DepartmentProfile, and Issue models so they are
accessible in the Django admin interface at /admin/.

Module: core
Author: Ankitha
"""

from django.contrib import admin

from .models import Department, DepartmentProfile, Issue


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin view for city departments."""

    list_display = ("name", "assigned_category", "email", "created_at")
    search_fields = ("name", "email")
    list_filter = ("assigned_category",)


@admin.register(DepartmentProfile)
class DepartmentProfileAdmin(admin.ModelAdmin):
    """Admin view for department officer accounts."""

    list_display = ("user", "department", "is_officer")
    list_filter = ("department",)


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    """Admin view for citizen issue reports."""

    list_display  = ("title", "category", "severity", "status", "user", "created_at")
    list_filter   = ("status", "category", "severity")
    search_fields = ("title", "description", "location")
    readonly_fields = (
        "created_at", "updated_at", "resolved_at",
        "ai_detected_category", "ai_confidence", "ai_matches_report",
        "ai_description", "ai_severity",
    )
