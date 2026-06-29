#!/bin/bash
# Run this from the project root before deploying.
# It builds the React app and copies the output into deployment/public_html/
# so everything needed for cPanel is in one place.

set -e

echo "Building React app..."
npm run build

echo "Copying dist/ into deployment/public_html/..."
# Clear old build files (but keep .htaccess)
find deployment/public_html -not -name '.htaccess' -not -path 'deployment/public_html' -delete 2>/dev/null || true

cp -r dist/. deployment/public_html/

# Restore .htaccess (dist build may not include it)
cp deployment/public_html/.htaccess deployment/public_html/.htaccess 2>/dev/null || true

echo ""
echo "Done! deployment/ is ready."
echo ""
echo "Next steps:"
echo "  git add deployment/"
echo "  git commit -m 'Deploy: update build'"
echo "  git push origin main"
echo "  Then pull in cPanel → Git Version Control"
