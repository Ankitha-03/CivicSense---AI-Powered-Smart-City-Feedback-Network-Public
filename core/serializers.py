# core/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Issue

# ==========================
# 🔹 USER SERIALIZER
# ==========================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


# ==========================
# 🔹 ISSUE SERIALIZER
# ==========================
class IssueSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Nested user info (read-only)
    photos = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Issue
        fields = [
            "id",
            "user",
            "title",
            "description",
            "location",
            "category",
            "severity",
            "contact",
            "email",
            "phone",
            "photos",
            "ai_category",
            "ai_confidence",
            "ai_analysis",
            "created_at",
        ]
        read_only_fields = ["ai_category", "ai_confidence", "ai_analysis", "created_at"]

    def create(self, validated_data):
        """
        Automatically assign the logged-in user when creating a new Issue.
        """
        request = self.context.get("request")
        user = request.user if request else None
        if user and user.is_authenticated:
            validated_data["user"] = user

        issue = Issue.objects.create(**validated_data)
        return issue
