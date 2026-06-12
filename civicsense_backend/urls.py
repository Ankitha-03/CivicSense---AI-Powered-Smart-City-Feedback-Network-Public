# civicsense_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import IssueViewSet, submit_issue, department_login, DepartmentIssueViewSet, department_stats, login_user, register_user
from core.chat_views import ChatView

router = DefaultRouter()
router.register(r'issues', IssueViewSet, basename='issue')

dept_router = DefaultRouter()
dept_router.register(r'department/issues', DepartmentIssueViewSet, basename='dept-issue')

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include(router.urls)),
    path('api/', include(dept_router.urls)),
    path('api/submit-issue/', submit_issue, name='submit_issue'),

    # department-login and custom auth MUST come before dj_rest_auth includes
    path('api/auth/department-login/', department_login, name='department_login'),
    path('api/auth/login/', login_user, name='login_user'),
    path('api/auth/registration/', register_user, name='register_user'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/department/stats/', department_stats, name='department_stats'),
    path('api/chat/', ChatView.as_view(), name='chat'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
