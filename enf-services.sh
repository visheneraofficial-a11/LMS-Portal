#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  ENF Online Class — Service Manager
#  Manages: PostgreSQL, Gunicorn (Django), Cloudflare Tunnel
# ═══════════════════════════════════════════════════════════════════════════
#
#  Usage:
#    ./enf-services.sh start       Start all services
#    ./enf-services.sh stop        Stop all services
#    ./enf-services.sh restart     Restart all services
#    ./enf-services.sh status      Show status of all services
#    ./enf-services.sh reload      Graceful reload (gunicorn HUP)
#
#    ./enf-services.sh start db        Start only PostgreSQL
#    ./enf-services.sh start app       Start only Gunicorn
#    ./enf-services.sh start tunnel    Start only Cloudflare tunnel
#
#    ./enf-services.sh stop db         Stop only PostgreSQL
#    ./enf-services.sh stop app        Stop only Gunicorn
#    ./enf-services.sh stop tunnel     Stop only Cloudflare tunnel
#
#    ./enf-services.sh logs app        Tail gunicorn logs
#    ./enf-services.sh logs tunnel     Tail cloudflare logs
#    ./enf-services.sh logs db         Tail PostgreSQL logs
#
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────
APP_NAME="ENF Online Class"
BASE_DIR="/u01/app/django"
APP_DIR="${BASE_DIR}/apps"
VENV_DIR="${BASE_DIR}/venv"
LOG_DIR="${BASE_DIR}/logs"
PID_FILE="${BASE_DIR}/gunicorn.pid"
STATIC_DIR="${BASE_DIR}/static"

# Gunicorn settings
GUNICORN_BIND="0.0.0.0:8000"
GUNICORN_WORKERS=4
GUNICORN_MODULE="lms_enterprise.wsgi:application"
GUNICORN_ACCESS_LOG="${LOG_DIR}/gunicorn_access.log"
GUNICORN_ERROR_LOG="${LOG_DIR}/gunicorn_error.log"

# Service names
DB_SERVICE="postgres"
TUNNEL_SERVICE="cloudflared"
SSH_TUNNEL_SERVICE="cloudflared-ssh"

# Public URLs
PUBLIC_URL="https://lms.automatebot.shop"
SSH_URL="https://server113.nervescape.com"
LOCAL_URL="http://192.168.1.113:8000"

# ─── Colors ───────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─── Helper Functions ─────────────────────────────────────────────────────

print_header() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  ${BOLD}${APP_NAME} — Service Manager${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

log_info()    { echo -e "  ${BLUE}[INFO]${NC}    $1"; }
log_success() { echo -e "  ${GREEN}[  OK  ]${NC}  $1"; }
log_warn()    { echo -e "  ${YELLOW}[ WARN ]${NC}  $1"; }
log_error()   { echo -e "  ${RED}[FAILED]${NC}  $1"; }
log_action()  { echo -e "  ${CYAN}[  >>  ]${NC}  $1"; }

divider() {
    echo -e "  ${PURPLE}───────────────────────────────────────────────────────${NC}"
}

is_db_running() {
    systemctl is-active --quiet "${DB_SERVICE}" 2>/dev/null
}

is_app_running() {
    # Check systemd-managed gunicorn first
    if systemctl is-active --quiet gunicorn.service 2>/dev/null; then
        return 0
    fi
    # Fallback to PID file check for manual starts
    if [[ -f "${PID_FILE}" ]]; then
        local pid
        pid=$(cat "${PID_FILE}" 2>/dev/null)
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

is_tunnel_running() {
    systemctl is-active --quiet "${TUNNEL_SERVICE}" 2>/dev/null
}

get_pid() {
    # Check systemd-managed gunicorn first
    if systemctl is-active --quiet gunicorn.service 2>/dev/null; then
        systemctl show gunicorn.service -p MainPID --value 2>/dev/null
    elif [[ -f "${PID_FILE}" ]]; then
        cat "${PID_FILE}" 2>/dev/null
    else
        echo "N/A"
    fi
}

get_worker_count() {
    local pid
    pid=$(get_pid)
    if [[ -n "$pid" && "$pid" != "N/A" && "$pid" != "0" ]]; then
        pgrep -P "$pid" 2>/dev/null | wc -l
    else
        echo "0"
    fi
}

# ─── Database (PostgreSQL) ────────────────────────────────────────────────

start_db() {
    log_action "Starting PostgreSQL..."
    if is_db_running; then
        log_warn "PostgreSQL is already running"
        return 0
    fi
    sudo systemctl start "${DB_SERVICE}"
    sleep 2
    if is_db_running; then
        log_success "PostgreSQL started"
    else
        log_error "PostgreSQL failed to start"
        return 1
    fi
}

stop_db() {
    log_action "Stopping PostgreSQL..."
    if ! is_db_running; then
        log_warn "PostgreSQL is not running"
        return 0
    fi
    sudo systemctl stop "${DB_SERVICE}"
    sleep 2
    if ! is_db_running; then
        log_success "PostgreSQL stopped"
    else
        log_error "PostgreSQL did not stop"
        return 1
    fi
}

restart_db() {
    log_action "Restarting PostgreSQL..."
    sudo systemctl restart "${DB_SERVICE}"
    sleep 2
    if is_db_running; then
        log_success "PostgreSQL restarted"
    else
        log_error "PostgreSQL failed to restart"
        return 1
    fi
}

status_db() {
    if is_db_running; then
        echo -e "  ${GREEN}●${NC} ${BOLD}PostgreSQL${NC}          ${GREEN}running${NC}"
    else
        echo -e "  ${RED}●${NC} ${BOLD}PostgreSQL${NC}          ${RED}stopped${NC}"
    fi
}

# ─── Application (Gunicorn / Django) ──────────────────────────────────────

start_app() {
    log_action "Starting Gunicorn (Django)..."
    if is_app_running; then
        log_warn "Gunicorn is already running (PID: $(get_pid))"
        return 0
    fi

    # Ensure log directory exists
    mkdir -p "${LOG_DIR}"

    # Ensure database is running first
    if ! is_db_running; then
        log_warn "PostgreSQL is not running — starting it first..."
        start_db
    fi

    # Activate venv and start gunicorn
    cd "${APP_DIR}"
    source "${VENV_DIR}/bin/activate"

    # Collect static files silently
    python manage.py collectstatic --noinput > /dev/null 2>&1 || true

    # Start gunicorn as daemon
    python -m gunicorn "${GUNICORN_MODULE}" \
        --bind "${GUNICORN_BIND}" \
        --workers "${GUNICORN_WORKERS}" \
        --daemon \
        --pid "${PID_FILE}" \
        --access-logfile "${GUNICORN_ACCESS_LOG}" \
        --error-logfile "${GUNICORN_ERROR_LOG}" \
        --timeout 120 \
        --graceful-timeout 30

    sleep 2
    if is_app_running; then
        log_success "Gunicorn started (PID: $(get_pid), Workers: $(get_worker_count))"
        log_info "Local:  ${LOCAL_URL}/admin/"
    else
        log_error "Gunicorn failed to start — check ${GUNICORN_ERROR_LOG}"
        return 1
    fi
}

stop_app() {
    log_action "Stopping Gunicorn..."
    if ! is_app_running; then
        log_warn "Gunicorn is not running"
        # Clean up stale PID file
        [[ -f "${PID_FILE}" ]] && rm -f "${PID_FILE}"
        return 0
    fi

    local pid
    pid=$(cat "${PID_FILE}" 2>/dev/null)

    # Graceful shutdown (SIGTERM)
    kill -TERM "$pid" 2>/dev/null || true
    
    # Wait up to 10 seconds for graceful shutdown
    local count=0
    while kill -0 "$pid" 2>/dev/null && [[ $count -lt 10 ]]; do
        sleep 1
        ((count++))
    done

    # Force kill if still running
    if kill -0 "$pid" 2>/dev/null; then
        log_warn "Graceful shutdown timed out — force killing..."
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
    fi

    rm -f "${PID_FILE}"
    log_success "Gunicorn stopped"
}

restart_app() {
    stop_app
    sleep 1
    start_app
}

reload_app() {
    log_action "Reloading Gunicorn (graceful)..."
    if ! is_app_running; then
        log_warn "Gunicorn is not running — starting it instead"
        start_app
        return
    fi

    # Collect static files
    cd "${APP_DIR}"
    source "${VENV_DIR}/bin/activate"
    python manage.py collectstatic --noinput > /dev/null 2>&1 || true

    local pid
    pid=$(cat "${PID_FILE}" 2>/dev/null)
    kill -HUP "$pid"
    sleep 2

    if is_app_running; then
        log_success "Gunicorn reloaded (PID: $(get_pid), Workers: $(get_worker_count))"
    else
        log_error "Gunicorn reload failed — restarting..."
        start_app
    fi
}

status_app() {
    if is_app_running; then
        echo -e "  ${GREEN}●${NC} ${BOLD}Gunicorn (Django)${NC}   ${GREEN}running${NC}  PID: $(get_pid)  Workers: $(get_worker_count)"
    else
        echo -e "  ${RED}●${NC} ${BOLD}Gunicorn (Django)${NC}   ${RED}stopped${NC}"
    fi
}

# ─── Cloudflare Tunnel ────────────────────────────────────────────────────

start_tunnel() {
    log_action "Starting Cloudflare Tunnel..."
    if is_tunnel_running; then
        log_warn "Cloudflare Tunnel is already running"
        return 0
    fi
    sudo systemctl start "${TUNNEL_SERVICE}"
    sleep 3
    if is_tunnel_running; then
        log_success "Cloudflare Tunnel started"
        log_info "Public: ${PUBLIC_URL}/admin/"
    else
        log_error "Cloudflare Tunnel failed to start"
        return 1
    fi
}

stop_tunnel() {
    log_action "Stopping Cloudflare Tunnel..."
    if ! is_tunnel_running; then
        log_warn "Cloudflare Tunnel is not running"
        return 0
    fi
    sudo systemctl stop "${TUNNEL_SERVICE}"
    sleep 2
    if ! is_tunnel_running; then
        log_success "Cloudflare Tunnel stopped"
    else
        log_error "Cloudflare Tunnel did not stop"
        return 1
    fi
}

restart_tunnel() {
    log_action "Restarting Cloudflare Tunnel..."
    sudo systemctl restart "${TUNNEL_SERVICE}"
    sleep 3
    if is_tunnel_running; then
        log_success "Cloudflare Tunnel restarted"
        log_info "Public: ${PUBLIC_URL}/admin/"
    else
        log_error "Cloudflare Tunnel failed to restart"
        return 1
    fi
}

status_tunnel() {
    if is_tunnel_running; then
        echo -e "  ${GREEN}●${NC} ${BOLD}Cloudflare Tunnel${NC}   ${GREEN}running${NC}  → ${PUBLIC_URL}"
    else
        echo -e "  ${RED}●${NC} ${BOLD}Cloudflare Tunnel${NC}   ${RED}stopped${NC}"
    fi
}

# ─── Aggregate Operations ─────────────────────────────────────────────────

start_all() {
    print_header
    echo -e "  ${BOLD}Starting all services...${NC}"
    divider
    start_db
    start_app
    start_tunnel
    divider
    echo ""
    echo -e "  ${GREEN}${BOLD}All services started successfully!${NC}"
    echo -e "  ${CYAN}Local:${NC}   ${LOCAL_URL}/admin/"
    echo -e "  ${CYAN}Public:${NC}  ${PUBLIC_URL}/admin/"
    echo ""
}

stop_all() {
    print_header
    echo -e "  ${BOLD}Stopping all services...${NC}"
    divider
    stop_tunnel
    stop_app
    stop_db
    divider
    echo ""
    echo -e "  ${YELLOW}${BOLD}All services stopped.${NC}"
    echo ""
}

restart_all() {
    print_header
    echo -e "  ${BOLD}Restarting all services...${NC}"
    divider
    restart_db
    restart_app
    restart_tunnel
    divider
    echo ""
    echo -e "  ${GREEN}${BOLD}All services restarted!${NC}"
    echo -e "  ${CYAN}Local:${NC}   ${LOCAL_URL}/admin/"
    echo -e "  ${CYAN}Public:${NC}  ${PUBLIC_URL}/admin/"
    echo ""
}

reload_all() {
    print_header
    echo -e "  ${BOLD}Reloading application (graceful)...${NC}"
    divider
    reload_app
    divider
    echo ""
}

status_all() {
    print_header
    echo -e "  ${BOLD}Service Status${NC}"
    divider
    status_db
    status_app
    status_tunnel
    divider

    # Connectivity check
    echo ""
    echo -e "  ${BOLD}Connectivity${NC}"
    divider

    # Local check
    local local_code
    local_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${LOCAL_URL}/admin/" 2>/dev/null || echo "000")
    if [[ "$local_code" == "302" || "$local_code" == "200" ]]; then
        echo -e "  ${GREEN}●${NC} Local endpoint      ${GREEN}reachable${NC}  (HTTP ${local_code})"
    else
        echo -e "  ${RED}●${NC} Local endpoint      ${RED}unreachable${NC}  (HTTP ${local_code})"
    fi

    # Public check
    local public_code
    public_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${PUBLIC_URL}/admin/" 2>/dev/null || echo "000")
    if [[ "$public_code" == "302" || "$public_code" == "200" ]]; then
        echo -e "  ${GREEN}●${NC} Public endpoint     ${GREEN}reachable${NC}  (HTTP ${public_code})"
    else
        echo -e "  ${RED}●${NC} Public endpoint     ${RED}unreachable${NC}  (HTTP ${public_code})"
    fi

    divider
    echo ""
}

# ─── Logs ─────────────────────────────────────────────────────────────────

logs_app() {
    echo -e "${CYAN}Tailing Gunicorn logs (Ctrl+C to stop)...${NC}"
    echo -e "${CYAN}Access: ${GUNICORN_ACCESS_LOG}${NC}"
    echo -e "${CYAN}Error:  ${GUNICORN_ERROR_LOG}${NC}"
    echo ""
    tail -f "${GUNICORN_ACCESS_LOG}" "${GUNICORN_ERROR_LOG}" 2>/dev/null
}

logs_tunnel() {
    echo -e "${CYAN}Tailing Cloudflare Tunnel logs (Ctrl+C to stop)...${NC}"
    echo ""
    sudo journalctl -u "${TUNNEL_SERVICE}" -f --no-pager
}

logs_db() {
    echo -e "${CYAN}Tailing PostgreSQL logs (Ctrl+C to stop)...${NC}"
    echo ""
    sudo journalctl -u "${DB_SERVICE}" -f --no-pager
}

# ─── Usage ────────────────────────────────────────────────────────────────

usage() {
    print_header
    echo -e "  ${BOLD}Usage:${NC}  $0 ${CYAN}<command>${NC} [${YELLOW}service${NC}]"
    echo ""
    echo -e "  ${BOLD}Commands:${NC}"
    echo -e "    ${CYAN}start${NC}     [db|app|tunnel]    Start services (all if no service specified)"
    echo -e "    ${CYAN}stop${NC}      [db|app|tunnel]    Stop services"
    echo -e "    ${CYAN}restart${NC}   [db|app|tunnel]    Restart services"
    echo -e "    ${CYAN}reload${NC}                       Graceful reload (gunicorn only, collects static)"
    echo -e "    ${CYAN}status${NC}                       Show status of all services + connectivity"
    echo -e "    ${CYAN}logs${NC}      <db|app|tunnel>    Tail service logs"
    echo ""
    echo -e "  ${BOLD}Services:${NC}"
    echo -e "    ${YELLOW}db${NC}        PostgreSQL 18.2 (systemd: ${DB_SERVICE})"
    echo -e "    ${YELLOW}app${NC}       Gunicorn + Django (PID: ${PID_FILE})"
    echo -e "    ${YELLOW}tunnel${NC}    Cloudflare Tunnel (systemd: ${TUNNEL_SERVICE})"
    echo ""
    echo -e "  ${BOLD}Examples:${NC}"
    echo -e "    $0 start              # Start all services"
    echo -e "    $0 stop tunnel        # Stop only Cloudflare"
    echo -e "    $0 restart app        # Restart only Gunicorn"
    echo -e "    $0 reload             # Graceful reload + collect static"
    echo -e "    $0 status             # Check everything"
    echo -e "    $0 logs app           # Tail gunicorn logs"
    echo ""
    echo -e "  ${BOLD}URLs:${NC}"
    echo -e "    Local:   ${LOCAL_URL}/admin/"
    echo -e "    Public:  ${PUBLIC_URL}/admin/"
    echo ""
}

# ─── Main Dispatch ────────────────────────────────────────────────────────

main() {
    local cmd="${1:-}"
    local svc="${2:-all}"

    case "$cmd" in
        start)
            case "$svc" in
                db)      start_db ;;
                app)     start_app ;;
                tunnel)  start_tunnel ;;
                all|"")  start_all ;;
                *)       log_error "Unknown service: $svc"; usage; exit 1 ;;
            esac
            ;;
        stop)
            case "$svc" in
                db)      stop_db ;;
                app)     stop_app ;;
                tunnel)  stop_tunnel ;;
                all|"")  stop_all ;;
                *)       log_error "Unknown service: $svc"; usage; exit 1 ;;
            esac
            ;;
        restart)
            case "$svc" in
                db)      restart_db ;;
                app)     restart_app ;;
                tunnel)  restart_tunnel ;;
                all|"")  restart_all ;;
                *)       log_error "Unknown service: $svc"; usage; exit 1 ;;
            esac
            ;;
        reload)
            reload_all
            ;;
        status)
            status_all
            ;;
        logs)
            case "$svc" in
                app)     logs_app ;;
                tunnel)  logs_tunnel ;;
                db)      logs_db ;;
                *)       log_error "Specify a service: db, app, or tunnel"; exit 1 ;;
            esac
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            usage
            exit 1
            ;;
    esac
}

main "$@"
