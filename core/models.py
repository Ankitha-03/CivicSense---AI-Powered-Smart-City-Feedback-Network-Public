# core/models.py

from django.db import models
from django.contrib.auth.models import User

class Issue(models.Model):
    CATEGORY_CHOICES = [
        ("road_damage", "Road Damage"),
        ("garbage", "Garbage"),
        ("street_light", "Street Light"),
        ("water_leak", "Water Leak"),
        ("pollution", "Pollution"),
        ("illegal_dumping", "Illegal Dumping"),
        ("other", "Other"),
    ]

    SEVERITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default="other")
    severity = models.CharField(max_length=50, choices=SEVERITY_CHOICES, default="medium")
    
    contact = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    # ✅ Allow multiple photos — start with one ImageField for now
    photos = models.ImageField(upload_to="issue_photos/", blank=True, null=True)
    
    # ✅ Auto timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    # ✅ AI analysis fields (optional)
    ai_category = models.CharField(max_length=100, blank=True, null=True)
    ai_confidence = models.FloatField(blank=True, null=True)
    ai_analysis = models.JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} ({self.category})"
