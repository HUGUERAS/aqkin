#!/bin/bash
# Deploy completo bemreal.com - API + Frontend
# Uso: bash /root/deploy-completo.sh
# OU com variáveis de ambiente (não-interativo):
#   SUPABASE_SERVICE_KEY=xxx JWT_SECRET=yyy bash /root/deploy-completo.sh
# OU carregar de arquivo:
#   source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh

set -e

# Carregar variáveis de arquivo se existir
if [ -f /root/ENV_VARS_VPS.sh ]; then
    echo ">>> Carregando variáveis de /root/ENV_VARS_VPS.sh..."
    source /root/ENV_VARS_VPS.sh
fi

echo "=============================================="
echo "  DEPLOY COMPLETO - bemreal.com"
echo "=============================================="

# -----------------------------------------------------------------------------
# 0. Configurar Firewall (UFW)
# -----------------------------------------------------------------------------
echo ""
echo ">>> Verificando e configurando firewall (UFW)..."

# Install UFW if not present
if ! command -v ufw &> /dev/null; then
    echo "Instalando UFW..."
    apt update && apt install -y ufw
fi

# Check if UFW is already enabled
if ufw status | grep -q "Status: active"; then
  echo "UFW já está ativo. Verificando regras..."
else
  echo "Configurando UFW pela primeira vez..."
  # Allow SSH first to prevent lockout
  ufw allow 22/tcp comment 'SSH'
  # Enable UFW with default deny incoming
  ufw --force enable
  echo "UFW ativado com sucesso"
fi

# Configure firewall rules
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

echo "Regras de firewall configuradas:"
ufw status numbered
echo "✓ Firewall configurado: SSH (22), HTTP (80), HTTPS (443)"
echo ""

API_DOMAIN="api.bemreal.com"
APP_DIR="/var/www/aqkin"
API_DIR="${APP_DIR}/apps/api"

# 1. Extrair backend
echo ""
echo ">>> Extraindo backend..."
mkdir -p "$APP_DIR"
cd /var/www
tar -xzf aqkin.tar.gz -C aqkin
echo "OK: Backend extraído"

# 2. Deploy da API
echo ""
echo ">>> Deploy da API..."
cd "$API_DIR"
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

# .env (se não existir ou se variáveis foram passadas)
if [ ! -f .env ] || [ -n "$SUPABASE_SERVICE_KEY" ]; then
    SUPABASE_URL="${SUPABASE_URL:-https://xntxtdximacsdnldouxa.supabase.co}"
    if [ -z "$SUPABASE_SERVICE_KEY" ]; then
        read -p "SUPABASE_SERVICE_KEY: " SUPABASE_SERVICE_KEY
    fi
    if [ -z "$JWT_SECRET" ]; then
        read -p "JWT_SECRET: " JWT_SECRET
    fi
    cat > .env << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
JWT_SECRET=$JWT_SECRET
EOF
    echo "OK: .env criado"
fi
deactivate

# Systemd
echo ""
echo ">>> Configurando serviço systemd..."
cat > /etc/systemd/system/ativo-real-api.service << EOF
[Unit]
Description=Ativo Real API
After=network.target

[Service]
User=root
WorkingDirectory=$API_DIR
Environment="PATH=$API_DIR/venv/bin"
ExecStart=$API_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ativo-real-api
systemctl restart ativo-real-api
sleep 2
if systemctl is-active --quiet ativo-real-api; then
    echo "OK: API rodando"
else
    echo "ERRO: API não iniciou. Verifique: systemctl status ativo-real-api"
    exit 1
fi

# Nginx API
echo ""
echo ">>> Configurando Nginx (API)..."
cat > /etc/nginx/sites-available/ativo-real << EOF
server {
    listen 80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/ativo-real /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl restart nginx
echo "OK: Nginx configurado"

# SSL API (auto se variáveis foram passadas)
echo ""
if [ -n "$SUPABASE_SERVICE_KEY" ] && [ -n "$JWT_SECRET" ]; then
    DO_SSL_API="s"
    echo ">>> Configurando SSL para $API_DOMAIN (modo automático)..."
else
    read -p "Configurar SSL para $API_DOMAIN? (s/n): " DO_SSL_API
fi
if [ "$DO_SSL_API" = "s" ]; then
    certbot --nginx -d "$API_DOMAIN" --non-interactive --agree-tos --redirect -m admin@bemreal.com 2>/dev/null || \
    certbot --nginx -d "$API_DOMAIN"
    echo "OK: SSL configurado para API"
fi

# Frontend Nginx
echo ""
echo ">>> Configurando Nginx (Frontend)..."
cat > /etc/nginx/sites-available/bemreal-frontend << 'NGINX'
server {
    listen 80;
    server_name bemreal.com www.bemreal.com;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/bemreal-frontend /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "OK: Nginx frontend configurado"

# SSL Frontend (auto se variáveis foram passadas)
echo ""
if [ -n "$SUPABASE_SERVICE_KEY" ] && [ -n "$JWT_SECRET" ]; then
    DO_SSL_FRONT="s"
    echo ">>> Configurando SSL para bemreal.com e www.bemreal.com (modo automático)..."
else
    read -p "Configurar SSL para bemreal.com e www.bemreal.com? (s/n): " DO_SSL_FRONT
fi
if [ "$DO_SSL_FRONT" = "s" ]; then
    certbot --nginx -d bemreal.com -d www.bemreal.com --non-interactive --agree-tos --redirect -m admin@bemreal.com 2>/dev/null || \
    certbot --nginx -d bemreal.com -d www.bemreal.com
    echo "OK: SSL configurado para frontend"
fi

echo ""
echo "=============================================="
echo "  DEPLOY CONCLUIDO!"
echo "=============================================="
echo ""
echo "API: https://$API_DOMAIN"
echo "Site: https://bemreal.com"
echo ""
echo "Teste: curl https://$API_DOMAIN/"
echo ""
