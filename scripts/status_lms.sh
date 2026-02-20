#!/bin/bash
# =============================================================================
# LMS Enterprise - Service Status Check
# Usage: ./status_lms.sh
# =============================================================================

# Configuration - All PostgreSQL paths under /d01/postgres/18
PGHOME="/d01/postgres/18"
PGDATA="${PGHOME}/data"
PGLOG="${PGHOME}/log"
PGRUN="${PGHOME}/run"
PGPORT=5432
PGUSER="pgadmin"

echo "=========================================="
echo "LMS Enterprise Service Status"
echo "=========================================="
echo ""

check_process() {
    local name=$1
    local pattern=$2
    local port=$3
    
    if pgrep -f "$pattern" > /dev/null 2>&1; then
        pid=$(pgrep -f "$pattern" | head -1)
        echo "  ✓ $name: RUNNING (PID: $pid)"
        if [ -n "$port" ]; then
            if ss -tlnp 2>/dev/null | grep -q ":$port " || netstat -tlnp 2>/dev/null | grep -q ":$port "; then
                echo "    └─ Listening on port $port"
            fi
        fi
    else
        echo "  ✗ $name: STOPPED"
    fi
}

echo "Application Services:"
check_process "Gunicorn (WSGI)" "gunicorn.*lms_enterprise" "8000"
check_process "Daphne (ASGI)" "daphne.*lms_enterprise" "8001"
check_process "Celery Worker" "celery.*worker.*lms_enterprise" ""
check_process "Celery Beat" "celery.*beat.*lms_enterprise" ""

echo ""
echo "Infrastructure Services:"
check_process "PostgreSQL" "postgres" "$PGPORT"
check_process "Redis" "redis-server" "6379"

echo ""
echo "=========================================="
echo "Quick Health Checks"
echo "=========================================="

# Django health check
echo -n "  Django API: "
DJANGO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health/ 2>/dev/null || echo "000")
if [ "$DJANGO_STATUS" = "200" ]; then
    echo "HEALTHY (HTTP 200)"
elif [ "$DJANGO_STATUS" = "401" ] || [ "$DJANGO_STATUS" = "404" ]; then
    echo "RESPONDING (HTTP $DJANGO_STATUS)"
else
    echo "NOT RESPONDING"
fi

# PostgreSQL check
echo -n "  PostgreSQL: "
if [[ -x "${PGHOME}/bin/pg_isready" ]]; then
    if ${PGHOME}/bin/pg_isready -h localhost -p $PGPORT > /dev/null 2>&1; then
        echo "ACCEPTING CONNECTIONS"
    else
        echo "CONNECTION FAILED"
    fi
elif command -v psql &> /dev/null; then
    if psql -h localhost -U postgres -c "SELECT 1" > /dev/null 2>&1; then
        echo "CONNECTED"
    else
        echo "CONNECTION FAILED"
    fi
else
    echo "PostgreSQL tools not in PATH"
fi

# Redis check
echo -n "  Redis: "
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        echo "CONNECTED (PONG)"
    else
        echo "CONNECTION FAILED"
    fi
else
    echo "redis-cli not in PATH"
fi

echo ""
echo "=========================================="
echo "PostgreSQL Directory Layout"
echo "=========================================="
echo "  PGHOME:   $PGHOME"
echo "  PGDATA:   $PGDATA"
echo "  PGLOG:    $PGLOG"
echo "  PGRUN:    $PGRUN"
echo "  PGPORT:   $PGPORT"

# Check if socket exists
if [[ -S "${PGRUN}/.s.PGSQL.${PGPORT}" ]]; then
    echo "  Socket:   ${PGRUN}/.s.PGSQL.${PGPORT} (exists)"
else
    echo "  Socket:   ${PGRUN}/.s.PGSQL.${PGPORT} (NOT FOUND)"
fi

echo ""
