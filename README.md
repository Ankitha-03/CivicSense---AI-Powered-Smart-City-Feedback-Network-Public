# 🚀 CivicSense — AI-Powered Smart City Feedback Network

CivicSense is an AI-powered platform that allows citizens to report civic issues such as potholes, garbage accumulation, water supply problems, electricity faults, and more — directly from their phones.
The system automatically detects issue categories, stores location, and generates weekly city insights.

⸻

## ⭐ Features

### 📝 Issue Reporting
	•	Upload images
	•	Auto-detect issue type using AI (pothole, garbage, road crack, etc.)
	•	Map-based precise location selection
	•	Severity rating
	•	Track status of reported issues

### 🤖 AI Categorization
	•	Automatically classifies uploaded images
	•	Routes issues to correct category
	•	Helps generate weekly insights

### 📍 Interactive Map (Leaflet)
	•	Drag marker to update location
	•	Auto-fetch current GPS location
	•	Reverse geocoding included

### 📊 Weekly City Health Report
	•	Category-wise issue breakdown
	•	Total resolved/pending/critical counts
	•	Visual analytics and trends

### 🔐 Secure Authentication
	•	JWT login/signup
	•	Protected pages
	•	Session-based access control

## Project Structure
'''text
CivicSenseProject/
│
├── civicsense_backend/        # Django backend
│   ├── core/
│   ├── users/
│   ├── ai_utils.py
│   ├── settings.py
│   ├── urls.py
│   ├── manage.py
│
├── civicsense_frontend/       # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── api/
│   ├── vite.config.js
│
└── README.md
'''


## 🛠 Technology Stack

### **Frontend**
	•	React (Vite)
	•	TailwindCSS
	•	Leaflet Maps
	•	Axios
	•	React Router

### **Backend**
	•	Django
	•	Django REST Framework
	•	Pillow (Image processing)
	•	Custom AI models (image classification)

### **Database**
	•	SQLite (development)
	•	PostgreSQL (recommended for production)

## Setup Instructions
 
  ### Backend Setup

   cd civicsense_backend
   python -m venv venv
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver


  ### Frontend Setup
    cd civicsense_frontend
    npm install
    npm run dev
