# core/auth_views.py

from dj_rest_auth.views import LoginView as DjRestAuthLoginView
from rest_framework.response import Response
from rest_framework import status

class CustomLoginView(DjRestAuthLoginView):
    def post(self, request, *args, **kwargs):
        print("=== LOGIN REQUEST ===")
        print("Request data:", request.data)
        print("Headers:", request.headers)
        
        response = super().post(request, *args, **kwargs)
        
        print("=== LOGIN RESPONSE ===")
        print("Status:", response.status_code)
        print("Data:", response.data)
        
        return response