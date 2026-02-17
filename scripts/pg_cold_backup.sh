#!/bin/bash
# ============================================================
# PostgreSQL 18 - Cold Backup (Offline)
# Stops PostgreSQL, archives data directory, restarts
# ============================================================

set -e

PGHOME=/d01/postgres/18
PGDATA=/d02/pgdata/data
BACKUP_DIR=/backup/cold
DATE=$(date +%Y-%m-%d_%H%M%S)
ARCHIVE_FILE="${BACKUP_DIR}/cold_backup_${DATE}.tar.gz"
LOG_FILE="${BACKUP_DIR}/cold_backup_${DATE}.log"
RETENTION_DAYS=30

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }

mkdir -p "${BACKUP_DIR}"

log "${YELLOW}[WARN] Cold backup requires stopping PostgreSQL!${NC}"
log "${GREEN}[INFO] Starting cold backup...${NC}"

# Stop PostgreSQL
log "[INFO] Stopping PostgreSQL..."
${PGHOME}/bin/pg_ctl stop -D ${PGDATA} -m fast -w 2>&1 | tee -a "$LOG_FILE"

if ${PGHOME}/bin/pg_isready -q 2>/dev/null; then
    log "${RED}[ERROR] PostgreSQL did not stop cleanly${NC}"
    exit 1
fi

log "[INFO] PostgreSQL stopped. Creating archive..."

# Archive /d02 directory (data + wal + archive)
tar czf "${ARCHIVE_FILE}" \
    -C /d02 pgdata/ \
    2>&1 | tee -a "$LOG_FILE"

BACKUP_SIZE=$(du -sh "${ARCHIVE_FILE}" | cut -f1)
log "${GREEN}[INFO] Archive created: ${ARCHIVE_FILE} (${BACKUP_SIZE})${NC}"

# Restart PostgreSQL
log "[INFO] Restarting PostgreSQL..."
${PGHOME}/bin/pg_ctl start -D ${PGDATA} -l /d02/pgdata/log/postgresql.log -w 2>&1 | tee -a "$LOG_FILE"

if ${PGHOME}/bin/pg_isready -q; then
    log "${GREEN}[SUCCESS] PostgreSQL restarted successfully${NC}"
else
    log "${RED}[ERROR] PostgreSQL failed to restart! Check logs.${NC}"
    exit 1
fi

# Cleanup old backups
log "[INFO] Cleaning cold backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "cold_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null
find "${BACKUP_DIR}" -name "cold_backup_*.log" -mtime +${RETENTION_DAYS} -delete 2>/dev/null

log "${GREEN}[DONE] Cold backup completed: ${ARCHIVE_FILE}${NC}"
