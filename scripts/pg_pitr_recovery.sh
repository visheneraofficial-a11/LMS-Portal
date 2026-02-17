#!/bin/bash
# ============================================================
# PostgreSQL 18 - Point-In-Time Recovery (PITR)
# Restores from base backup + WAL archives to a specific time
# ============================================================

set -e

PGHOME=/d01/postgres/18
PGDATA=/d02/pgdata/data
PGWAL=/d02/pgdata/wal
PGARCHIVE=/d02/pgdata/archive
PGLOGS=/d02/pgdata/log
BACKUP_HOT=/backup/hot
BACKUP_COLD=/backup/cold

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  PostgreSQL 18 - PITR Recovery Tool${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ============================================================
# Step 1: Select backup source
# ============================================================
echo -e "${YELLOW}Available Hot Backups:${NC}"
ls -lt ${BACKUP_HOT}/ 2>/dev/null | grep "^d" | head -10
echo ""
echo -e "${YELLOW}Available Cold Backups:${NC}"
ls -lt ${BACKUP_COLD}/cold_backup_*.tar.gz 2>/dev/null | head -10
echo ""

read -p "Enter backup path (e.g., /backup/hot/2026-02-13_120000): " BACKUP_SOURCE

if [ -z "$BACKUP_SOURCE" ]; then
    echo -e "${RED}No backup source specified. Aborting.${NC}"
    exit 1
fi

# ============================================================
# Step 2: Get target recovery time
# ============================================================
echo ""
echo -e "${YELLOW}Recovery target options:${NC}"
echo "  1) Recover to a specific timestamp"
echo "  2) Recover to latest available (replay all WAL)"
echo "  3) Recover to a specific transaction ID"
echo ""
read -p "Select option [1-3]: " RECOVERY_OPTION

case $RECOVERY_OPTION in
    1)
        read -p "Enter target timestamp (e.g., 2026-02-13 14:30:00): " TARGET_TIME
        RECOVERY_TARGET="recovery_target_time = '${TARGET_TIME}'"
        ;;
    2)
        RECOVERY_TARGET="# Recover to latest"
        ;;
    3)
        read -p "Enter target transaction ID: " TARGET_XID
        RECOVERY_TARGET="recovery_target_xid = '${TARGET_XID}'"
        ;;
    *)
        echo -e "${RED}Invalid option. Aborting.${NC}"
        exit 1
        ;;
esac

# ============================================================
# Step 3: Confirmation
# ============================================================
echo ""
echo -e "${RED}╔══════════════════════════════════════════╗${NC}"
echo -e "${RED}║  WARNING: THIS WILL DESTROY CURRENT DATA ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "  Backup Source : ${BACKUP_SOURCE}"
echo "  Recovery Mode : ${RECOVERY_OPTION}"
echo "  Target        : ${RECOVERY_TARGET}"
echo ""
read -p "Type 'YES' to proceed with PITR recovery: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "Aborted."
    exit 0
fi

# ============================================================
# Step 4: Stop PostgreSQL
# ============================================================
echo -e "${YELLOW}[1/6] Stopping PostgreSQL...${NC}"
${PGHOME}/bin/pg_ctl stop -D ${PGDATA} -m fast -w 2>/dev/null || true
sleep 2

# ============================================================
# Step 5: Backup current data (safety)
# ============================================================
echo -e "${YELLOW}[2/6] Creating safety backup of current data...${NC}"
SAFETY_DIR="/backup/cold/pre_pitr_$(date +%Y%m%d_%H%M%S)"
mkdir -p "${SAFETY_DIR}"
cp -a ${PGDATA} "${SAFETY_DIR}/" 2>/dev/null || true
echo "  Safety backup: ${SAFETY_DIR}"

# ============================================================
# Step 6: Restore base backup
# ============================================================
echo -e "${YELLOW}[3/6] Restoring base backup...${NC}"

# Clear current data
rm -rf ${PGDATA}/*

# Check if source is a directory (hot backup) or tar.gz (cold backup)
if [ -d "$BACKUP_SOURCE" ]; then
    # Hot backup - copy directly
    cp -a "${BACKUP_SOURCE}"/* ${PGDATA}/
elif [[ "$BACKUP_SOURCE" == *.tar.gz ]]; then
    # Cold backup - extract
    tar xzf "${BACKUP_SOURCE}" -C /d02/
else
    echo -e "${RED}Unknown backup format${NC}"
    exit 1
fi

# Fix permissions
chown -R pgadmin:pgadmin ${PGDATA}
chmod 700 ${PGDATA}

# ============================================================
# Step 7: Configure recovery
# ============================================================
echo -e "${YELLOW}[4/6] Configuring recovery settings...${NC}"

# Create recovery signal file
touch ${PGDATA}/recovery.signal

# Add recovery settings to postgresql.conf
cat >> ${PGDATA}/postgresql.conf << RECOVERY_EOF

# ---- PITR Recovery Settings ----
restore_command = 'cp ${PGARCHIVE}/%f %p'
${RECOVERY_TARGET}
recovery_target_action = 'promote'
RECOVERY_EOF

chown pgadmin:pgadmin ${PGDATA}/recovery.signal
chown pgadmin:pgadmin ${PGDATA}/postgresql.conf

# ============================================================
# Step 8: Start PostgreSQL in recovery mode
# ============================================================
echo -e "${YELLOW}[5/6] Starting PostgreSQL in recovery mode...${NC}"
${PGHOME}/bin/pg_ctl start -D ${PGDATA} -l ${PGLOGS}/recovery.log -w -t 600

# ============================================================
# Step 9: Verify recovery
# ============================================================
echo -e "${YELLOW}[6/6] Verifying recovery...${NC}"
sleep 5

if ${PGHOME}/bin/pg_isready -q; then
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     PITR RECOVERY COMPLETED              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    
    # Check if recovery is complete
    IS_IN_RECOVERY=$(${PGHOME}/bin/psql -d postgres -t -c "SELECT pg_is_in_recovery();" 2>/dev/null | tr -d ' ')
    if [ "$IS_IN_RECOVERY" = "f" ]; then
        echo -e "${GREEN}  Database has been promoted and is accepting writes${NC}"
    else
        echo -e "${YELLOW}  Database is still in recovery mode${NC}"
        echo "  Run: SELECT pg_wal_replay_resume(); to complete"
    fi
    
    echo ""
    echo "  Recovery log: ${PGLOGS}/recovery.log"
    echo "  Safety backup: ${SAFETY_DIR}"
else
    echo -e "${RED}PostgreSQL failed to start after recovery!${NC}"
    echo "Check: ${PGLOGS}/recovery.log"
    exit 1
fi
