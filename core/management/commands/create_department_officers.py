from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Department, DepartmentProfile

DEPARTMENTS = [
    {"name": "Public Works Department",  "slug": "infrastructure", "assigned_category": "infrastructure", "email": "infrastructure@civicsense.gov"},
    {"name": "Sanitation Department",    "slug": "sanitation",     "assigned_category": "sanitation",     "email": "sanitation@civicsense.gov"},
    {"name": "Public Safety Office",     "slug": "public-safety",  "assigned_category": "public_safety",  "email": "safety@civicsense.gov"},
    {"name": "Utilities Department",     "slug": "utilities",      "assigned_category": "utilities",      "email": "utilities@civicsense.gov"},
    {"name": "Transport Authority",      "slug": "transportation", "assigned_category": "transportation", "email": "transport@civicsense.gov"},
    {"name": "Environment Department",   "slug": "environment",    "assigned_category": "environment",    "email": "environment@civicsense.gov"},
]

OFFICERS = [
    {"username": "officer_infrastructure", "email": "officer.infra@civicsense.gov",       "dept_slug": "infrastructure"},
    {"username": "officer_sanitation",     "email": "officer.sanitation@civicsense.gov",   "dept_slug": "sanitation"},
    {"username": "officer_safety",         "email": "officer.safety@civicsense.gov",       "dept_slug": "public-safety"},
    {"username": "officer_utilities",      "email": "officer.utilities@civicsense.gov",    "dept_slug": "utilities"},
    {"username": "officer_transport",      "email": "officer.transport@civicsense.gov",    "dept_slug": "transportation"},
    {"username": "officer_environment",    "email": "officer.env@civicsense.gov",          "dept_slug": "environment"},
]

PASSWORD = "Officer@123"


class Command(BaseCommand):
    help = "Create 6 department officers for the CivicSense demo"

    def handle(self, *args, **options):
        self.stdout.write("Setting up departments...")
        for d in DEPARTMENTS:
            dept, created = Department.objects.get_or_create(
                slug=d["slug"],
                defaults={
                    "name": d["name"],
                    "assigned_category": d["assigned_category"],
                    "email": d["email"],
                },
            )
            tag = "Created" if created else "Exists"
            self.stdout.write(f"  [{tag}] {dept.name}")

        self.stdout.write("Setting up officers...")
        for o in OFFICERS:
            dept = Department.objects.get(slug=o["dept_slug"])
            user, user_created = User.objects.get_or_create(
                username=o["username"],
                defaults={"email": o["email"]},
            )
            if user_created:
                user.set_password(PASSWORD)
                user.save()
            DepartmentProfile.objects.get_or_create(
                user=user,
                defaults={"department": dept},
            )
            tag = "Created" if user_created else "Exists"
            self.stdout.write(f"  [{tag}] {user.username} -> {dept.name}")

        self.stdout.write(self.style.SUCCESS("Done. All officers use password: Officer@123"))
