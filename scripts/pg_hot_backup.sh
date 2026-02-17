#!/bin/bash
# ============================================================
# PostgreSQL 18 - Hot Backup (Online/pg_basebackup)
# Uses pg_basebackup for streaming backup (no downtime)
# ============================================================

set -e

PGHOME=/d01/postgres/18
PGDATA=/d02/pgdata/data
BACKUP_DIR=/backup/hot
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${DATE}"
LOG_FILE="${BACKUP_DIR}/backup_${DATE}.log"
RETENTION_DAYS=7

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }

# Check PostgreSQL is running
if ! ${PGHOME}/bin/pg_isready -q; then
    log "${RED}[ERROR] PostgreSQL is not running. Cannot perform hot backup.${NC}"
    exit 1
fi

log "${GREEN}[INFO] Starting hot backup to: ${BACKUP_PATH}${NC}"

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# Run pg_basebackup with progress and streaming WAL
${PGHOME}/bin/pg_basebackup \
    -D "${BACKUP_PATH}" \
    -Fp \
    -P \
    -X stream \
    -R \
    --checkpoint=fast \
    --label="hot_backup_${DATE}" \
    2>&1 | tee -a "$LOG_FILE"

# Verify backup
if [ -f "${BACKUP_PATH}/PG_VERSION" ]; then
    BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)
    log "${GREEN}[SUCCESS] Hot backup completed. Size: ${BACKUP_SIZE}${NC}"
    log "${GREEN}[INFO] Backup location: ${BACKUP_PATH}${NC}"
else
    log "${RED}[ERROR] Backup verification failed - PG_VERSION not found${NC}"
    exit 1
fi

# Cleanup old backups (keep last N days)
log "${YELLOW}[INFO] Cleaning backups older than ${RETENTION_DAYS} days...${NC}"
find "${BACKUP_DIR}" -maxdepth 1 -type d -name "20*" -mtime +${RETENTION_DAYS} -exec rm -rf {} \; 2>/dev/null
find "${BACKUP_DIR}" -maxdepth 1 -name "backup_*.log" -mtime +${RETENTION_DAYS} -delete 2>/dev/null

log "${GREEN}[DONE] Hot backup process completed${NC}"
