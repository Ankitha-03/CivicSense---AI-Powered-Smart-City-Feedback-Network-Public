"""
Root URL configuration for the CivicSense Django project.

URL routing strategy:
  - Citizen auth (/api/auth/login/, /api/auth/registration/) uses custom
    views registered BEFORE the dj_rest_auth include so Django's URL
    resolver matches them first, overriding the dj-rest-auth defaults.
  - Department auth uses a separate endpoint (/api/auth/department-login/).
  - Issue CRUD is served by IssueViewSet via DefaultRouter.
  - Department issue management uses a second router (dept_router).
  - The chatbot proxy lives at /api/chat/.
  - Media files are served by Django only in DEBUG mode; use a proper
    file server (nginx, S3) in production.

Module: civicsense_backend
Author: Ankitha
"""

# Third-party — Django
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Third-party — DRF / JWT
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Local
from core.views import (
    IssueViewSet,
    submit_issue,
    department_login,
    DepartmentIssueViewSet,
    department_stats,
    login_user,
    register_user,
)
from core.chat_views import ChatView

# ── Routers ────────────────────────────────────────────────────────────────

router = DefaultRouter()
router.register(r"issues", IssueViewSet, basename="issue")

dept_router = DefaultRouter()
dept_router.register(r"department/issues", DepartmentIssueViewSet, basename="dept-issue")

# ── URL patterns ───────────────────────────────────────────────────────────

urlpatterns = [
    path("admin/", admin.site.urls),

    # Issue endpoints (citizen)
    path("api/", include(router.urls)),
    path("api/", include(dept_router.urls)),
    path("api/submit-issue/", submit_issue, name="submit_issue"),

    # Auth — custom views must come before the dj_rest_auth include so
    # Django's resolver matches them first at the same path prefix.
    path("api/auth/department-login/", department_login,                        name="department_login"),
    path("api/auth/login/",            login_user,                              name="login_user"),
    path("api/auth/registration/",     register_user,                           name="register_user"),
    path("api/auth/",                  include("dj_rest_auth.urls")),
    path("api/auth/registration/",     include("dj_rest_auth.registration.urls")),
    path("api/auth/token/refresh/",    TokenRefreshView.as_view(),              name="token_refresh"),

    # Department stats summary
    path("api/department/stats/", department_stats, name="department_stats"),

    # AI chatbot proxy (rate-limited; calls Gemini on the backend)
    path("api/chat/", ChatView.as_view(), name="chat"),
]

# Serve uploaded media files during development only.
# In production, delegate this to nginx or a cloud storage bucket.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
