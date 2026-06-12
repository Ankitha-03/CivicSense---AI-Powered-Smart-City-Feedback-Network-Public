from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Issue, Department


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "slug", "assigned_category", "email"]


class IssueSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    category = serializers.CharField(required=False, allow_blank=True)
    severity = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False)
    photos = serializers.ImageField(required=False, allow_null=True)
    photos_url = serializers.SerializerMethodField()
    assigned_department_name = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            "id", "user", "title", "description", "location",
            "category", "severity", "status", "contact", "email", "phone",
            "photos", "photos_url", "ai_category", "ai_confidence",
            "ai_analysis", "created_at", "assigned_department_name",
            "department_notes", "resolved_at", "updated_at",
            "latitude", "longitude",
            "ai_detected_category", "ai_matches_report", "ai_description", "ai_severity",
        ]
        read_only_fields = [
            "ai_category", "ai_confidence", "ai_analysis", "created_at",
            "photos_url", "assigned_department_name", "resolved_at", "updated_at",
            "ai_detected_category", "ai_matches_report", "ai_description", "ai_severity",
        ]

    def get_photos_url(self, obj):
        request = self.context.get("request")
        if obj.photos and request:
            return request.build_absolute_uri(obj.photos.url)
        return None

    def get_assigned_department_name(self, obj):
        if obj.assigned_department:
            return obj.assigned_department.name
        return None

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Issue title is required.")
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters.")
        return value.strip()

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Please describe the issue.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters.")
        return value.strip()

    def validate_location(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Location is required.")
        return value.strip()

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request else None
        if user and user.is_authenticated:
            validated_data["user"] = user
        return Issue.objects.create(**validated_data)


class DepartmentIssueSerializer(serializers.ModelSerializer):
    photos_url = serializers.SerializerMethodField()
    assigned_department_name = serializers.SerializerMethodField()
    reporter_name = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            "id", "title", "description", "location", "category", "severity",
            "status", "contact", "email", "phone", "photos_url",
            "ai_category", "ai_confidence", "created_at", "updated_at",
            "assigned_department_name", "department_notes", "resolved_at",
            "reporter_name",
        ]
        read_only_fields = [
            "id", "title", "description", "location", "category", "severity",
            "contact", "email", "phone", "photos_url", "ai_category",
            "ai_confidence", "created_at", "assigned_department_name", "reporter_name",
        ]

    def get_photos_url(self, obj):
        request = self.context.get("request")
        if obj.photos and request:
            return request.build_absolute_uri(obj.photos.url)
        return None

    def get_assigned_department_name(self, obj):
        if obj.assigned_department:
            return obj.assigned_department.name
        return None

    def get_reporter_name(self, obj):
        return obj.user.username if obj.user else None


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["pending", "in_progress", "resolved"])
    department_notes = serializers.CharField(required=False, allow_blank=True, default="")
