#!/bin/bash
# =============================================================================
# LMS Enterprise - Start All Services
# Usage: ./start_lms.sh
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - All PostgreSQL paths under /d01/postgres/18
PGHOME="/d01/postgres/18"
PGDATA="${PGHOME}/data"
PGLOG="${PGHOME}/log"
PGRUN="${PGHOME}/run"
PGPORT=5432
PGUSER="pgadmin"

# Application paths
APP_HOME="/u01/app/django"
VENV_PATH="/u01/app/django/venv"
ALT_VENV_PATH="/root/venvs/django"

# =============================================================================
# PRE-FLIGHT CHECKS
# =============================================================================
preflight_checks() {
    echo "=========================================="
    echo "Running Pre-flight Checks"
    echo "=========================================="
    
    local errors=0
    
    # Check 1: Required directories exist
    echo -n "[CHECK] PostgreSQL directories exist... "
    for dir in "$PGDATA" "$PGLOG" "$PGRUN"; do
        if [[ ! -d "$dir" ]]; then
            echo -e "${RED}FAILED${NC}"
            echo "  ERROR: Directory $dir does not exist"
            ((errors++)) || true
        fi
    done
    if [[ $errors -eq 0 ]]; then
        echo -e "${GREEN}OK${NC}"
    fi
    
    # Check 2: Directory ownership for PostgreSQL
    echo -n "[CHECK] PostgreSQL directory ownership... "
    local owner=$(stat -c '%U' "$PGDATA" 2>/dev/null)
    if [[ "$owner" != "$PGUSER" ]]; then
        echo -e "${RED}FAILED${NC}"
        echo "  ERROR: $PGDATA is owned by '$owner', expected '$PGUSER'"
        echo "  FIX: chown -R $PGUSER:$PGUSER $PGHOME/{data,log,run,wal,archive}"
        ((errors++)) || true
    else
        echo -e "${GREEN}OK${NC}"
    fi
    
    # Check 3: pg_ctl binary exists
    echo -n "[CHECK] PostgreSQL binary exists... "
    if [[ ! -x "${PGHOME}/bin/pg_ctl" ]]; then
        echo -e "${RED}FAILED${NC}"
        echo "  ERROR: ${PGHOME}/bin/pg_ctl not found or not executable"
        ((errors++)) || true
    else
        echo -e "${GREEN}OK${NC}"
    fi
    
    # Check 4: Redis is installed
    echo -n "[CHECK] Redis is installed... "
    if ! command -v redis-cli &> /dev/null && ! [[ -f /usr/bin/redis-server ]]; then
        echo -e "${RED}FAILED${NC}"
        echo "  ERROR: Redis is not installed"
        echo "  FIX: dnf install -y redis && systemctl enable redis"
        ((errors++)) || true
    else
        echo -e "${GREEN}OK${NC}"
    fi
    
    # Check 5: No conflicting PostgreSQL services
    echo -n "[CHECK] No conflicting PostgreSQL services... "
    if systemctl is-enabled postgresql-18.service &>/dev/null 2>&1; then
        if [[ "$(systemctl is-enabled postgresql-18.service 2>/dev/null)" != "masked" ]]; then
            echo -e "${YELLOW}WARNING${NC}"
            echo "  WARNING: postgresql-18.service is enabled and may conflict"
            echo "  FIX: systemctl mask postgresql-18.service"
        else
            echo -e "${GREEN}OK (masked)${NC}"
        fi
    else
        echo -e "${GREEN}OK${NC}"
    fi
    
    # Check 6: Python virtual environment
    echo -n "[CHECK] Python virtual environment... "
    if [[ -f "${VENV_PATH}/bin/activate" ]]; then
        echo -e "${GREEN}OK${NC}"
    elif [[ -f "${ALT_VENV_PATH}/bin/activate" ]]; then
        echo -e "${GREEN}OK (alternate)${NC}"
        VENV_PATH="$ALT_VENV_PATH"
    else
        echo -e "${RED}FAILED${NC}"
        echo "  ERROR: No virtual environment found at $VENV_PATH or $ALT_VENV_PATH"
        ((errors++)) || true
    fi
    
    echo ""
    if [[ $errors -gt 0 ]]; then
        echo -e "${RED}Pre-flight checks failed with $errors error(s)${NC}"
        echo "Please fix the issues above and try again."
        exit 1
    fi
    echo -e "${GREEN}All pre-flight checks passed!${NC}"
    echo ""
}

# =============================================================================
# HEALTH CHECK FUNCTIONS
# =============================================================================
wait_for_postgresql() {
    local max_wait=30
    local count=0
    echo -n "  Waiting for PostgreSQL to be ready... "
    while [[ $count -lt $max_wait ]]; do
        if su - $PGUSER -c "${PGHOME}/bin/pg_isready -h localhost -p $PGPORT" &>/dev/null; then
            echo -e "${GREEN}READY${NC}"
            return 0
        fi
        sleep 1
        ((count++)) || true
    done
    echo -e "${RED}TIMEOUT${NC}"
    return 1
}

wait_for_redis() {
    local max_wait=15
    local count=0
    echo -n "  Waiting for Redis to be ready... "
    while [[ $count -lt $max_wait ]]; do
        if redis-cli ping &>/dev/null; then
            echo -e "${GREEN}READY${NC}"
            return 0
        fi
        sleep 1
        ((count++)) || true
    done
    echo -e "${RED}TIMEOUT${NC}"
    return 1
}

wait_for_django() {
    local max_wait=30
    local count=0
    echo -n "  Waiting for Django API to be ready... "
    while [[ $count -lt $max_wait ]]; do
        if curl -s http://localhost:8000/health/ | grep -q "healthy"; then
            echo -e "${GREEN}READY${NC}"
            return 0
        fi
        sleep 1
        ((count++)) || true
    done
    echo -e "${YELLOW}NO HEALTH ENDPOINT${NC}"
    # Check if gunicorn is at least responding
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -qE "200|404|301|302"; then
        echo "  (Gunicorn responding, health endpoint may not be configured)"
        return 0
    fi
    return 1
}

# =============================================================================
# MAIN START SEQUENCE
# =============================================================================
echo "=========================================="
echo "Starting LMS Enterprise Services"
echo "=========================================="

# Run pre-flight checks
preflight_checks

# Start PostgreSQL
echo "[1/5] Starting PostgreSQL..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start postgres.service 2>/dev/null || {
        # If systemd service doesn't exist, start manually
        echo "  Using manual start..."
        su - $PGUSER -c "${PGHOME}/bin/pg_ctl -D ${PGDATA} -l ${PGLOG}/postgresql.log start" 2>/dev/null || echo "  PostgreSQL may already be running"
    }
else
    su - $PGUSER -c "${PGHOME}/bin/pg_ctl -D ${PGDATA} -l ${PGLOG}/postgresql.log start" 2>/dev/null || echo "  PostgreSQL may already be running"
fi
wait_for_postgresql || echo "  WARNING: PostgreSQL health check failed"

# Start Redis
echo "[2/5] Starting Redis..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start redis 2>/dev/null || {
        redis-server --daemonize yes 2>/dev/null || echo "  Redis may already be running"
    }
else
    redis-server --daemonize yes 2>/dev/null || echo "  Redis may already be running"
fi
wait_for_redis || echo "  WARNING: Redis health check failed"

# Start Gunicorn (WSGI)
echo "[3/5] Starting Gunicorn (Django WSGI)..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/gunicorn.service ]; then
    sudo systemctl start gunicorn
else
    cd ${APP_HOME}/apps
    source ${VENV_PATH}/bin/activate 2>/dev/null || true
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    export PYTHONPATH=${APP_HOME}/apps
    nohup gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 lms_enterprise.wsgi:application > ${APP_HOME}/logs/gunicorn.log 2>&1 &
    echo $! > ${APP_HOME}/run/gunicorn.pid
fi

# Start Daphne (ASGI/WebSocket)
echo "[4/5] Starting Daphne (WebSocket ASGI)..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/daphne.service ]; then
    sudo systemctl start daphne
else
    cd ${APP_HOME}/apps
    source ${VENV_PATH}/bin/activate 2>/dev/null || true
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    export PYTHONPATH=${APP_HOME}/apps
    nohup daphne -b 0.0.0.0 -p 8001 lms_enterprise.asgi:application > ${APP_HOME}/logs/daphne.log 2>&1 &
    echo $! > ${APP_HOME}/run/daphne.pid
fi

# Start Celery
echo "[5/5] Starting Celery Worker & Beat..."
if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/celery-worker.service ]; then
    sudo systemctl start celery-worker
    sudo systemctl start celery-beat
else
    cd ${APP_HOME}/apps
    source ${VENV_PATH}/bin/activate 2>/dev/null || true
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    export PYTHONPATH=${APP_HOME}/apps
    nohup celery -A lms_enterprise worker --loglevel=info > ${APP_HOME}/logs/celery-worker.log 2>&1 &
    echo $! > ${APP_HOME}/run/celery-worker.pid
    nohup celery -A lms_enterprise beat --loglevel=info > ${APP_HOME}/logs/celery-beat.log 2>&1 &
    echo $! > ${APP_HOME}/run/celery-beat.pid
fi

# Final health check
echo ""
echo "=========================================="
echo "Running Final Health Checks"
echo "=========================================="
sleep 2
wait_for_django || true

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
echo "PostgreSQL Paths (consolidated under $PGHOME):"
echo "  Data:    $PGDATA"
echo "  Logs:    $PGLOG"
echo "  Sockets: $PGRUN"
echo ""
