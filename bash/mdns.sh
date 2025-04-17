#!/bin/bash

# =============================================================================
# Avahi mDNS Setup Script for Debian/Ubuntu
# -----------------------------------------------------------------------------
# This script installs and configures Avahi (mDNS/Bonjour) so the machine
# can be discovered on the network using hostname.local
#
# Usage (from GitHub or web):
# bash -c "$(curl -fsSL https://your-url/path/install-avahi.sh)"
# =============================================================================

# --- Safety Checks ---
if [ -z "$BASH_VERSION" ]; then
  echo "❌ Please run this script using bash, not sh."
  exit 1
fi

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run this script as root (use sudo)."
  exit 1
fi

# --- Begin ---
echo "📦 Updating package list..."
apt update -y

echo "📥 Installing avahi-daemon and libnss-mdns..."
apt install -y avahi-daemon libnss-mdns

echo "🔧 Enabling avahi-daemon to start on boot..."
systemctl enable avahi-daemon

echo "🚀 Starting avahi-daemon service..."
systemctl start avahi-daemon

# --- Final Status ---
echo "✅ Avahi installation complete!"
echo "ℹ️  Your machine should now be accessible via: $(hostname).local"
echo ""

systemctl status avahi-daemon --no-pager --lines=5

# Optional: test command reminder
echo ""
echo "🔍 You can test using: ping $(hostname).local"