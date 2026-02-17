#!/bin/bash
# Build and deploy the Teacher Dashboard React app
# Usage: ./build_teacher_dashboard.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="/u01/app/django/teacher-dashboard"
STATIC_DIR="/u01/app/django/static/teacher-dashboard"

echo "=== Building Teacher Dashboard ==="
cd "$PROJECT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build
echo "Building React app..."
npm run build

# Deploy to static
echo "Deploying to Django static..."
mkdir -p "$STATIC_DIR/assets"
cp -f dist/assets/* "$STATIC_DIR/assets/"
cp -f dist/vite.svg "$STATIC_DIR/" 2>/dev/null || true

# Update Django template with correct asset filenames
JS_FILE=$(ls dist/assets/*.js | head -1 | xargs basename)
CSS_FILE=$(ls dist/assets/*.css | head -1 | xargs basename)

cat > /u01/app/django/apps/templates/dashboards/teacher_dashboard_react.html << TEOF
{% load static %}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Teacher Dashboard – EMRS Online</title>
    <script type="module" crossorigin src="{% static 'teacher-dashboard/assets/${JS_FILE}' %}"></script>
    <link rel="stylesheet" crossorigin href="{% static 'teacher-dashboard/assets/${CSS_FILE}' %}">
  </head>
  <body class="bg-gray-50">
    <div id="root"></div>
  </body>
</html>
TEOF

echo "=== Deploy complete ==="
echo "JS:  $JS_FILE"
echo "CSS: $CSS_FILE"
echo "Template updated: teacher_dashboard_react.html"
