# CivicSense

An AI-powered Smart City civic issue reporting platform that connects citizens directly with municipal departments. Citizens can report public infrastructure issues with photo evidence and live location, while department officers manage and resolve them through a dedicated portal.

## Features

**For Citizens**
- Multi-step issue reporting with photo upload
- Automatic location detection via browser Geolocation and OpenStreetMap
- Real-time status tracking: Pending, In Progress, Resolved
- Personal dashboard with submitted reports and weekly insights
- AI-powered chatbot assistant for platform guidance

**For Department Officers**
- Separate municipal portal with department-specific access
- Auto-routed issues based on category (PWD, Water, Electricity, etc.)
- Status update workflow with internal notes
- Filterable issue management table

**AI Capabilities**
- Gemini-powered chatbot for civic guidance
- Vision-based image analysis on submitted photos
- Automatic category and severity detection
- Mismatch flagging when uploaded image does not match reported category

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Lucide Icons
- **Backend:** Django, Django REST Framework, SQLite
- **Authentication:** JWT (SimpleJWT)
- **AI:** Google Gemini API (text and vision)
- **Geolocation:** Browser Geolocation API, OpenStreetMap Nominatim

## Setup

### Backend

    cd CivicSenseProject
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py create_department_officers
    python manage.py runserver

Create a `.env` file in the project root with:

    GEMINI_API_KEY=your_gemini_api_key
    SECRET_KEY=your_django_secret_key
    DEBUG=True

### Frontend

    cd civicsense_frontend
    npm install
    npm run dev

## Department Officer Demo Credentials

CivicSense includes a separate portal at `/department/login` for municipal officers. Each issue category is automatically routed to its respective department:

- Road Damage — Public Works Department
- Garbage — Solid Waste Department
- Streetlight — Electricity Department
- Water Leak — Water Supply Department
- Encroachment — Town Planning Department
- Other — General Administration

To generate demo officer accounts locally, run:

    python manage.py create_department_officers

### Demo Login Credentials

All demo officer accounts share the password: **Officer@123**

Usernames:

- `pwd_officer` — Public Works (Roads)
- `garbage_officer` — Solid Waste
- `electric_officer` — Electricity
- `water_officer` — Water Supply
- `planning_officer` — Town Planning
- `admin_officer` — General Administration

## API Endpoints

- `POST /api/auth/register/` — Citizen registration
- `POST /api/auth/login/` — Citizen login
- `POST /api/auth/department-login/` — Officer login
- `GET /api/issues/` — List user's issues
- `POST /api/issues/` — Submit new issue
- `GET /api/department/issues/` — Officer issue queue
- `PATCH /api/department/issues/:id/status/` — Update status
- `POST /api/chat/` — AI chatbot endpoint

## Author

Developed by Ankitha as part of academic project work at CMRIT, Bengaluru.
