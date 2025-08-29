#!/bin/bash
set -e

# Check we are root
if [ "$EUID" -ne 0 ]; then
  echo "❌ This script must be run as root"
  exit 1
fi

echo ">>> Updating system..."
apt update -y

echo ">>> Installing latest Node.js (current release) & npm..."
curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
apt install -y nodejs

echo ">>> Installing speed-cloudflare-cli globally..."
npm install -g speed-cloudflare-cli

PKG_DIR="/usr/lib/node_modules/speed-cloudflare-cli"
CLI_FILE="$PKG_DIR/cli.js"

echo ">>> Patching cli.js to remove MaxListeners warnings..."
# Ensure shebang at the very top
sed -i '1s|.*|#!/usr/bin/env node|' "$CLI_FILE"
# Insert defaultMaxListeners = 0 as second line if not already there
grep -q 'defaultMaxListeners' "$CLI_FILE" || \
  sed -i '2i require("events").defaultMaxListeners = 0;' "$CLI_FILE"

echo ">>> Creating wrapper shortcut /usr/local/bin/cloudspeed..."
tee /usr/local/bin/cloudspeed >/dev/null <<'EOF'
#!/bin/bash
NODE_NO_WARNINGS=1 /usr/lib/node_modules/speed-cloudflare-cli/cli.js "$@"
EOF

chmod +x /usr/local/bin/cloudspeed

echo ">>> ✅ Done!"
echo "Run the speed test with: cloudspeed"