# Daily Activity Tracker – Django REST Backend

A production-grade Python Full Stack REST API built with **Django**, **Django REST Framework**, **JWT Authentication (Simple JWT)**, and **MySQL**.

---

## 1. Prerequisites

- Python 3.10+ installed
- MySQL Server 8.0+ running
- Node.js 18+ (for frontend)

---

## 2. MySQL Database Setup

Log in to MySQL and create the database:

```sql
CREATE DATABASE daily_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tracker_user'@'localhost' IDENTIFIED BY 'tracker_password_123';
GRANT ALL PRIVILEGES ON daily_tracker_db.* TO 'tracker_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Python Environment Setup

Navigate to the `backend/` directory:

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:
```ini
SECRET_KEY=your_secure_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

DB_NAME=daily_tracker_db
DB_USER=tracker_user
DB_PASSWORD=tracker_password_123
DB_HOST=127.0.0.1
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ACCESS_TOKEN_LIFETIME_MINUTES=60
REFRESH_TOKEN_LIFETIME_DAYS=7
```

*(Note: If testing without a live MySQL instance, set `USE_SQLITE=True` in `.env` to automatically use SQLite3).*

---

## 5. Database Migrations

Run Django migrations to create all tables:

```bash
python manage.py makemigrations accounts activities goals mood journal notifications
python manage.py migrate
```

Create a superuser to access Django Admin:

```bash
python manage.py createsuperuser
```

---

## 6. Run the Django Server

```bash
python manage.py runserver 0.0.0.0:8000
```

The Django REST API will be available at `http://127.0.0.1:8000/`.
The Django Admin panel is available at `http://127.0.0.1:8000/admin/`.

---

## 7. REST API Endpoints Overview

### Authentication
- `POST /api/auth/register/` - Register new user (Full name, username, email, password)
- `POST /api/auth/login/` - Login with username or email + password (returns JWT access & refresh tokens)
- `POST /api/auth/refresh/` - Refresh JWT access token
- `POST /api/auth/logout/` - Invalidate refresh token
- `GET /api/auth/profile/` - Fetch user profile & streak targets
- `PUT /api/auth/profile/` - Update profile information
- `POST /api/auth/change-password/` - Secure password rotation

### Activities
- `GET /api/activities/` - List user activities (query params: `search`, `category`, `status`, `priority`, `date`, `start_date`, `end_date`)
- `POST /api/activities/` - Create a new activity
- `GET /api/activities/<id>/` - Retrieve activity detail
- `PUT /api/activities/<id>/` - Update activity
- `DELETE /api/activities/<id>/` - Delete activity
- `PATCH /api/activities/<id>/status/` - Quick status update (`Pending`, `In Progress`, `Completed`, `Skipped`)

### Goals
- `GET /api/goals/` - List daily goals (filter by `?date=YYYY-MM-DD`)
- `POST /api/goals/` - Create new goal
- `PUT /api/goals/<id>/` - Update goal
- `DELETE /api/goals/<id>/` - Delete goal
- `PATCH /api/goals/<id>/toggle/` - Toggle completed state

### Mood Tracker
- `GET /api/moods/` - List mood history
- `GET /api/moods/today/` - Fetch today's mood
- `POST /api/moods/` - Upsert daily mood (`Excellent`, `Good`, `Normal`, `Bad`, `Very Bad`) + note

### Journal
- `GET /api/journal/` - List journal reflections
- `GET /api/journal/today/` - Fetch today's entry
- `POST /api/journal/` - Save/Update daily accomplishments, improvements, and content
- `DELETE /api/journal/<id>/` - Delete journal entry

### Analytics & Streaks
- `GET /api/analytics/dashboard/` - Today's progress, streak metrics, active goals
- `GET /api/analytics/weekly/` - 7-day breakdown, category distribution, productive hours
- `GET /api/analytics/monthly/` - 30-day productivity rate
- `POST /api/analytics/insights/` - AI & heuristic productivity insights

### Notifications
- `GET /api/notifications/` - List in-app notifications
- `POST /api/notifications/<id>/read/` - Mark notification as read
- `POST /api/notifications/read-all/` - Mark all notifications as read
