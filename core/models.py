"""
Data models for the CivicSense core application.

Defines the three primary domain objects:
  - Department: a city department that owns a category of civic issues
  - DepartmentProfile: links a Django User to a Department as an officer
  - Issue: a civic problem report submitted by a citizen

Module: core
Author: Ankitha
"""

# Standard library
# (none)

# Django
from django.db import models
from django.contrib.auth.models import User


class Department(models.Model):
    """
    A city government department responsible for a category of civic issues.

    Each department is assigned exactly one category (e.g. 'sanitation'),
    and incoming issues are automatically routed to the matching department
    when the issue is saved.
    """

    CATEGORY_CHOICES = [
        ("infrastructure", "Infrastructure"),
        ("sanitation", "Sanitation"),
        ("public_safety", "Public Safety"),
        ("utilities", "Utilities"),
        ("transportation", "Transportation"),
        ("environment", "Environment"),
    ]

    name             = models.CharField(max_length=200)
    slug             = models.SlugField(unique=True)
    assigned_category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    email            = models.EmailField()
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class DepartmentProfile(models.Model):
    """
    Extends a Django User account to identify it as a department officer.

    A OneToOne relationship ensures each user can belong to at most one
    department. The presence of this profile is what the IsDepartmentOfficer
    permission checks.
    """

    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name="department_profile")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="officers")
    is_officer = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} — {self.department.name}"


class Issue(models.Model):
    """
    A civic issue report submitted by a citizen.

    Captures the full lifecycle of a report: submission details, media,
    AI analysis results, department assignment, and status progression.
    On creation the `save()` override automatically assigns the issue to
    the department matching its category.
    """

    CATEGORY_CHOICES = [
        ("infrastructure", "Infrastructure — Roads, bridges, sidewalks, public buildings"),
        ("sanitation",     "Sanitation — Garbage collection, waste management, cleanliness"),
        ("public_safety",  "Public Safety — Street lighting, traffic signals, security concerns"),
        ("utilities",      "Utilities — Water supply, electricity, gas, telecommunications"),
        ("transportation", "Transportation — Public transit, parking, traffic management"),
        ("environment",    "Environment — Parks, trees, pollution, noise complaints"),
    ]

    SEVERITY_CHOICES = [
        ("minor",    "Minor"),
        ("medium",   "Medium"),
        ("high",     "High"),
        ("critical", "Critical"),
    ]

    STATUS_CHOICES = [
        ("pending",     "Pending"),
        ("in_progress", "In Progress"),
        ("resolved",    "Resolved"),
    ]

    # ── Core report fields ──────────────────────────────────────────────────
    user        = models.ForeignKey(User, on_delete=models.CASCADE)
    title       = models.CharField(max_length=255)
    description = models.TextField()
    location    = models.CharField(max_length=255)
    category    = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default="other")
    severity    = models.CharField(max_length=50, choices=SEVERITY_CHOICES, default="medium")

    # ── Optional contact details ────────────────────────────────────────────
    contact = models.CharField(max_length=100, blank=True, null=True)
    email   = models.EmailField(blank=True, null=True)
    phone   = models.CharField(max_length=15, blank=True, null=True)

    # ── Media ───────────────────────────────────────────────────────────────
    photos = models.ImageField(upload_to="issue_photos/", blank=True, null=True)

    # ── Status tracking ─────────────────────────────────────────────────────
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    # ── Legacy AI fields (populated by old CLIP classifier; kept for
    #    backward compatibility with existing rows) ──────────────────────────
    ai_category  = models.CharField(max_length=100, blank=True, null=True)
    ai_confidence = models.FloatField(blank=True, null=True)
    ai_analysis  = models.JSONField(blank=True, null=True)

    # ── Gemini Vision analysis fields ───────────────────────────────────────
    ai_detected_category = models.CharField(max_length=50, blank=True, default="")
    ai_matches_report    = models.BooleanField(null=True, blank=True)
    ai_description       = models.CharField(max_length=255, blank=True, default="")
    ai_severity          = models.CharField(max_length=20, blank=True, default="")

    # ── Department assignment and resolution ────────────────────────────────
    assigned_department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="issues"
    )
    department_notes = models.TextField(blank=True, default="")
    resolved_at      = models.DateTimeField(null=True, blank=True)
    updated_at       = models.DateTimeField(auto_now=True)

    # ── Geolocation (set by the browser Geolocation API on the frontend) ────
    latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def save(self, *args, **kwargs):
        """Auto-assign the matching department when a new issue is created."""
        if not self.pk and not self.assigned_department_id and self.category:
            dept = Department.objects.filter(assigned_category=self.category).first()
            if dept:
                self.assigned_department = dept
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.category})"
