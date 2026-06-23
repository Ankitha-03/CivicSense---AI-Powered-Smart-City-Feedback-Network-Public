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

## Project Structure
CivicSenseProject/

civicsense_backend/    # Django settings, URLs, JWT auth

civicsense_frontend/   # React app (Vite)

core/                  # Issues, departments, chat, AI analysis

users/                 # User accounts and profiles

manage.py

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

| Department              | Username          | Password    |
|-------------------------|-------------------|-------------|
| Public Works (Roads)    | pwd_officer       | Officer@123 |
| Solid Waste (Garbage)   | garbage_officer   | Officer@123 |
| Electricity             | electric_officer  | Officer@123 |
| Water Supply            | water_officer     | Officer@123 |
| Town Planning           | planning_officer  | Officer@123 |
| General Administration  | admin_officer     | Officer@123 |

Department portal: `/department/login`

## API Endpoints

- `POST /api/auth/register/` — Citizen registration
- `POST /api/auth/login/` — Citizen login
- `POST /api/auth/department-login/` — Officer login
- `GET /api/issues/` — List user's issues
- `POST /api/issues/` — Submit new issue
- `GET /api/department/issues/` — Officer issue queue
- `PATCH /api/department/issues/:id/status/` — Update status
- `POST /api/chat/` — AI chatbot endpoint
