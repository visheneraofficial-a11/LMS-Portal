#!/bin/bash
#===============================================================================
# LMS Enterprise - Prerequisites Installation Script
# This script installs PostgreSQL, Redis and Python packages
# Run as root or with sudo
#===============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(dirname "$SCRIPT_DIR")"
VENV_PATH="$APP_ROOT/venv"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

#===============================================================================
# Check if running as root
#===============================================================================
if [[ $EUID -ne 0 ]]; then
   log_warn "This script should be run as root for system package installation"
fi

#===============================================================================
# Detect OS
#===============================================================================
if [ -f /etc/redhat-release ]; then
    OS="rhel"
    PKG_MANAGER="dnf"
    log_info "Detected RHEL/CentOS/Rocky Linux"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    PKG_MANAGER="apt-get"
    log_info "Detected Debian/Ubuntu"
else
    log_warn "Unknown OS, assuming RHEL-based"
    OS="rhel"
    PKG_MANAGER="dnf"
fi

#===============================================================================
# Install PostgreSQL
#===============================================================================
install_postgresql() {
    log_info "Installing PostgreSQL..."
    
    if [ "$OS" == "rhel" ]; then
        # Enable EPEL if needed
        dnf install -y epel-release 2>/dev/null || true
        
        # Install PostgreSQL
        dnf install -y postgresql-server postgresql postgresql-contrib
        
        # Initialize database if not done
        if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
            postgresql-setup --initdb
        fi
        
        # Start and enable
        systemctl start postgresql
        systemctl enable postgresql
        
    elif [ "$OS" == "debian" ]; then
        apt-get update
        apt-get install -y postgresql postgresql-contrib
        
        systemctl start postgresql
        systemctl enable postgresql
    fi
    
    log_info "PostgreSQL installed successfully"
}

#===============================================================================
# Install Redis
#===============================================================================
install_redis() {
    log_info "Installing Redis..."
    
    if [ "$OS" == "rhel" ]; then
        dnf install -y redis
        systemctl start redis
        systemctl enable redis
        
    elif [ "$OS" == "debian" ]; then
        apt-get update
        apt-get install -y redis-server
        systemctl start redis-server
        systemctl enable redis-server
    fi
    
    log_info "Redis installed successfully"
}

#===============================================================================
# Setup Database
#===============================================================================
setup_database() {
    log_info "Setting up LMS database..."
    
    # Wait for PostgreSQL
    sleep 2
    
    # Create user and database
    sudo -u postgres psql << 'EOF'
-- Create application user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'lms_app_user') THEN
        CREATE USER lms_app_user WITH PASSWORD 'LmsSecure@2024!' CREATEDB;
    END IF;
END
$$;

-- Create database
SELECT 'CREATE DATABASE "LMS_PROD_DB" OWNER lms_app_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'LMS_PROD_DB')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "LMS_PROD_DB" TO lms_app_user;
EOF

    log_info "Database setup complete"
}

#===============================================================================
# Install Python packages
#===============================================================================
install_python_packages() {
    log_info "Installing Python packages..."
    
    # Activate virtual environment
    source "$VENV_PATH/bin/activate"
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install from requirements.txt
    if [ -f "$APP_ROOT/apps/requirements.txt" ]; then
        pip install -r "$APP_ROOT/apps/requirements.txt"
    else
        # Install core packages
        pip install \
            Django==5.1.4 \
            djangorestframework==3.15.2 \
            django-filter==24.3 \
            django-cors-headers==4.6.0 \
            djangorestframework-simplejwt==5.4.0 \
            psycopg2-binary \
            dj-database-url \
            django-redis \
            redis \
            channels \
            channels-redis \
            daphne \
            gunicorn \
            celery \
            whitenoise \
            python-dotenv \
            Pillow
    fi
    
    log_info "Python packages installed successfully"
}

#===============================================================================
# Run Django setup
#===============================================================================
run_django_setup() {
    log_info "Running Django migrations..."
    
    source "$VENV_PATH/bin/activate"
    cd "$APP_ROOT/apps"
    
    # Set environment
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    export USE_SQLITE=false
    
    # Run migrations
    python manage.py migrate
    
    # Collect static files
    python manage.py collectstatic --noinput
    
    log_info "Django setup complete"
}

#===============================================================================
# Create superuser
#===============================================================================
create_superuser() {
    log_info "Creating Django superuser..."
    
    source "$VENV_PATH/bin/activate"
    cd "$APP_ROOT/apps"
    
    export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.development
    
    # Create superuser non-interactively
    python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@lms-enterprise.com', 'LmsAdmin@2024!')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

    log_info "Superuser setup complete"
}

#===============================================================================
# Main
#===============================================================================
main() {
    echo "============================================"
    echo "  LMS Enterprise - Prerequisites Setup"
    echo "============================================"
    echo ""
    
    PS3='Select installation option: '
    options=(
        "Install Everything (Recommended)"
        "Install PostgreSQL only"
        "Install Redis only"
        "Install Python packages only"
        "Setup Database only"
        "Run Django migrations only"
        "Create Superuser only"
        "Exit"
    )
    
    select opt in "${options[@]}"
    do
        case $opt in
            "Install Everything (Recommended)")
                install_postgresql
                install_redis
                setup_database
                install_python_packages
                run_django_setup
                create_superuser
                log_info "Full installation completed!"
                break
                ;;
            "Install PostgreSQL only")
                install_postgresql
                break
                ;;
            "Install Redis only")
                install_redis
                break
                ;;
            "Install Python packages only")
                install_python_packages
                break
                ;;
            "Setup Database only")
                setup_database
                break
                ;;
            "Run Django migrations only")
                run_django_setup
                break
                ;;
            "Create Superuser only")
                create_superuser
                break
                ;;
            "Exit")
                break
                ;;
            *) echo "Invalid option $REPLY";;
        esac
    done
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
