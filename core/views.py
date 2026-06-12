from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from .models import Issue, Department
from .serializers import IssueSerializer, DepartmentIssueSerializer, StatusUpdateSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser

from core.ai_analysis import analyze_issue_image as _gemini_analyze


class IsDepartmentOfficer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "department_profile")
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get("username", "")
    email = request.data.get("email", "")
    password = request.data.get("password1") or request.data.get("password", "")

    if not username or not email or not password:
        return Response({"error": "Username, email, and password are required."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "This username is already taken."}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "An account with this email already exists."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    refresh = RefreshToken.for_user(user)
    refresh["username"] = user.username
    refresh["first_name"] = user.first_name or ""
    return Response({
        "message": "Account created successfully.",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name or "",
        },
        "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
    }, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get("email", "")
    username = request.data.get("username", "")
    password = request.data.get("password", "")

    if not password:
        return Response({"error": "Password is required."}, status=400)

    user = None
    if email:
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    if not user and username:
        user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid email or password."}, status=401)

    refresh = RefreshToken.for_user(user)
    refresh["username"] = user.username
    refresh["first_name"] = user.first_name or ""
    return Response({
        "message": "Login successful.",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name or "",
        },
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def department_login(request):
    email = request.data.get("email", "")
    username = request.data.get("username", "")
    password = request.data.get("password", "")

    if not password:
        return Response({"error": "Password is required."}, status=400)

    user = None
    if email:
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    if not user and username:
        user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid credentials."}, status=401)

    if not hasattr(user, "department_profile"):
        return Response({"error": "This account is not a department officer account."}, status=403)

    refresh = RefreshToken.for_user(user)
    dept = user.department_profile.department
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "department_id": dept.id,
            "department_name": dept.name,
            "department_category": dept.assigned_category,
        },
    })


def get_user_profile(_request):
    pass


class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Issue.objects.filter(user=self.request.user).order_by("-created_at")
        category = self.request.query_params.get("category")
        status_param = self.request.query_params.get("status")
        severity = self.request.query_params.get("severity")
        if category:
            qs = qs.filter(category__iexact=category)
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        if severity:
            qs = qs.filter(severity__iexact=severity)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))
            msg = first_error[0] if isinstance(first_error, list) else str(first_error)
            return Response({"error": msg}, status=400)

        issue = serializer.save(user=request.user)

        _run_ai_on_issue(issue)
        return Response(serializer.data, status=201)

    def handle_exception(self, exc):
        response = super().handle_exception(exc)
        if isinstance(response.data, dict) and "detail" in response.data:
            response.data = {"error": str(response.data["detail"])}
        return response

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def weekly_report(self, request):
        try:
            from civicsense_backend.ai_module.report_generator import CityHealthReportGenerator
            generator = CityHealthReportGenerator(Issue)
            return Response(generator.generate_weekly_report())
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class DepartmentIssueViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DepartmentIssueSerializer
    permission_classes = [IsDepartmentOfficer]

    def get_queryset(self):
        dept = self.request.user.department_profile.department
        qs = Issue.objects.filter(assigned_department=dept).order_by("-created_at")
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        return qs

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        issue = self.get_object()
        serializer = StatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data
        issue.status = data["status"]
        if data.get("department_notes"):
            issue.department_notes = data["department_notes"]
        if data["status"] == "resolved" and not issue.resolved_at:
            from django.utils import timezone
            issue.resolved_at = timezone.now()
        issue.save()
        return Response(DepartmentIssueSerializer(issue, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsDepartmentOfficer])
def department_stats(request):
    dept = request.user.department_profile.department
    issues = Issue.objects.filter(assigned_department=dept)
    return Response({
        "department": dept.name,
        "total": issues.count(),
        "pending": issues.filter(status="pending").count(),
        "in_progress": issues.filter(status="in_progress").count(),
        "resolved": issues.filter(status="resolved").count(),
    })


def _run_ai_on_issue(issue):
    """Run Gemini Vision analysis on the issue photo. Failure never blocks submission."""
    if not issue.photos:
        return
    try:
        result = _gemini_analyze(
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
    except Exception:
        pass


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_issue(request):
    serializer = IssueSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        issue = serializer.save(user=request.user)
        _run_ai_on_issue(issue)
        return Response({
            "message": "Your report has been submitted successfully!",
            "issue_id": issue.id,
            "category": issue.category,
            "ai_category": issue.ai_category,
            "ai_confidence": issue.ai_confidence,
        }, status=201)

    issue = Issue.objects.create(
        user=request.user,
        title=request.data.get("title", ""),
        description=request.data.get("description", ""),
        location=request.data.get("location", ""),
        category=request.data.get("category", ""),
        severity=request.data.get("severity", "medium"),
        contact=request.data.get("contact", ""),
        email=request.data.get("email", ""),
        phone=request.data.get("phone", ""),
        photos=request.FILES.get("photos"),
    )
    _run_ai_on_issue(issue)
    return Response({
        "message": "Your report has been submitted successfully!",
        "issue_id": issue.id,
        "category": issue.category,
        "ai_category": issue.ai_category,
        "ai_confidence": issue.ai_confidence,
    }, status=201)
