#!/bin/bash
# =============================================================================
# LMS Enterprise - Deployment Script
# Usage: ./deploy.sh [environment]
# =============================================================================

set -euo pipefail

ENVIRONMENT="${1:-production}"
APP_DIR="/u01/app/django/apps"
VENV_DIR="/u01/app/python-venvs/lms"
CONFIG_DIR="/u01/app/django/config"
LOG_DIR="/u01/app/django/logs"
STATIC_DIR="/u01/app/django/static"

echo "=========================================="
echo "LMS Enterprise Deployment"
echo "Environment: ${ENVIRONMENT}"
echo "=========================================="

# 1. Activate virtual environment
echo "[1/8] Activating virtual environment..."
source "${VENV_DIR}/bin/activate"

# 2. Install/upgrade dependencies
echo "[2/8] Installing dependencies..."
pip install --upgrade pip
pip install -r "${APP_DIR}/requirements.txt" --no-cache-dir

# 3. Set Django settings module
export DJANGO_SETTINGS_MODULE="lms_enterprise.settings.${ENVIRONMENT}"
export PYTHONPATH="${APP_DIR}"

# 4. Run database migrations
echo "[3/8] Running database migrations..."
cd "${APP_DIR}"
python manage.py migrate --noinput

# 5. Collect static files
echo "[4/8] Collecting static files..."
python manage.py collectstatic --noinput --clear

# 6. Run system checks
echo "[5/8] Running system checks..."
python manage.py check --deploy

# 7. Restart services
echo "[6/8] Restarting services..."
sudo systemctl restart lms-gunicorn
sudo systemctl restart lms-daphne
sudo systemctl restart lms-celery-worker
sudo systemctl restart lms-celery-beat

# 8. Verify services
echo "[7/8] Verifying services..."
sleep 3
for service in lms-gunicorn lms-daphne lms-celery-worker lms-celery-beat; do
    if systemctl is-active --quiet "${service}"; then
        echo "  ✓ ${service} is running"
    else
        echo "  ✗ ${service} FAILED"
        systemctl status "${service}" --no-pager -l
    fi
done

# 9. Health check
echo "[8/8] Running health check..."
sleep 2
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health/ 2>/dev/null || echo "000")
if [ "${HEALTH_STATUS}" = "200" ]; then
    echo "  ✓ Health check passed"
else
    echo "  ⚠ Health check returned: ${HEALTH_STATUS}"
fi

echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
