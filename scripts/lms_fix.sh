#!/bin/bash
#=============================================================================
# LMS Post-Migration Fix Script
# Fixes:
#   1. Health check endpoint returning 404
#   2. "Admin" label → "Staff" in homepage modal & login page
#   3. Login URL ?role=admin → ?role=staff
#   4. Create Django superuser for /admin/ console
#=============================================================================

set -euo pipefail

PROJECT_DIR="/u01/app/django/apps"
VENV_DIR="/u01/app/django/venv"
BACKUP_DIR="/u01/app/django/backups/fix_$(date +%Y%m%d_%H%M%S)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
err()     { echo -e "${RED}[✗]${NC} $1"; }
section() { echo -e "\n${CYAN}${BOLD}━━━ $1 ━━━${NC}"; }

mkdir -p "$BACKUP_DIR"

# ══════════════════════════════════════════════════════════════════
# FIX 1: Add Health Check Endpoint
# ══════════════════════════════════════════════════════════════════
section "FIX 1: Add Health Check Endpoint"

URLS_FILE="$PROJECT_DIR/lms_enterprise/urls.py"
cp "$URLS_FILE" "$BACKUP_DIR/urls.py.bak"

# Check if health endpoint already exists
if grep -q "health/" "$URLS_FILE"; then
    log "Health check endpoint already exists"
else
    log "Adding health check endpoint to urls.py"

    # Add the health check view and URL pattern
    # Insert after the APIRootView class definition, before urlpatterns
    python3 << 'PYEOF'
import re

urls_file = "/u01/app/django/apps/lms_enterprise/urls.py"

with open(urls_file, 'r') as f:
    content = f.read()

# Add HealthCheckView class after APIRootView
health_view = '''

class HealthCheckView(APIView):
    """Health check endpoint for monitoring and load balancers."""
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        import django
        from django.db import connection
        health = {
            'status': 'healthy',
            'django_version': django.__version__,
            'database': 'unknown',
        }
        try:
            connection.ensure_connection()
            health['database'] = 'connected'
        except Exception as e:
            health['status'] = 'degraded'
            health['database'] = str(e)
        return Response(health)

'''

# Insert HealthCheckView after APIRootView class
content = content.replace(
    "# ============================================================================\n# CORE URL PATTERNS",
    health_view + "# ============================================================================\n# CORE URL PATTERNS"
)

# Add health URL pattern right after admin/
content = content.replace(
    "    path('admin/', admin.site.urls),\n\n    # ── API Root ──",
    "    path('admin/', admin.site.urls),\n\n    # ── Health Check ──\n    path('health/', HealthCheckView.as_view(), name='health-check'),\n\n    # ── API Root ──"
)

with open(urls_file, 'w') as f:
    f.write(content)

print("  Health check endpoint added at /health/")
PYEOF
    log "Health check endpoint added at /health/"
fi

# ══════════════════════════════════════════════════════════════════
# FIX 2: Update Homepage "Admin" → "Staff" in Welcome Modal
# ══════════════════════════════════════════════════════════════════
section "FIX 2: Update Homepage Welcome Modal (Admin → Staff)"

HOME_TEMPLATE="$PROJECT_DIR/templates/frontend/home.html"
if [ -f "$HOME_TEMPLATE" ]; then
    cp "$HOME_TEMPLATE" "$BACKUP_DIR/home.html.bak"

    # Fix the role selector modal on the homepage
    # The modal shows three cards: Student, Teacher, Admin
    # We need to change "Admin" to "Staff" and the link from ?role=admin to ?role=staff

    # Use python for precise multi-line replacements
    python3 << 'PYEOF'
file_path = "/u01/app/django/apps/templates/frontend/home.html"

with open(file_path, 'r') as f:
    content = f.read()

changes = 0

# Fix 1: Change role=admin to role=staff in links/hrefs
import re

# Replace ?role=admin with ?role=staff (in href attributes)
new_content = content.replace('?role=admin', '?role=staff')
if new_content != content:
    changes += content.count('?role=admin')
    content = new_content

# Replace role card label "Admin" with "Staff" in the welcome modal
# This is typically in a card/button that shows the admin role option
# Look for patterns like: >Admin<  or >Admin\n or "Admin" near role selectors

# Common patterns in role selector modals:
# Pattern: <h3>Admin</h3> or similar heading within the role card
# Pattern: <span>Admin</span>
# Pattern: >Admin</ (generic closing)
# We need to be careful to only replace in the role selection context

# Replace "Admin" label text in the role cards only
# Typically these are in a specific section - let's target the common patterns
replacements = [
    # Card title
    ('>Admin</h', '>Staff</h'),
    ('>Admin</', '>Staff</'),
    # Role description
    ('System management', 'System management'),  # Keep description, it's fine
    # Alt text / aria labels
    ("'Admin'", "'Staff'"),
    ('"Admin"', '"Staff"'),
]

# More targeted approach: find the role selection section and replace Admin there
# Look for the section that contains Student, Teacher, Admin cards
lines = content.split('\n')
new_lines = []
in_role_section = False
role_section_depth = 0

for i, line in enumerate(lines):
    # Detect if we're in a role selection section
    # (has Student, Teacher, and Admin cards together)
    if ('Select your role' in line or 'Welcome Back' in line or
        'role-card' in line.lower() or 'role-select' in line.lower()):
        in_role_section = True
        role_section_depth = 0

    if in_role_section:
        role_section_depth += 1
        # Replace Admin with Staff in this section only
        if '>Admin<' in line:
            line = line.replace('>Admin<', '>Staff<')
            changes += 1
        if 'role=admin' in line:
            line = line.replace('role=admin', 'role=staff')
            changes += 1

        # Exit role section after ~50 lines
        if role_section_depth > 50:
            in_role_section = False

    new_lines.append(line)

content = '\n'.join(new_lines)

with open(file_path, 'w') as f:
    f.write(content)

print(f"  Made {changes} replacements in home.html")
PYEOF
    log "Homepage welcome modal updated"
else
    warn "home.html template not found"
fi

# ══════════════════════════════════════════════════════════════════
# FIX 3: Update Login Page (?role=admin → ?role=staff)
# ══════════════════════════════════════════════════════════════════
section "FIX 3: Update Login Page (role=admin → role=staff)"

LOGIN_TEMPLATE="$PROJECT_DIR/templates/accounts/login.html"
if [ -f "$LOGIN_TEMPLATE" ]; then
    cp "$LOGIN_TEMPLATE" "$BACKUP_DIR/login.html.bak"

    python3 << 'PYEOF'
file_path = "/u01/app/django/apps/templates/accounts/login.html"

with open(file_path, 'r') as f:
    content = f.read()

changes = 0

# 1. Replace ?role=admin with ?role=staff in URLs
new_content = content.replace('?role=admin', '?role=staff')
if new_content != content:
    changes += content.count('?role=admin')
    content = new_content

# 2. Replace role value 'admin' with 'staff' in JavaScript/data attributes
# This handles: data-role="admin", value="admin" for role selectors
new_content = content.replace("data-role=\"admin\"", "data-role=\"staff\"")
if new_content != content:
    changes += 1
    content = new_content

new_content = content.replace("data-role='admin'", "data-role='staff'")
if new_content != content:
    changes += 1
    content = new_content

# 3. Replace the role tab/button label "Admin" with "Staff" in the login form
# The login page has role tabs: Student | Teacher | Admin(Staff)
# We need to change the display text while keeping the role value as 'staff'
lines = content.split('\n')
new_lines = []
in_role_tabs = False

for i, line in enumerate(lines):
    original = line

    # Detect role tab section
    if 'role' in line.lower() and ('tab' in line.lower() or 'btn' in line.lower() or 'button' in line.lower()):
        in_role_tabs = True

    # In the role tabs/buttons area, change Admin label to Staff
    # Look for the admin button/tab specifically
    if in_role_tabs or ('Student' in line and 'Teacher' in line):
        # Handle: <button>Admin</button>, <span>Admin</span>, etc.
        if '>Admin<' in line and 'Staff' not in line:
            # Check context - is this in a role selector button/tab?
            line = line.replace('>Admin<', '>Staff<')
            changes += 1

    # Also handle the sidebar/panel that shows "Staff Portal" info
    # The third screenshot shows sidebar already says "Staff Portal" which is good
    # But URL says ?role=admin - we fix that above

    # Handle the specific pattern: 'admin' in JavaScript role comparisons
    # e.g., if (role === 'admin') or role == 'admin'
    if "=== 'admin'" in line or "== 'admin'" in line:
        if 'api' not in line.lower():  # Don't change API endpoint references
            line = line.replace("=== 'admin'", "=== 'staff'")
            line = line.replace("== 'admin'", "== 'staff'")
            changes += 1

    # Handle: case 'admin': in switch statements
    if "case 'admin'" in line:
        if 'api' not in line.lower():
            line = line.replace("case 'admin'", "case 'staff'")
            changes += 1

    new_lines.append(line)

content = '\n'.join(new_lines)

# 4. Fix JavaScript that reads URL params and sets active role
# Replace: role === 'admin' checks with role === 'staff'
# This ensures when ?role=staff is in URL, the Staff tab gets highlighted
import re

# Pattern: role comparisons in JS
content = re.sub(
    r"(selectedRole|currentRole|activeRole|role)\s*===?\s*['\"]admin['\"]",
    r"\1 === 'staff'",
    content
)

# Pattern: default role fallback
content = content.replace("|| 'admin'", "|| 'staff'")

# 5. Fix the sidebar content for admin/staff role
# Change "Sign in to your admin account" → "Sign in to your staff account"
content = content.replace(
    "Sign in to your admin account",
    "Sign in to your staff account"
)

# Change any remaining "Admin Portal" to "Staff Portal" (if not already)
content = content.replace("Admin Portal", "Staff Portal")

with open(file_path, 'w') as f:
    f.write(content)

print(f"  Made {changes} replacements in login.html")
PYEOF
    log "Login page updated: role=admin → role=staff"
else
    warn "login.html template not found"
fi

# ══════════════════════════════════════════════════════════════════
# FIX 3b: Update frontend_views.py (if it handles role redirects)
# ══════════════════════════════════════════════════════════════════
section "FIX 3b: Check frontend_views.py for role references"

FRONTEND_VIEWS=$(find "$PROJECT_DIR" -maxdepth 2 -name "frontend_views*" -name "*.py" -not -path "*__pycache__*" 2>/dev/null | head -1)
if [ -n "$FRONTEND_VIEWS" ] && [ -f "$FRONTEND_VIEWS" ]; then
    cp "$FRONTEND_VIEWS" "$BACKUP_DIR/"

    # Check if frontend_views has admin role references that need updating
    if grep -q "role.*admin" "$FRONTEND_VIEWS" 2>/dev/null; then
        log "Found role references in frontend_views.py"
        
        python3 << PYEOF
file_path = "$FRONTEND_VIEWS"

with open(file_path, 'r') as f:
    content = f.read()

# Update role redirect logic: admin → staff
# e.g., redirect to /staff/dashboard/ when role is 'admin' or 'staff'
import re

# Make the view accept both 'admin' and 'staff' role params
# and redirect to /staff/dashboard/ in both cases
changes = 0

# Pattern: role == 'admin' → role in ('admin', 'staff')
# But only in redirect/login logic, not in API references
lines = content.split('\n')
new_lines = []
for line in lines:
    if "== 'admin'" in line and 'api' not in line.lower():
        line = line.replace("== 'admin'", "in ('admin', 'staff')")
        changes += 1
    elif "=== 'admin'" in line and 'api' not in line.lower():
        line = line.replace("=== 'admin'", "in ('admin', 'staff')")
        changes += 1
    new_lines.append(line)

content = '\n'.join(new_lines)

with open(file_path, 'w') as f:
    f.write(content)

print(f"  Updated {changes} role references in frontend_views.py")
PYEOF
    else
        log "No admin role references in frontend_views.py"
    fi
else
    warn "frontend_views.py not found"
fi

# ══════════════════════════════════════════════════════════════════
# FIX 4: Create Django Admin Superuser
# ══════════════════════════════════════════════════════════════════
section "FIX 4: Create Django Admin Superuser"

ADMIN_USER="enfadmin"
ADMIN_EMAIL="admin@enfclass.com"
ADMIN_PASS="ENF@dmin2026!"

cd "$PROJECT_DIR"

log "Creating Django superuser for /admin/ panel..."
"$VENV_DIR/bin/python" manage.py shell << SHELLEOF
from django.contrib.auth.models import User

username = "$ADMIN_USER"
email = "$ADMIN_EMAIL"
password = "$ADMIN_PASS"

# Check if user already exists
try:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    print(f"  Updated existing superuser: {username}")
except User.DoesNotExist:
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print(f"  Created new superuser: {username}")

print(f"  Username: {username}")
print(f"  Email: {email}")
print(f"  is_staff: {user.is_staff}")
print(f"  is_superuser: {user.is_superuser}")
SHELLEOF

log "Django superuser ready"

# ══════════════════════════════════════════════════════════════════
# FIX 5: Collect Static & Restart
# ══════════════════════════════════════════════════════════════════
section "FIX 5: Collect Static Files & Restart"

cd "$PROJECT_DIR"
"$VENV_DIR/bin/python" manage.py collectstatic --noinput 2>&1 | tail -3
log "Static files collected"

log "Restarting Gunicorn..."
systemctl restart gunicorn
sleep 3

if systemctl is-active --quiet gunicorn; then
    log "Gunicorn is running"
else
    err "Gunicorn failed to start!"
    echo "Check logs: journalctl -u gunicorn -n 50"
fi

# ══════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════
section "ALL FIXES APPLIED"

echo ""
echo -e "${BOLD}Fixes Applied:${NC}"
echo -e "  ${GREEN}1.${NC} Health check endpoint added at /health/"
echo -e "  ${GREEN}2.${NC} Homepage modal: 'Admin' → 'Staff'"
echo -e "  ${GREEN}3.${NC} Login page: ?role=admin → ?role=staff, labels updated"
echo -e "  ${GREEN}4.${NC} Django admin superuser created"
echo ""
echo -e "${BOLD}Django Admin Console Credentials:${NC}"
echo -e "  ${CYAN}URL:${NC}      http://<IP>:8000/admin/"
echo -e "  ${CYAN}Username:${NC} ${BOLD}$ADMIN_USER${NC}"
echo -e "  ${CYAN}Password:${NC} ${BOLD}$ADMIN_PASS${NC}"
echo -e "  ${CYAN}Email:${NC}    $ADMIN_EMAIL"
echo ""
echo -e "${BOLD}URL Map:${NC}"
echo -e "  /admin/              → Django Admin Console (use credentials above)"
echo -e "  /health/             → Health check endpoint"
echo -e "  /staff/dashboard/    → Staff Dashboard"
echo -e "  /student/dashboard/  → Student Dashboard"
echo -e "  /teacher/dashboard/  → Teacher Dashboard"
echo ""
echo -e "${BOLD}Test URLs:${NC}"
echo -e "  http://<IP>:8000/health/"
echo -e "  http://<IP>:8000/admin/"
echo -e "  http://<IP>:8000/login/?role=staff"
echo ""
echo -e "${YELLOW}${BOLD}⚠ IMPORTANT: Change the admin password after first login!${NC}"
echo -e "  Go to: /admin/password_change/"
echo ""
echo -e "Backup saved at: $BACKUP_DIR"
echo ""
