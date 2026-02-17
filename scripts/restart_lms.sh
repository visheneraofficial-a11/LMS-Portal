#!/bin/bash
# =============================================================================
# LMS Enterprise - Restart All Services
# Usage: ./restart_lms.sh
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Restarting LMS Enterprise..."
"${SCRIPT_DIR}/stop_lms.sh"
sleep 2
"${SCRIPT_DIR}/start_lms.sh"
