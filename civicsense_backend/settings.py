"""
Django settings for the CivicSense backend project.

Non-default configuration choices:
  - CORS: permissive in DEBUG so the Vite dev server (any localhost port)
    can reach the API without proxy issues.
  - REST_FRAMEWORK: both TokenAuthentication (DRF tokens, legacy) and
    JWTAuthentication (simplejwt) are enabled so the same API accepts
    either credential format. Citizens receive JWT; the old dj-rest-auth
    session flow is still present for admin.
  - SIMPLE_JWT: long-lived tokens (1 day access / 7 day refresh) chosen
    for developer convenience. Tighten for production.
  - ACCOUNT_EMAIL_VERIFICATION: disabled so new accounts work without
    an SMTP server configured.
  - SECRET_KEY: hardcoded insecure value — must be replaced with a
    randomly-generated key loaded from the environment before any
    production deployment.

Module: civicsense_backend
Author: Ankitha
"""

# Standard library
import os
from pathlib import Path
from datetime import timedelta

# Third-party
from dotenv import load_dotenv

# ── Environment variable loading ───────────────────────────────────────────
# Try the project root first, then the settings directory. The file in the
# settings directory takes precedence because load_dotenv does not overwrite
# already-set variables, so the second call only fills in what the first missed.
_env_root = Path(__file__).resolve().parent.parent / ".env.backend"
_env_here = Path(__file__).resolve().parent / ".env.backend"
load_dotenv(dotenv_path=_env_root)
load_dotenv(dotenv_path=_env_here)

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ───────────────────────────────────────────────────────────────
# WARNING: this key is intentionally insecure for development. Generate a
# fresh value with `python -c "from django.core.management.utils import
# get_random_secret_key; print(get_random_secret_key())"` before deploying.
SECRET_KEY = "django-insecure-civicsense-backend-secret-key-2024"

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# ── Installed applications ─────────────────────────────────────────────────
INSTALLED_APPS = [
    # Django built-ins
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",

    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "corsheaders",

    # Project apps
    "core",
    "civicsense_backend.ai_module",
]

# Required by django-allauth
SITE_ID = 1

# ── Middleware ─────────────────────────────────────────────────────────────
# CorsMiddleware must be placed as high as possible, before any middleware
# that can generate responses (such as CommonMiddleware).
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "civicsense_backend.urls"

# ── Templates ──────────────────────────────────────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",  # Required by allauth
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "civicsense_backend.wsgi.application"

# ── Database ───────────────────────────────────────────────────────────────
# SQLite is used for development. Replace with PostgreSQL for production.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Password validation is disabled for developer convenience.
# Re-enable AUTH_PASSWORD_VALIDATORS before production deployment.
AUTH_PASSWORD_VALIDATORS = []

# ── Internationalisation ───────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE     = "UTC"
USE_I18N      = True
USE_TZ        = True

# ── Static and media files ─────────────────────────────────────────────────
# MEDIA_ROOT is where Django saves uploaded issue photos.
# In production, serve /media/ from nginx or a cloud storage bucket.
STATIC_URL  = "static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
MEDIA_URL   = "/media/"
MEDIA_ROOT  = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── CORS ───────────────────────────────────────────────────────────────────
# CORS_ALLOW_ALL_ORIGINS is True in DEBUG so the Vite dev server can reach
# the API regardless of which port it binds to. Set to False in production
# and enumerate only the real frontend origin.
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# ── Django REST Framework ──────────────────────────────────────────────────
# Both authentication classes are active so that the API accepts either a
# classic DRF Token (legacy) or a simplejwt Bearer token (current default).
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# ── SimpleJWT ─────────────────────────────────────────────────────────────
# Long-lived tokens chosen for developer convenience.
# Reduce ACCESS_TOKEN_LIFETIME to 15-60 minutes for production.
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS":  True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── django-allauth / dj-rest-auth ─────────────────────────────────────────
# Email verification is disabled so accounts work without an SMTP server.
ACCOUNT_LOGIN_METHODS    = {"username", "email"}
ACCOUNT_SIGNUP_FIELDS    = ["email*", "username*", "password1*", "password2*"]
ACCOUNT_EMAIL_VERIFICATION = "none"

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

# JWT cookie names (used by dj-rest-auth when REST_USE_JWT is True)
REST_USE_JWT          = True
JWT_AUTH_COOKIE       = "access"
JWT_AUTH_REFRESH_COOKIE = "refresh"

# ── API keys ───────────────────────────────────────────────────────────────
# Loaded from .env.backend — never hardcode these values.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
