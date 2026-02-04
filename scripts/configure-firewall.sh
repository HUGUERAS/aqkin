#!/bin/bash
# =============================================================================
# Configure Firewall for Ativo Real VPS
# Usage: sudo bash configure-firewall.sh
# =============================================================================

set -e

echo "=============================================="
echo "  Firewall Configuration - Ativo Real"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root (use sudo)"
  exit 1
fi

# -----------------------------------------------------------------------------
# 1. Install UFW if not present
# -----------------------------------------------------------------------------
echo ">>> Checking UFW installation..."
if ! command -v ufw &> /dev/null; then
    echo "UFW not found. Installing..."
    apt update
    apt install -y ufw
    echo "✓ UFW installed successfully"
else
    echo "✓ UFW is already installed"
fi

# -----------------------------------------------------------------------------
# 2. Configure UFW Rules
# -----------------------------------------------------------------------------
echo ""
echo ">>> Configuring firewall rules..."

# Check if UFW is already enabled
UFW_ACTIVE=false
if ufw status | grep -q "Status: active"; then
  UFW_ACTIVE=true
  echo "UFW is already active"
else
  echo "UFW is not active yet"
fi

# Set default policies
echo "Setting default policies (deny incoming, allow outgoing)..."
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (port 22) - CRITICAL: This must be allowed first to prevent lockout
echo "Allowing SSH (port 22)..."
ufw allow 22/tcp comment 'SSH - Remote Access'

# Allow HTTP (port 80)
echo "Allowing HTTP (port 80)..."
ufw allow 80/tcp comment 'HTTP - Web Traffic'

# Allow HTTPS (port 443)
echo "Allowing HTTPS (port 443)..."
ufw allow 443/tcp comment 'HTTPS - Secure Web Traffic'

# Note: Port 8000 (API) should only be accessible from localhost
# Nginx acts as a reverse proxy, so no external access needed
echo ""
echo "Note: Port 8000 (API) is only accessible via localhost"
echo "      Nginx reverse proxy handles external requests"

# -----------------------------------------------------------------------------
# 3. Enable UFW
# -----------------------------------------------------------------------------
echo ""
if [ "$UFW_ACTIVE" = false ]; then
  echo ">>> Enabling UFW..."
  # Use --force to avoid interactive prompt
  ufw --force enable
  echo "✓ UFW enabled successfully"
else
  echo ">>> Reloading UFW rules..."
  ufw reload
  echo "✓ UFW rules reloaded"
fi

# -----------------------------------------------------------------------------
# 4. Display Current Status
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Current Firewall Status"
echo "=============================================="
ufw status verbose
echo ""

# -----------------------------------------------------------------------------
# 5. Display Summary
# -----------------------------------------------------------------------------
echo "=============================================="
echo "  Configuration Summary"
echo "=============================================="
echo ""
echo "✓ SSH (22/tcp)    - ALLOWED - Remote access"
echo "✓ HTTP (80/tcp)   - ALLOWED - Web traffic"
echo "✓ HTTPS (443/tcp) - ALLOWED - Secure web traffic"
echo "✓ API (8000)      - LOCALHOST ONLY - via Nginx proxy"
echo ""
echo "Default policies:"
echo "  Incoming: DENY (secure by default)"
echo "  Outgoing: ALLOW (server can make external requests)"
echo ""
echo "=============================================="
echo "  Firewall Configuration Complete!"
echo "=============================================="
echo ""
echo "To view firewall status: sudo ufw status"
echo "To view detailed rules:  sudo ufw status numbered"
echo "To disable firewall:     sudo ufw disable"
echo ""
