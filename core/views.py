"""
Views for the CivicSense core application.

Handles citizen authentication (register/login), issue submission and
retrieval, and department officer authentication and issue management.

Key design decisions:
  - Citizens authenticate with JWT tokens (simplejwt); the access token
    is also valid as a Bearer token against DRF's JWTAuthentication.
  - Department officers use a separate login endpoint that verifies the
    presence of a DepartmentProfile on the user account.
  - AI analysis (Gemini Vision) runs synchronously after issue save,
    wrapped in try/except so a vision API failure never blocks submission.

Module: core
Author: Ankitha
"""

# Standard library
# (none)

# Third-party — Django / DRF
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

# Local
from .models import Issue, Department
from .serializers import IssueSerializer, DepartmentIssueSerializer, StatusUpdateSerializer
from core.ai_analysis import analyze_issue_image as _gemini_analyze


# ---------------------------------------------------------------------------
# Custom permissions
# ---------------------------------------------------------------------------

class IsDepartmentOfficer(BasePermission):
    """
    Grants access only to authenticated users who have a DepartmentProfile.

    Used on all department-facing endpoints so that regular citizen accounts
    cannot access or modify department data.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "department_profile")
        )


# ---------------------------------------------------------------------------
# Citizen authentication endpoints
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new citizen account.

    Expects: { username, email, password } or { username, email, password1 }.
    Returns a JWT access/refresh pair and the user profile on success,
    or a 400 error with a descriptive message on validation failure.
    """
    username = request.data.get("username", "")
    email    = request.data.get("email", "")
    password = request.data.get("password1") or request.data.get("password", "")

    if not username or not email or not password:
        return Response({"error": "Username, email, and password are required."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "This username is already taken."}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "An account with this email already exists."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)

    # Embed username and first_name in the JWT payload so the frontend
    # can display the user's name without a separate /profile/ round-trip.
    refresh = RefreshToken.for_user(user)
    refresh["username"]   = user.username
    refresh["first_name"] = user.first_name or ""

    return Response({
        "message": "Account created successfully.",
        "user": {
            "id":         user.id,
            "username":   user.username,
            "email":      user.email,
            "first_name": user.first_name or "",
        },
        "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
    }, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """
    Authenticate a citizen and return a JWT access/refresh pair.

    Accepts login by email or username; the frontend sends email only.
    Returns 401 if credentials are invalid.
    """
    email    = request.data.get("email", "")
    username = request.data.get("username", "")
    password = request.data.get("password", "")

    if not password:
        return Response({"error": "Password is required."}, status=400)

    user = None

    # Try email-based lookup first (most common login method in the frontend)
    if email:
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    # Fall back to username if email lookup found nothing
    if not user and username:
        user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid email or password."}, status=401)

    refresh = RefreshToken.for_user(user)
    refresh["username"]   = user.username
    refresh["first_name"] = user.first_name or ""

    return Response({
        "message": "Login successful.",
        "user": {
            "id":         user.id,
            "username":   user.username,
            "email":      user.email,
            "first_name": user.first_name or "",
        },
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
    })


# ---------------------------------------------------------------------------
# Department officer authentication
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def department_login(request):
    """
    Authenticate a department officer and return a JWT pair.

    Validates that the authenticated user has an associated DepartmentProfile;
    returns 403 if a regular citizen account is used at this endpoint.
    """
    email    = request.data.get("email", "")
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
    dept    = user.department_profile.department

    return Response({
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id":                  user.id,
            "username":            user.username,
            "email":               user.email,
            "department_id":       dept.id,
            "department_name":     dept.name,
            "department_category": dept.assigned_category,
        },
    })


# ---------------------------------------------------------------------------
# Placeholder — not wired to any URL
# ---------------------------------------------------------------------------

def get_user_profile(_request):
    """Placeholder for a future citizen profile endpoint. Not currently active."""
    pass


# ---------------------------------------------------------------------------
# Citizen issue management
# ---------------------------------------------------------------------------

class IssueViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for citizen issue reports.

    Endpoints (all require citizen authentication):
      GET    /api/issues/          — list the current user's issues (filterable)
      POST   /api/issues/          — create a new issue
      GET    /api/issues/{id}/     — retrieve a single issue
      PATCH  /api/issues/{id}/     — update an issue
      DELETE /api/issues/{id}/     — delete an issue
      GET    /api/issues/weekly_report/ — anonymous; returns city-wide stats

    After a successful create, Gemini Vision analysis runs on the uploaded
    photo (if present). Analysis failure never blocks the response.
    """

    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Return issues belonging to the current user, with optional filters."""
        qs = Issue.objects.filter(user=self.request.user).order_by("-created_at")

        category     = self.request.query_params.get("category")
        status_param = self.request.query_params.get("status")
        severity     = self.request.query_params.get("severity")

        if category:
            qs = qs.filter(category__iexact=category)
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        if severity:
            qs = qs.filter(severity__iexact=severity)

        return qs

    def create(self, request, *args, **kwargs):
        """Save a new issue and trigger asynchronous AI vision analysis."""
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))
            msg = first_error[0] if isinstance(first_error, list) else str(first_error)
            return Response({"error": msg}, status=400)

        issue = serializer.save(user=request.user)
        _run_ai_on_issue(issue)

        return Response(serializer.data, status=201)

    def handle_exception(self, exc):
        """Normalise DRF 'detail' error keys to 'error' for consistent frontend handling."""
        response = super().handle_exception(exc)
        if isinstance(response.data, dict) and "detail" in response.data:
            response.data = {"error": str(response.data["detail"])}
        return response

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def weekly_report(self, request):
        """Return a city-wide weekly health report (public endpoint)."""
        try:
            from civicsense_backend.ai_module.report_generator import CityHealthReportGenerator
            generator = CityHealthReportGenerator(Issue)
            return Response(generator.generate_weekly_report())
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ---------------------------------------------------------------------------
# Department officer issue management
# ---------------------------------------------------------------------------

class DepartmentIssueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for department officers viewing their assigned issues.

    Includes a custom PATCH action at /api/department/issues/{id}/status/
    that allows officers to update status and add department notes.

    Auth: requires IsDepartmentOfficer permission (JWT Bearer token).
    """

    serializer_class   = DepartmentIssueSerializer
    permission_classes = [IsDepartmentOfficer]

    def get_queryset(self):
        """Return issues assigned to the logged-in officer's department."""
        dept = self.request.user.department_profile.department
        qs   = Issue.objects.filter(assigned_department=dept).order_by("-created_at")

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status__iexact=status_param)

        return qs

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        """
        Update the status (and optionally notes) of a single issue.

        Sets resolved_at automatically when status is changed to 'resolved'.
        """
        issue      = self.get_object()
        serializer = StatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data         = serializer.validated_data
        issue.status = data["status"]

        if data.get("department_notes"):
            issue.department_notes = data["department_notes"]

        # Record resolution timestamp the first time status reaches 'resolved'
        if data["status"] == "resolved" and not issue.resolved_at:
            issue.resolved_at = timezone.now()

        issue.save()
        return Response(DepartmentIssueSerializer(issue, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsDepartmentOfficer])
def department_stats(request):
    """
    Return aggregate issue counts for the logged-in officer's department.

    Returns: { department, total, pending, in_progress, resolved }
    """
    dept   = request.user.department_profile.department
    issues = Issue.objects.filter(assigned_department=dept)

    return Response({
        "department":  dept.name,
        "total":       issues.count(),
        "pending":     issues.filter(status="pending").count(),
        "in_progress": issues.filter(status="in_progress").count(),
        "resolved":    issues.filter(status="resolved").count(),
    })


# ---------------------------------------------------------------------------
# Legacy submit endpoint (kept for backward compatibility)
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_issue(request):
    """
    Alternative issue submission endpoint that accepts raw form data.

    This endpoint predates the IssueViewSet and remains active to avoid
    breaking any clients that POST directly to /api/submit-issue/.
    Prefer the ViewSet endpoint for new integrations.
    """
    serializer = IssueSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        issue = serializer.save(user=request.user)
        _run_ai_on_issue(issue)
        return Response({
            "message":      "Your report has been submitted successfully!",
            "issue_id":     issue.id,
            "category":     issue.category,
            "ai_category":  issue.ai_category,
            "ai_confidence": issue.ai_confidence,
        }, status=201)

    # Fallback: create the issue from raw request data if serializer validation fails.
    # This path is a legacy safety net; the serializer path is preferred.
    issue = Issue.objects.create(
        user        = request.user,
        title       = request.data.get("title", ""),
        description = request.data.get("description", ""),
        location    = request.data.get("location", ""),
        category    = request.data.get("category", ""),
        severity    = request.data.get("severity", "medium"),
        contact     = request.data.get("contact", ""),
        email       = request.data.get("email", ""),
        phone       = request.data.get("phone", ""),
        photos      = request.FILES.get("photos"),
    )
    _run_ai_on_issue(issue)

    return Response({
        "message":      "Your report has been submitted successfully!",
        "issue_id":     issue.id,
        "category":     issue.category,
        "ai_category":  issue.ai_category,
        "ai_confidence": issue.ai_confidence,
    }, status=201)


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

def _run_ai_on_issue(issue):
    """
    Run Gemini Vision analysis on the issue photo and persist the results.

    Called synchronously after issue creation. A failure at any point is
    silently caught so that AI unavailability never blocks a submission.

    Production note: this call blocks the HTTP response thread for the
    duration of the Gemini API round-trip (~1-3 s). Move to a Celery
    task for production deployments with higher traffic.
    """
    if not issue.photos:
        return

    try:
        result = _gemini_analyze(
            image_path  = issue.photos.path,
            title       = issue.title,
            description = issue.description,
            category    = issue.category,
        )
        if result:
            issue.ai_detected_category = result["detected_category"]
            issue.ai_confidence        = result["confidence"]
            issue.ai_matches_report    = result["matches_report"]
            issue.ai_description       = result["description"]
            issue.ai_severity          = result["severity_assessment"]
            issue.save(update_fields=[
                "ai_detected_category", "ai_confidence",
                "ai_matches_report", "ai_description", "ai_severity",
            ])
    except Exception:
        pass
