#!/bin/bash

# =============================================================================
# Avahi mDNS Setup Script for Debian/Ubuntu (with optional App Port Proxying)
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
NGINX_CONF="/etc/nginx/sites-available/mdns_proxy"
NGINX_LINK="/etc/nginx/sites-enabled/mdns_proxy"
HOSTNAME="$(hostname)"
IN_LXC=$(grep -qa container=lxc /proc/1/environ && echo "yes" || echo "no")

# --- Check Avahi Status ---
AVAHI_INSTALLED=$(dpkg -l | grep -qw avahi-daemon && echo "yes" || echo "no")
MDNS_INSTALLED=$(dpkg -l | grep -qw libnss-mdns && echo "yes" || echo "no")

if [[ "$AVAHI_INSTALLED" == "no" || "$MDNS_INSTALLED" == "no" ]]; then
  echo "📦 Updating package list..."
  apt update -y

  echo "📥 Installing avahi-daemon and libnss-mdns..."
  apt install -y avahi-daemon libnss-mdns
else
  echo "✅ Avahi and libnss-mdns already installed. Skipping installation."
fi

# --- Ensure Avahi Running ---
systemctl enable avahi-daemon
systemctl restart avahi-daemon

# --- Function: Configure Port Advertisement + Reverse Proxy ---
configure_port_advertisement() {
  echo "🌐 This will advertise your app and configure a reverse proxy on port 80."

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

  # Install nginx if not present
  if ! command -v nginx &> /dev/null; then
    echo "📥 Installing nginx..."
    apt install -y nginx
  fi

  # Create nginx reverse proxy
  cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name ${HOSTNAME}.local;

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

  # Enable and reload nginx config
  ln -sf "$NGINX_CONF" "$NGINX_LINK"
  nginx -t && systemctl restart nginx

  echo "🌍 Now accessible via: http://${HOSTNAME}.local (proxy to :${APP_PORT})"
}

# --- Check for Existing Port Advert Setup ---
if [ -f "$SERVICE_FILE" ]; then
  echo "⚠️ Avahi service file already exists: $SERVICE_FILE"
  if [ "$IN_LXC" = "yes" ]; then
    read -rp "🔁 Reconfigure the advertised port and nginx proxy? (y/n): " RECONFIRM
    if [[ "$RECONFIRM" =~ ^[Yy]$ ]]; then
      configure_port_advertisement
    else
      echo "⏭️ Skipping reconfiguration."
    fi
  else
    echo "ℹ️ Port advertisement is already set. Delete $SERVICE_FILE to reconfigure manually."
  fi
else
  read -rp "❓ Do you want to advertise a single app port and proxy to it via mDNS? (y/n): " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    configure_port_advertisement
  fi
fi

# --- Final Status ---
echo ""
echo "✅ mDNS setup complete!"
echo "🔎 Try: ping ${HOSTNAME}.local or visit http://${HOSTNAME}.local in your browser."