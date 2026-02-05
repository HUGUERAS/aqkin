#!/bin/bash

# Bem Real - Production Deployment Setup Script
# Run this on your VPS to prepare for Docker deployment

set -e

echo "🚀 Bem Real - Production Setup"
echo "==============================="

# Environment variables
VPS_USER=${VPS_USER:-bemreal}
DOMAIN=${DOMAIN:-bemreal.com}
PROJECT_DIR="/home/${VPS_USER}/bemreal"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}Step 1: Install Docker & Docker Compose${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

echo -e "${YELLOW}Step 2: Setup project directory${NC}"
mkdir -p ${PROJECT_DIR}
cd ${PROJECT_DIR}

echo -e "${YELLOW}Step 3: Install Nginx & Certbot for SSL${NC}"
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

echo -e "${YELLOW}Step 4: Setup Nginx reverse proxy${NC}"
cat > /etc/nginx/sites-available/bemreal << 'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/bemreal
ln -sf /etc/nginx/sites-available/bemreal /etc/nginx/sites-enabled/bemreal
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Enable Nginx
systemctl enable nginx
systemctl restart nginx

echo -e "${YELLOW}Step 5: Setup SSL certificate (Certbot)${NC}"
certbot certonly --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m noreply@${DOMAIN}

echo -e "${YELLOW}Step 6: Create application user${NC}"
if ! id ${VPS_USER} &>/dev/null; then
    useradd -m -s /bin/bash ${VPS_USER}
    echo -e "${GREEN}✅ User ${VPS_USER} created${NC}"
else
    echo -e "${GREEN}✅ User ${VPS_USER} already exists${NC}"
fi

# Add user to docker group
usermod -aG docker ${VPS_USER}

echo -e "${YELLOW}Step 7: Login to Docker Registry${NC}"
echo -e "${YELLOW}Enter GitHub username: ${NC}"
read GITHUB_USER
echo -e "${YELLOW}Enter GitHub Personal Access Token (with 'read:packages'): ${NC}"
read -s GITHUB_TOKEN

echo "${GITHUB_TOKEN}" | docker login ghcr.io -u ${GITHUB_USER} --password-stdin
su - ${VPS_USER} -c "echo '${GITHUB_TOKEN}' | docker login ghcr.io -u ${GITHUB_USER} --password-stdin"

echo -e "${YELLOW}Step 8: Clone repository${NC}"
cd ${PROJECT_DIR}
su - ${VPS_USER} -c "git clone https://github.com/YOUR_GITHUB_ORG/bem-real.git ."

echo -e "${YELLOW}Step 9: Setup environment files${NC}"
echo -e "${YELLOW}📝 Create .env.production in ${PROJECT_DIR}${NC}"
echo "Example .env.production:"
cat > ${PROJECT_DIR}/.env.production.example << 'EOF'
# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/bemreal

# JWT
JWT_SECRET=your-very-secure-random-key-here

# Geospatial
AREA_MIN_M2=100
GAP_TOLERANCE_M2=1.0
SIGEF_OVERLAP_TOLERANCE_M2=0

# S3 (Backblaze B2 or AWS)
S3_BUCKET=bemreal-docs
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_ENDPOINT_URL=https://s3.us-east-1.amazonaws.com

# CORS
CORS_ORIGINS=https://bemreal.com,https://www.bemreal.com

# Payments
STRIPE_SECRET_KEY=sk_live_...
PAGSEGURO_TOKEN=...

# Frontend
VITE_API_URL=https://bemreal.com/api
EOF

chown ${VPS_USER}:${VPS_USER} ${PROJECT_DIR}/.env.production.example
echo -e "${YELLOW}⚠️  Please edit .env.production with your actual values${NC}"

echo -e "${YELLOW}Step 10: Setup systemd service${NC}"
cat > /etc/systemd/system/bemreal.service << 'EOF'
[Unit]
Description=Bem Real Application
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=bemreal
WorkingDirectory=/home/bemreal/bemreal
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable bemreal
echo -e "${GREEN}✅ Systemd service configured${NC}"

echo -e "${YELLOW}Step 11: Setup log rotation${NC}"
cat > /etc/logrotate.d/bemreal << 'EOF'
/home/bemreal/bemreal/logs /* {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 bemreal bemreal
    sharedscripts
}
EOF

echo -e "${GREEN}✅ Log rotation configured${NC}"

echo -e "${YELLOW}Step 12: Setup monitoring & alerts${NC}"
echo -e "${YELLOW}📝 Consider enabling:${NC}"
echo "  - Docker event logging"
echo "  - Health check monitoring"
echo "  - Slack/Email alerts"
echo "  - Prometheus + Grafana (optional)"

echo -e "${GREEN}✅ Bem Real production setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Edit .env.production with your actual values"
echo "2. Push your code to main branch"
echo "3. GitHub Actions will automatically build and deploy"
echo "4. Monitor at: https://${DOMAIN}"
echo ""
echo -e "${YELLOW}🔐 Security checklist:${NC}"
echo "☐ Disable root login (PermitRootLogin no)"
echo "☐ Setup SSH key authentication only"
echo "☐ Enable firewall (ufw)"
echo "☐ Enable fail2ban for brute force protection"
echo "☐ Regular security updates (unattended-upgrades)"
echo ""
echo -e "${YELLOW}📊 Useful commands:${NC}"
echo "systemctl status bemreal          # Check service status"
echo "docker-compose logs -f            # View logs"
echo "docker-compose ps                 # List containers"
echo "certbot renew --dry-run           # Test SSL renewal"
