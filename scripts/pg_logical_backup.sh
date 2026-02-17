#!/bin/bash
# ============================================================
# PostgreSQL 18 - Logical Backup (pg_dump)
# Creates SQL dump of LMS_PROD_DB for logical restore
# ============================================================

set -e

PGHOME=/d01/postgres/18
BACKUP_DIR=/backup/hot
DATE=$(date +%Y-%m-%d_%H%M%S)
DB_NAME="LMS_PROD_DB"
DUMP_FILE="${BACKUP_DIR}/${DB_NAME}_dump_${DATE}.sql"
CUSTOM_FILE="${BACKUP_DIR}/${DB_NAME}_dump_${DATE}.dump"
RETENTION_DAYS=14

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[INFO] Starting logical backup of ${DB_NAME}...${NC}"

# SQL format dump (human readable)
${PGHOME}/bin/pg_dump \
    -d "${DB_NAME}" \
    -F p \
    --no-owner \
    --no-privileges \
    -f "${DUMP_FILE}" \
    2>&1

echo -e "${GREEN}[INFO] SQL dump: ${DUMP_FILE} ($(du -sh "${DUMP_FILE}" | cut -f1))${NC}"

# Custom format dump (for pg_restore, compressed)
${PGHOME}/bin/pg_dump \
    -d "${DB_NAME}" \
    -F c \
    -Z 6 \
    -f "${CUSTOM_FILE}" \
    2>&1

echo -e "${GREEN}[INFO] Custom dump: ${CUSTOM_FILE} ($(du -sh "${CUSTOM_FILE}" | cut -f1))${NC}"

# Cleanup old dumps
find "${BACKUP_DIR}" -name "${DB_NAME}_dump_*.sql" -mtime +${RETENTION_DAYS} -delete 2>/dev/null
find "${BACKUP_DIR}" -name "${DB_NAME}_dump_*.dump" -mtime +${RETENTION_DAYS} -delete 2>/dev/null

echo -e "${GREEN}[DONE] Logical backup completed${NC}"
echo ""
echo "Restore commands:"
echo "  SQL:    psql -d ${DB_NAME} -f ${DUMP_FILE}"
echo "  Custom: pg_restore -d ${DB_NAME} ${CUSTOM_FILE}"
