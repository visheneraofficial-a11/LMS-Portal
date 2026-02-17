#!/bin/bash
# =============================================================================
# LMS Enterprise - PostgreSQL Backup Script
# Runs pg_dump for logical backups, managed by cron or Celery Beat
# =============================================================================

set -euo pipefail

# Configuration
PG_BIN="/d01/postgres/18/bin"
PG_DATA="/d02/pgdata/data"
DB_NAME="LMS_PROD_DB"
DB_USER="pgadmin"
HOT_BACKUP="/backup/hot"
COLD_BACKUP="/backup/cold"
RETENTION_DAYS=30
DATE_STAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${HOT_BACKUP}/${DB_NAME}_${DATE_STAMP}.sql.gz"
LOG_FILE="/u01/app/django/logs/backup_${DATE_STAMP}.log"

echo "Starting backup at $(date)" | tee "$LOG_FILE"

# Logical backup with pg_dump
echo "Running pg_dump..." | tee -a "$LOG_FILE"
"${PG_BIN}/pg_dump" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -F c \
    -Z 6 \
    --verbose \
    -f "${BACKUP_FILE}" \
    2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})" | tee -a "$LOG_FILE"

    # Generate checksum
    sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"
    echo "Checksum generated" | tee -a "$LOG_FILE"

    # Copy to cold storage if backup is older than 7 days
    # (handled by separate cron)
else
    echo "BACKUP FAILED!" | tee -a "$LOG_FILE"
    exit 1
fi

# Cleanup old backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days..." | tee -a "$LOG_FILE"
find "${HOT_BACKUP}" -name "${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find "${HOT_BACKUP}" -name "${DB_NAME}_*.sha256" -mtime +${RETENTION_DAYS} -delete

echo "Backup process completed at $(date)" | tee -a "$LOG_FILE"
