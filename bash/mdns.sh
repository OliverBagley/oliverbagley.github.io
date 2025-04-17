#!/bin/bash

# =============================================================================
# Avahi mDNS Setup Script for Debian/Ubuntu (with App Port Advertise Support)
# bash -c "$(curl -fsSL https://raw.githubusercontent.com/OliverBagley/oliverbagley.github.io/master/bash/mdns.sh)"
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

# --- Variables ---
AVAHI_SERVICE_DIR="/etc/avahi/services"
SERVICE_FILE="$AVAHI_SERVICE_DIR/app-http.service"
HOSTNAME="$(hostname)"
IN_LXC=$(grep -qa container=lxc /proc/1/environ && echo "yes" || echo "no")

# --- Install Avahi ---
echo "📦 Updating package list..."
apt update -y

echo "📥 Installing avahi-daemon and libnss-mdns..."
apt install -y avahi-daemon libnss-mdns -qq

echo "🔧 Enabling avahi-daemon to start on boot..."
systemctl enable avahi-daemon

echo "🚀 Starting avahi-daemon service..."
systemctl restart avahi-daemon

# --- App Port Configuration ---
configure_port_advertisement() {
  echo "🌐 This will advertise your app on the network via mDNS."

  # Ask user for port
  read -rp "📣 What port does your app use? (e.g., 3000): " APP_PORT

  # Ask for protocol
  read -rp "🌍 What protocol? (http, https, ssh, etc) [default: http]: " APP_PROTO
  APP_PROTO="${APP_PROTO:-http}"

  # Create Avahi service file
  mkdir -p "$AVAHI_SERVICE_DIR"
  cat > "$SERVICE_FILE" <<EOF
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">${HOSTNAME} ${APP_PROTO}</name>
  <service>
    <type>_${APP_PROTO}._tcp</type>
    <port>${APP_PORT}</port>
  </service>
</service-group>
EOF

  echo "✅ Avahi service file created at $SERVICE_FILE"
  systemctl restart avahi-daemon
  echo "🌍 Now accessible at: ${HOSTNAME}.local:${APP_PORT}"
}

# --- Check for Existing Port Advert ---
if [ -f "$SERVICE_FILE" ]; then
  echo "⚠️ Detected existing Avahi port advertisement: $SERVICE_FILE"
  if [ "$IN_LXC" = "yes" ]; then
    read -rp "🔁 You're in an LXC. Reconfigure port? (y/n): " RECONFIRM
    if [[ "$RECONFIRM" =~ ^[Yy]$ ]]; then
      configure_port_advertisement
    else
      echo "⏭️ Skipping port reconfiguration."
    fi
  else
    echo "ℹ️ If you want to reconfigure, delete $SERVICE_FILE and rerun this script."
  fi
else
  read -rp "❓ Do you want to advertise a single app port on mDNS? (y/n): " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    configure_port_advertisement
  fi
fi

# --- Done ---
echo ""
echo "✅ mDNS setup complete!"
echo "🔎 Try: ping ${HOSTNAME}.local"