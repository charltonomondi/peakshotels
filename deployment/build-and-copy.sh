#!/bin/bash
# Run this from the project root before deploying.
# It builds the React app and copies the output into deployment/public_html/
# so everything needed for cPanel is in one place.

set -e

echo "=========================================="
echo "  Peaks Hotel — Build & Deploy Prep"
echo "=========================================="
echo ""

# 1. Build React app
echo "Step 1/4: Building React app..."
npm run build
echo "✓ React app built successfully"
echo ""

# 2. Copy dist/ into deployment/public_html/
echo "Step 2/4: Copying build to deployment/public_html/..."
# Clear old build files (but keep .htaccess)
find deployment/public_html -not -name '.htaccess' -not -path 'deployment/public_html' -delete 2>/dev/null || true

cp -r dist/. deployment/public_html/

# Restore .htaccess (dist build may not include it)
cp deployment/public_html/.htaccess deployment/public_html/.htaccess 2>/dev/null || true
echo "✓ Frontend build copied"
echo ""

# 3. Copy server files to deployment/server/
echo "Step 3/4: Copying server files to deployment/server/..."
# Clear old server files (but keep package.json and .env.example)
find deployment/server -not -name 'package.json' -not -name '.env.example' -not -path 'deployment/server' -delete 2>/dev/null || true

cp -r server/. deployment/server/
echo "✓ Server files copied"
echo ""

# 4. Verify deployment folder is ready
echo "Step 4/4: Verifying deployment folder..."
if [ -f "deployment/public_html/index.html" ]; then
    echo "✓ deployment/public_html/index.html exists"
else
    echo "✗ ERROR: deployment/public_html/index.html missing!"
    exit 1
fi

if [ -f "deployment/server/server.js" ]; then
    echo "✓ deployment/server/server.js exists"
else
    echo "✗ ERROR: deployment/server/server.js missing!"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Deployment folder is ready!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  git add deployment/"
echo "  git commit -m 'Deploy: describe what changed'"
echo "  git push origin main"
echo "  Then pull in cPanel → Git Version Control"
echo ""
echo "IMPORTANT: Make sure cPanel Git Version Control is tracking the 'main' branch."
echo ""
