CivicSense — AI-Powered Smart City Feedback Network

CivicSense is an AI-powered platform that allows citizens to report civic issues such as potholes, garbage problems, water supply faults, and electricity issues. The system helps local authorities track, categorize, and resolve civic problems efficiently using AI and smart analytics.
 
 Features

 Issue Reporting
	•	Upload photos
	•	Auto-detect issue type using AI (pothole, garbage, road crack, etc.)
	•	Interactive map for precise location selection
	•	Severity rating
	•	Track status of reported issues

 AI Categorization

Automatically analyzes uploaded photos using a trained AI model and classifies the issue.

Smart Location Picker
	•	Leaflet map integration
	•	User location access
	•	Reverse geocoding using OpenCage

Weekly City Health Report
	•	Category-wise issue breakdown
	•	Total resolved/pending/critical counts
	•	Visual analytics
	•	AI-generated insights and trends

 Secure Authentication
	•	JWT-based login/signup
	•	Protected routes

  Project Structure 
  CivicSenseProject/
│
├── civicsense_backend/        # Django backend
│   ├── core/
│   ├── ai_module/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── civicsense_frontend/       # React frontend
│   ├── src/
│   ├── public/
│   ├── .env (ignored)
│   └── ...
│
└── README.md


🛠 Technology Stack

Frontend
	•	React (Vite)
	•	TailwindCSS
	•	Leaflet Maps
	•	Axios
	•	React Router

Backend
	•	Django
	•	Django REST Framework
	•	Pillow (image processing)
	•	Custom AI models

Database
	•	SQLite (development)
	•	PostgreSQL recommended for production


  Setup Instructions

  Backend Setup
cd civicsense_backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Frontend Setup
cd civicsense_frontend
npm install
npm run dev
