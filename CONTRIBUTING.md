# Contributing to CivicSense

## Project structure

```
CivicSenseProject/
├── civicsense_backend/      # Django project package
│   ├── settings.py          # All Django configuration
│   ├── urls.py              # Root URL routing
│   ├── wsgi.py
│   └── ai_module/           # Legacy AI utilities (report generator, classifiers)
├── core/                    # Primary Django app
│   ├── models.py            # Department, DepartmentProfile, Issue
│   ├── views.py             # Citizen and department officer API views
│   ├── serializers.py       # DRF serializers for all models
│   ├── admin.py             # Django admin registrations
│   ├── chat_views.py        # Gemini chatbot endpoint (/api/chat/)
│   ├── ai_analysis.py       # Gemini Vision image analysis
│   └── management/commands/ # Django management commands
├── civicsense_frontend/     # React + Vite frontend
│   └── src/
│       ├── api/             # Axios instance + per-domain fetch wrappers
│       ├── components/      # Shared UI components (Navbar, ChatWidget, badges)
│       ├── context/         # React context providers (AuthContext, DepartmentAuthContext)
│       ├── hooks/           # Custom hooks (useIssues)
│       ├── pages/           # Page-level components
│       │   └── department/  # Department officer portal pages
│       └── utils/           # Pure utility functions (formatters, constants, validators)
└── media/                   # Uploaded issue photos (development only)
```

## Running locally

**Backend:**
```bash
# From the project root (CivicSenseProject/)
python manage.py migrate
python manage.py create_department_officers   # seed demo accounts
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`.

**Frontend:**
```bash
cd civicsense_frontend
npm install
npm run dev
```

The app is available at `http://localhost:5173`. The Vite dev server proxies
all `/api` and `/media` requests to Django so no CORS configuration is needed.

**Environment variables:**

Create `civicsense_backend/.env.backend` with:
```
GEMINI_API_KEY=your_key_here
```

## Coding conventions

**Python (PEP 8):**
- Snake_case for functions and variables; PascalCase for classes; UPPER_CASE for module-level constants.
- Group imports: standard library, then third-party, then local — each group separated by a blank line.
- Every module, class, and public function should have a docstring.
- Use `try/except` around any external service call (Gemini API, filesystem). Errors must return clean JSON, never crash the server.

**JavaScript / React:**
- 2-space indentation, single quotes, semicolons.
- File-level JSDoc block at the top of every `.jsx` / `.js` file.
- Named exports for utility functions and hooks; default export for page/component files.
- No `console.log` in committed code; use `console.error` with a descriptive message for genuine error logging.

## Adding a new feature

1. **New issue field**: add the field to `core/models.py`, create a migration (`python manage.py makemigrations`), add to `IssueSerializer.fields` and `read_only_fields` if backend-set, and update the IssueDetail AI card or sidebar as needed.

2. **New API endpoint**: add a view function or ViewSet action in `core/views.py`, register the URL in `civicsense_backend/urls.py`, and add the corresponding fetch wrapper in `civicsense_frontend/src/api/`.

3. **New page**: create the component in `civicsense_frontend/src/pages/`, add the route in `App.jsx`, and wrap it in `PrivateRoute` (or `DepartmentPrivateRoute`) as appropriate.

4. **New department management command**: add the file to `core/management/commands/`, include a module-level docstring describing usage, and update this document.
