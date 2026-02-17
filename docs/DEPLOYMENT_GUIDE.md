# LMS Enterprise - Deployment & Operations Guide

## Table of Contents
1. [Installation Paths](#installation-paths)
2. [Application URLs](#application-urls)
3. [Default Credentials](#default-credentials)
4. [Start/Stop Scripts](#startstop-scripts)
5. [Deployment Steps](#deployment-steps)
6. [Service Management](#service-management)
7. [Database Information](#database-information)
8. [Configuration Files](#configuration-files)
9. [Log Files](#log-files)
10. [Troubleshooting](#troubleshooting)

---

## Installation Paths

### Application Directories
| Component | Path |
|-----------|------|
| **Application Root** | `/u01/app/django/` |
| **Django Apps** | `/u01/app/django/apps/` |
| **Virtual Environment** | `/u01/app/django/venv/` |
| **Configuration Files** | `/u01/app/django/config/` |
| **Operational Scripts** | `/u01/app/django/scripts/` |
| **Log Files** | `/u01/app/django/logs/` |
| **Static Files** | `/u01/app/django/static/` |
| **Media/Uploads** | `/u01/app/django/media/` |
| **PID/Socket Files** | `/u01/app/django/run/` |
| **Database Backups** | `/u01/app/django/backup/` |

### Database Directories
| Component | Path |
|-----------|------|
| **PostgreSQL Binaries** | `/d01/postgres/18/bin/` |
| **PostgreSQL Data** | `/d02/pgdata/data/` |
| **PostgreSQL Logs** | `/d02/pgdata/logs/` |

---

## Application URLs

### Production URLs (with Nginx)
| Service | URL |
|---------|-----|
| **Web Application** | `http://your-domain.com/` |
| **Admin Panel** | `http://your-domain.com/admin/` |
| **API v3 Root** | `http://your-domain.com/api/v3/` |
| **API Documentation** | `http://your-domain.com/api/v3/docs/` |
| **WebSocket** | `wss://your-domain.com/ws/` |
| **Health Check** | `http://your-domain.com/api/v3/health/` |

### Development URLs (Direct Access)
| Service | URL |
|---------|-----|
| **Gunicorn (HTTP)** | `http://localhost:8000/` |
| **Admin Panel** | `http://localhost:8000/admin/` |
| **API v3 Root** | `http://localhost:8000/api/v3/` |
| **Daphne (WebSocket)** | `ws://localhost:8001/ws/` |

### API Endpoints
| Endpoint | Description |
|----------|-------------|
| `/api/v3/auth/login/` | JWT Token Login |
| `/api/v3/auth/logout/` | Logout |
| `/api/v3/auth/refresh/` | Refresh JWT Token |
| `/api/v3/tenants/` | Tenant Management |
| `/api/v3/students/` | Student Management |
| `/api/v3/teachers/` | Teacher Management |
| `/api/v3/academics/courses/` | Course Management |
| `/api/v3/academics/subjects/` | Subject Management |
| `/api/v3/classes/` | Class Management |
| `/api/v3/assessments/` | Assessment/Exam Management |
| `/api/v3/attendance/` | Attendance Records |
| `/api/v3/materials/` | Study Materials |
| `/api/v3/communications/` | Notifications/Messages |
| `/api/v3/sessions/` | Live Session Tracking |

---

## Default Credentials

### Django Superadmin
| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `LmsAdmin@2024!` |
| **Email** | `admin@lms-enterprise.com` |

### Database
| Field | Value |
|-------|-------|
| **Database Name** | `LMS_PROD_DB` |
| **Username** | `lms_app_user` |
| **Password** | `LmsSecure@2024!` |
| **Host** | `localhost` |
| **Port** | `5432` |

### Redis
| Field | Value |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `6379` |
| **Cache DB** | `0` |
| **Sessions DB** | `1` |
| **Channels DB** | `2` |
| **Celery Broker DB** | `3` |
| **Celery Results DB** | `4` |

> **⚠️ SECURITY WARNING:** Change all default passwords before deploying to production!

---

## Start/Stop Scripts

All scripts are located in: `/u01/app/django/scripts/`

### Start All Services
```bash
/u01/app/django/scripts/start_lms.sh
```
Starts: PostgreSQL → Redis → Gunicorn → Daphne → Celery Worker → Celery Beat

### Stop All Services
```bash
/u01/app/django/scripts/stop_lms.sh
```
Stops application services (keeps PostgreSQL and Redis running)

### Check Service Status
```bash
/u01/app/django/scripts/status_lms.sh
```
Shows status of all services with health checks

### Restart All Services
```bash
/u01/app/django/scripts/restart_lms.sh
```
Gracefully restarts all application services

### Database Backup
```bash
/u01/app/django/scripts/backup_database.sh
```
Creates timestamped backup in `/u01/app/django/backup/`

---

## Deployment Steps

### Prerequisites Verification
```bash
# Check Python version (requires 3.9+)
python3 --version

# Check PostgreSQL
/d01/postgres/18/bin/psql --version

# Check Redis
redis-cli ping
```

### Step 1: Install Python Dependencies
```bash
cd /u01/app/django
source venv/bin/activate
pip install -r /u01/app/django/apps/requirements.txt
```

### Step 2: Setup Database
```bash
# Start PostgreSQL if not running
/d01/postgres/18/bin/pg_ctl -D /d02/pgdata/data start

# Create database and user
/d01/postgres/18/bin/psql -U postgres << 'EOF'
CREATE USER lms_app_user WITH PASSWORD 'LmsSecure@2024!' CREATEDB;
CREATE DATABASE "LMS_PROD_DB" OWNER lms_app_user;
GRANT ALL PRIVILEGES ON DATABASE "LMS_PROD_DB" TO lms_app_user;
EOF

# Run schema creation
/d01/postgres/18/bin/psql -U lms_app_user -d LMS_PROD_DB -f /u01/app/django/scripts/create_schema.sql
```

### Step 3: Run Django Migrations
```bash
cd /u01/app/django/apps
source /u01/app/django/venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
```

### Step 4: Create Superuser
```bash
cd /u01/app/django/apps
source /u01/app/django/venv/bin/activate
python manage.py createsuperuser --username admin --email admin@lms-enterprise.com
# Enter password: LmsAdmin@2024!
```

### Step 5: Start Services
```bash
/u01/app/django/scripts/start_lms.sh
```

### Step 6: Verify Deployment
```bash
# Check service status
/u01/app/django/scripts/status_lms.sh

# Test API health
curl http://localhost:8000/api/v3/health/

# Access admin panel
# Open browser: http://localhost:8000/admin/
```

---

## Service Management

### Systemd Services (Production)
```bash
# Enable services on boot
sudo systemctl enable lms-gunicorn lms-daphne lms-celery-worker lms-celery-beat

# Start/Stop/Restart individual services
sudo systemctl start lms-gunicorn
sudo systemctl stop lms-gunicorn
sudo systemctl restart lms-gunicorn
sudo systemctl status lms-gunicorn

# View logs
sudo journalctl -u lms-gunicorn -f
sudo journalctl -u lms-daphne -f
sudo journalctl -u lms-celery-worker -f
```

### Manual Process Management
```bash
# Gunicorn (HTTP API)
cd /u01/app/django/apps
source /u01/app/django/venv/bin/activate
gunicorn lms_enterprise.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --pid /u01/app/django/run/gunicorn.pid \
    --daemon

# Daphne (WebSocket)
daphne -b 0.0.0.0 -p 8001 lms_enterprise.asgi:application &

# Celery Worker
celery -A lms_enterprise worker -l info &

# Celery Beat (Scheduler)
celery -A lms_enterprise beat -l info &
```

---

## Database Information

### Connection Details
```
Host: localhost
Port: 5432
Database: LMS_PROD_DB
Username: lms_app_user
Password: LmsSecure@2024!
```

### Connection String
```
postgresql://lms_app_user:LmsSecure@2024!@localhost:5432/LMS_PROD_DB
```

### Django Database URL
```
DATABASE_URL=postgres://lms_app_user:LmsSecure%402024!@localhost:5432/LMS_PROD_DB
```

### Useful Commands
```bash
# Connect to database
/d01/postgres/18/bin/psql -U lms_app_user -d LMS_PROD_DB

# List all tables
\dt

# Backup database
/u01/app/django/scripts/backup_database.sh

# Restore from backup
/d01/postgres/18/bin/psql -U lms_app_user -d LMS_PROD_DB < /u01/app/django/backup/backup_YYYYMMDD_HHMMSS.sql
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `/u01/app/django/apps/lms_enterprise/settings/base.py` | Base Django settings |
| `/u01/app/django/apps/lms_enterprise/settings/production.py` | Production settings |
| `/u01/app/django/apps/lms_enterprise/settings/development.py` | Development settings |
| `/u01/app/django/config/gunicorn.conf.py` | Gunicorn configuration |
| `/u01/app/django/config/daphne.conf` | Daphne configuration |
| `/u01/app/django/config/nginx/lms-enterprise.conf` | Nginx configuration |
| `/u01/app/django/config/systemd/*.service` | Systemd service files |

### Environment Variables
Create `/u01/app/django/.env`:
```bash
DJANGO_SETTINGS_MODULE=lms_enterprise.settings.production
SECRET_KEY=your-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost
DATABASE_URL=postgres://lms_app_user:LmsSecure%402024!@localhost:5432/LMS_PROD_DB
REDIS_URL=redis://localhost:6379/0
```

---

## Log Files

| Log | Location |
|-----|----------|
| **Gunicorn Access** | `/u01/app/django/logs/gunicorn-access.log` |
| **Gunicorn Error** | `/u01/app/django/logs/gunicorn-error.log` |
| **Daphne** | `/u01/app/django/logs/daphne.log` |
| **Celery Worker** | `/u01/app/django/logs/celery-worker.log` |
| **Celery Beat** | `/u01/app/django/logs/celery-beat.log` |
| **Django App** | `/u01/app/django/logs/django.log` |
| **PostgreSQL** | `/d02/pgdata/logs/postgresql.log` |

### View Logs
```bash
# Tail all logs
tail -f /u01/app/django/logs/*.log

# Tail specific log
tail -f /u01/app/django/logs/gunicorn-error.log
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check if port is in use
lsof -i :8000
lsof -i :8001

# Kill existing processes
pkill -f gunicorn
pkill -f daphne

# Check logs
tail -100 /u01/app/django/logs/gunicorn-error.log
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
/d01/postgres/18/bin/pg_isready

# Start PostgreSQL
/d01/postgres/18/bin/pg_ctl -D /d02/pgdata/data start

# Test connection
/d01/postgres/18/bin/psql -U lms_app_user -d LMS_PROD_DB -c "SELECT 1;"
```

### Redis Connection Failed
```bash
# Check Redis
redis-cli ping

# Start Redis
redis-server --daemonize yes
```

### Static Files Not Loading
```bash
cd /u01/app/django/apps
source /u01/app/django/venv/bin/activate
python manage.py collectstatic --noinput
```

### Permission Errors
```bash
# Fix directory permissions
chown -R $(whoami):$(whoami) /u01/app/django/
chmod -R 755 /u01/app/django/
chmod +x /u01/app/django/scripts/*.sh
```

---

## Quick Reference Card

### Start Everything
```bash
/u01/app/django/scripts/start_lms.sh
```

### Stop Everything
```bash
/u01/app/django/scripts/stop_lms.sh
```

### Check Status
```bash
/u01/app/django/scripts/status_lms.sh
```

### Access Points
- **Admin Panel:** http://localhost:8000/admin/
- **API:** http://localhost:8000/api/v3/
- **WebSocket:** ws://localhost:8001/ws/

### Credentials
- **Admin:** admin / LmsAdmin@2024!
- **Database:** lms_app_user / LmsSecure@2024!

---

*Document Version: 1.0*
*Last Updated: December 2024*
*LMS Enterprise Multi-Tenant Platform*
