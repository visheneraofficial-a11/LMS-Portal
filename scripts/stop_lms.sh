#!/bin/bash
# =============================================================================
# LMS Enterprise - Stop All Services
# Usage: ./stop_lms.sh
# =============================================================================

set -euo pipefail

echo "=========================================="
echo "Stopping LMS Enterprise Services"
echo "=========================================="

# Stop Celery
echo "[1/5] Stopping Celery..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/celery-worker.service ]; then
    sudo systemctl stop celery-beat 2>/dev/null || true
    sudo systemctl stop celery-worker 2>/dev/null || true
else
    if [ -f /u01/app/django/run/celery-beat.pid ]; then
        kill $(cat /u01/app/django/run/celery-beat.pid) 2>/dev/null || true
        rm -f /u01/app/django/run/celery-beat.pid
    fi
    if [ -f /u01/app/django/run/celery-worker.pid ]; then
        kill $(cat /u01/app/django/run/celery-worker.pid) 2>/dev/null || true
        rm -f /u01/app/django/run/celery-worker.pid
    fi
    pkill -f "celery.*lms_enterprise" 2>/dev/null || true
fi

# Stop Daphne
echo "[2/5] Stopping Daphne..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/daphne.service ]; then
    sudo systemctl stop daphne 2>/dev/null || true
else
    if [ -f /u01/app/django/run/daphne.pid ]; then
        kill $(cat /u01/app/django/run/daphne.pid) 2>/dev/null || true
        rm -f /u01/app/django/run/daphne.pid
    fi
    pkill -f "daphne.*lms_enterprise" 2>/dev/null || true
fi

# Stop Gunicorn
echo "[3/5] Stopping Gunicorn..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/gunicorn.service ]; then
    sudo systemctl stop gunicorn 2>/dev/null || true
else
    if [ -f /u01/app/django/run/gunicorn.pid ]; then
        kill $(cat /u01/app/django/run/gunicorn.pid) 2>/dev/null || true
        rm -f /u01/app/django/run/gunicorn.pid
    fi
    pkill -f "gunicorn.*lms_enterprise" 2>/dev/null || true
fi

# Stop Redis (optional - usually kept running)
echo "[4/5] Redis - keeping running (shared service)"
# Uncomment to stop: sudo systemctl stop redis 2>/dev/null || pkill redis-server || true

# Stop PostgreSQL (optional - usually kept running)
echo "[5/5] PostgreSQL - keeping running (shared service)"
# PostgreSQL paths: /d01/postgres/18 (data, log, run, wal, archive)
# Uncomment to stop: sudo systemctl stop postgres.service 2>/dev/null || true

echo ""
echo "=========================================="
echo "LMS Enterprise Services Stopped!"
echo "=========================================="
