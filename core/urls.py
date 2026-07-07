"""
UNUSED — URL configuration that predates the main civicsense_backend/urls.py.

Django's ROOT_URLCONF points to civicsense_backend.urls, so this file is
not included in any active URL routing. It is retained for reference only.

Active routing is defined in civicsense_backend/urls.py.

Module: core
Author: Ankitha
"""

# Third-party
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Local
from .views import register_user, login_user, get_user_profile, IssueViewSet

router = DefaultRouter()
router.register(r"issues", IssueViewSet, basename="issue")

urlpatterns = [
    path("auth/registration/", register_user,              name="registration"),
    path("auth/register/",     register_user,              name="register"),
    path("auth/login/",        login_user,                 name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/profile/",      get_user_profile,           name="profile"),
    path("",                   include(router.urls)),
]
