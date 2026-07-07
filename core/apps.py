"""
AppConfig for the CivicSense core application.

Registers the 'core' app with Django and sets BigAutoField as the
default primary key type for all models in this module.

Module: core
Author: Ankitha
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Configuration for the core application."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "core"
