#!/bin/bash
# =============================================================================
# LMS Enterprise - Start All Services
# Usage: ./start_lms.sh
# =============================================================================

set -euo pipefail

echo "=========================================="
echo "Starting LMS Enterprise Services"
echo "=========================================="

# Start PostgreSQL
echo "[1/5] Starting PostgreSQL..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start postgresql-18 2>/dev/null || {
        # If systemd service doesn't exist, start manually
        su - pgadmin -c "/d01/postgres/18/bin/pg_ctl -D /d02/pgdata/data -l /d02/pgdata/data/log/postgresql.log start" 2>/dev/null || echo "PostgreSQL may already be running or not installed yet"
    }
else
    su - pgadmin -c "/d01/postgres/18/bin/pg_ctl -D /d02/pgdata/data -l /d02/pgdata/data/log/postgresql.log start" 2>/dev/null || echo "PostgreSQL may already be running or not installed yet"
fi

# Start Redis
echo "[2/5] Starting Redis..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start redis 2>/dev/null || {
        redis-server --daemonize yes 2>/dev/null || echo "Redis may already be running or not installed yet"
    }
else
    redis-server --daemonize yes 2>/dev/null || echo "Redis may already be running or not installed yet"
fi

# Start Gunicorn (WSGI)
echo "[3/5] Starting Gunicorn (Django WSGI)..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/lms-gunicorn.service ]; then
    sudo systemctl start lms-gunicorn
else
    cd /u01/app/django/apps
    source /u01/app/python-venvs/lms/bin/activate 2>/dev/null || source /u01/app/django/venv/bin/activate 2>/dev/null || true
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    export PYTHONPATH=/u01/app/django/apps
    nohup gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 lms_enterprise.wsgi:application > /u01/app/django/logs/gunicorn.log 2>&1 &
    echo $! > /u01/app/django/run/gunicorn.pid
fi

# Start Daphne (ASGI/WebSocket)
echo "[4/5] Starting Daphne (WebSocket ASGI)..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/lms-daphne.service ]; then
    sudo systemctl start lms-daphne
else
    cd /u01/app/django/apps
    source /u01/app/python-venvs/lms/bin/activate 2>/dev/null || source /u01/app/django/venv/bin/activate 2>/dev/null || true
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    export PYTHONPATH=/u01/app/django/apps
    nohup daphne -b 0.0.0.0 -p 8001 lms_enterprise.asgi:application > /u01/app/django/logs/daphne.log 2>&1 &
    echo $! > /u01/app/django/run/daphne.pid
fi

# Start Celery
echo "[5/5] Starting Celery Worker & Beat..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/lms-celery-worker.service ]; then
    sudo systemctl start lms-celery-worker
    sudo systemctl start lms-celery-beat
else
    cd /u01/app/django/apps
    source /u01/app/python-venvs/lms/bin/activate 2>/dev/null || source /u01/app/django/venv/bin/activate 2>/dev/null || true
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    export PYTHONPATH=/u01/app/django/apps
    nohup celery -A lms_enterprise worker --loglevel=info > /u01/app/django/logs/celery-worker.log 2>&1 &
    echo $! > /u01/app/django/run/celery-worker.pid
    nohup celery -A lms_enterprise beat --loglevel=info > /u01/app/django/logs/celery-beat.log 2>&1 &
    echo $! > /u01/app/django/run/celery-beat.pid
fi

echo ""
echo "=========================================="
echo "LMS Enterprise Services Started!"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  Django API:    http://localhost:8000/api/v3/"
echo "  Admin Panel:   http://localhost:8000/admin/"
echo "  WebSocket:     ws://localhost:8001/ws/"
echo "  Health Check:  http://localhost:8000/health/"
echo ""
