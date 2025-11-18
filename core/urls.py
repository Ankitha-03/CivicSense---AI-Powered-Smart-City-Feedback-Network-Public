from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_user, 
    login_user,
    get_user_profile, 
    
    IssueViewSet

)
from .views import IssueViewSet, analyze_issue_image
from rest_framework_simplejwt.views import TokenRefreshView


# Create a router for ViewSets
router = DefaultRouter()
router.register(r'issues', IssueViewSet, basename='issue')

urlpatterns = [
    # ✅ ADD THIS: The endpoint your frontend is calling
    path('auth/registration/', register_user, name='registration'),
    
    # Custom authentication endpoints (Simple JWT)
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #path('auth/profile/', get_user_profile, name='profile'),
    path('', include(router.urls)),
    path('ai/analyze/', analyze_issue_image, name='analyze_issue_image'),  # 🧠 New AI route
    
    # Include router URLs for issues
    path('', include(router.urls)),
]