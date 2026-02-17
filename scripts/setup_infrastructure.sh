#!/bin/bash
###############################################################################
# LMS Enterprise - Infrastructure Setup Script
# This script sets up PostgreSQL directories, Django directories,
# user accounts, and environment configurations.
# Run as: root
###############################################################################

set -e

echo "=============================================="
echo " LMS Enterprise - Infrastructure Setup"
echo "=============================================="

# -----------------------------------------------
# 1. PostgreSQL Directory Structure
# -----------------------------------------------
echo "[1/6] Creating PostgreSQL directory structure..."

mkdir -p /d01/postgres/18          # Binaries
mkdir -p /d02/pgdata/data          # Data files
mkdir -p /d02/pgdata/wal           # Write Ahead Logs
mkdir -p /d02/pgdata/archive       # WAL Archives
mkdir -p /d02/pgdata/log           # PostgreSQL logs
mkdir -p /backup/hot               # Hot Backups
mkdir -p /backup/cold              # Cold Backups

# -----------------------------------------------
# 2. Create pgadmin User
# -----------------------------------------------
echo "[2/6] Creating pgadmin user..."

if ! id "pgadmin" &>/dev/null; then
    useradd -m -s /bin/bash pgadmin
    echo "pgadmin user created."
else
    echo "pgadmin user already exists."
fi

chown -R pgadmin:pgadmin /d01 /d02 /backup
chmod 700 /d02/pgdata/data

# -----------------------------------------------
# 3. Django Application Directory Structure
# -----------------------------------------------
echo "[3/6] Creating Django application directory structure..."

mkdir -p /u01/app/python-venvs
mkdir -p /u01/app/django/apps
mkdir -p /u01/app/django/logs
mkdir -p /u01/app/django/run
mkdir -p /u01/app/django/static
mkdir -p /u01/app/django/media
mkdir -p /u01/app/django/config
mkdir -p /u01/app/django/scripts
mkdir -p /u01/app/django/backup

# -----------------------------------------------
# 4. Create application user
# -----------------------------------------------
echo "[4/6] Creating application user..."

if ! id "lmsapp" &>/dev/null; then
    useradd -m -s /bin/bash lmsapp
    echo "lmsapp user created."
else
    echo "lmsapp user already exists."
fi

chown -R lmsapp:lmsapp /u01
chmod 750 /u01/app/django/apps
chmod 750 /u01/app/django/config
chmod 770 /u01/app/django/logs
chmod 750 /u01/app/django/run

# -----------------------------------------------
# 5. PostgreSQL Environment (.bash_profile for pgadmin)
# -----------------------------------------------
echo "[5/6] Configuring pgadmin environment..."

cat > /home/pgadmin/.bash_profile << 'PGEOF'
# PostgreSQL 18 Environment
export PGPORT=5432
export PGDATA=/d02/pgdata/data
export PGLOGS=/d02/pgdata/log
export PATH=/d01/postgres/18/bin:$PATH
export LD_LIBRARY_PATH=/d01/postgres/18/lib:$LD_LIBRARY_PATH

# Aliases
alias pgstart='/d01/postgres/18/bin/pg_ctl start -D $PGDATA -l $PGLOGS/postgresql.log'
alias pgstop='/d01/postgres/18/bin/pg_ctl stop -D $PGDATA -s -m fast'
alias pgreload='/d01/postgres/18/bin/pg_ctl reload -D $PGDATA'
alias pgstatus='/d01/postgres/18/bin/pg_ctl status -D $PGDATA'
PGEOF

chown pgadmin:pgadmin /home/pgadmin/.bash_profile

# -----------------------------------------------
# 6. Django Application Environment (.bash_profile for lmsapp)
# -----------------------------------------------
echo "[6/6] Configuring lmsapp environment..."

cat > /home/lmsapp/.bash_profile << 'APPEOF'
# Django LMS Enterprise Environment
export DJANGO_BASE=/u01/app/django
export VENV_BASE=/u01/app/python-venvs
export DJANGO_LOG_DIR=/u01/app/django/logs
export DJANGO_RUN_DIR=/u01/app/django/run
export DJANGO_SETTINGS_MODULE=lms_enterprise.settings.production

# Activate virtual environment
if [ -d "$VENV_BASE/lms/bin" ]; then
    source $VENV_BASE/lms/bin/activate
fi
APPEOF

chown lmsapp:lmsapp /home/lmsapp/.bash_profile

echo ""
echo "=============================================="
echo " Infrastructure setup complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Install PostgreSQL 18 binaries to /d01/postgres/18/"
echo "  2. Run: su - pgadmin"
echo "  3. Initialize DB: initdb -D /d02/pgdata/data -X /d02/pgdata/wal --pwprompt"
echo "  4. Configure postgresql.conf"
echo "  5. Create Python venv and install Django"
echo ""
