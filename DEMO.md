# CivicSense — Demo Setup Guide

## Quick Start

### 1. Backend

```bash
# From project root
cd civicsense_backend       # or wherever manage.py lives
python manage.py migrate
python manage.py create_department_officers
python manage.py runserver
```

### 2. Frontend

```bash
cd civicsense_frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Demo Accounts

### Citizen Portal — http://localhost:5173/login

| Role    | Email              | Password   |
|---------|--------------------|------------|
| Citizen | (register any)     | (any)      |

Register a new account, then report issues across different categories to see department routing in action.

### Department Officer Portal — http://localhost:5173/department/login

| Department           | Username               | Password     | Handles Category  |
|----------------------|------------------------|--------------|-------------------|
| Public Works         | officer_infrastructure | Officer@123  | Infrastructure    |
| Sanitation           | officer_sanitation     | Officer@123  | Sanitation        |
| Public Safety Office | officer_safety         | Officer@123  | Public Safety     |
| Utilities            | officer_utilities      | Officer@123  | Utilities         |
| Transport Authority  | officer_transport      | Officer@123  | Transportation    |
| Environment Dept     | officer_environment    | Officer@123  | Environment       |

---

## Demo Flow

1. **As a Citizen** — Sign up at `/login`, then submit an issue via the "Report Issue" button. Choose a category (e.g. Infrastructure).

2. **As a Department Officer** — Go to `/department/login`, sign in as `officer_infrastructure` / `Officer@123`. The dashboard shows all infrastructure issues and pending count.

3. **Update an Issue** — In the department Issues tab, click "Update" on any issue. Change the status to "In Progress" or "Resolved" and add a department note.

4. **See the Update as a Citizen** — Back in the citizen portal, view the issue detail page. The "Status Updates" timeline reflects the new status, and the department note appears inline. The sidebar shows which department was assigned.

---

## Department Routing Logic

Issues are automatically routed to the matching department when submitted:

| Issue Category | Assigned Department      |
|----------------|--------------------------|
| infrastructure | Public Works Department  |
| sanitation     | Sanitation Department    |
| public_safety  | Public Safety Office     |
| utilities      | Utilities Department     |
| transportation | Transport Authority      |
| environment    | Environment Department   |
