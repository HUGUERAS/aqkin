#!/bin/bash
# =============================================================================
# Deploy Ativo Real - Hostinger VPS
# Execute no servidor: sudo bash deploy-hostinger.sh
# =============================================================================
set -e

echo "=============================================="
echo "  Deploy Ativo Real - Hostinger VPS"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root (use sudo)"
  echo "Usage: sudo bash deploy-hostinger.sh"
  exit 1
fi

# -----------------------------------------------------------------------------
# 1. Variáveis (edite aqui ou serão perguntadas)
# -----------------------------------------------------------------------------
API_DOMAIN="${API_DOMAIN:-api.bemreal.com}"
REPO_URL="${REPO_URL:-https://github.com/HUGUERAS/ativo-real-monorepo.git}"
APP_DIR="/var/www/aqkin"
API_DIR="${APP_DIR}/apps/api"

# -----------------------------------------------------------------------------
# 2. Perguntar dados se não definidos
# -----------------------------------------------------------------------------
if [ -z "$API_DOMAIN" ]; then
  read -p "Subdomínio da API [api.bemreal.com]: " API_DOMAIN
  API_DOMAIN="${API_DOMAIN:-api.bemreal.com}"
  [ -z "$API_DOMAIN" ] && { echo "Erro: subdomínio obrigatório"; exit 1; }
fi

echo ""
echo ">>> Instalando dependências do sistema..."
apt update
apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git curl ufw

# -----------------------------------------------------------------------------
# 2.5. Configurar Firewall (UFW)
# -----------------------------------------------------------------------------
echo ""
echo ">>> Configurando firewall (UFW)..."

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
# Port 8000 is only accessible from localhost (handled by nginx proxy)

echo "Regras de firewall configuradas:"
ufw status numbered
echo ""
echo "✓ SSH (22), HTTP (80), HTTPS (443) estão abertos"
echo "✓ Porta 8000 (API) acessível apenas via nginx (localhost)"

# -----------------------------------------------------------------------------
# 3. Clone ou atualiza o projeto
# -----------------------------------------------------------------------------
echo ""
echo ">>> Configurando projeto..."
mkdir -p /var/www
if [ -d "$APP_DIR" ]; then
  echo "Projeto já existe. Atualizando..."
  cd "$APP_DIR"
  git pull || true
  cd - > /dev/null
else
  echo "Clonando repositório..."
  read -p "URL do repositório Git [Enter=pula, use upload manual]: " GIT_URL
  if [ -n "$GIT_URL" ]; then
    git clone "$GIT_URL" "$APP_DIR" || { echo "Erro ao clonar. Use upload manual."; exit 1; }
    echo "Clone OK"
  else
    echo ""
    echo "=== UPLOAD MANUAL ==="
    echo "No seu PC, execute:"
    echo "  scp -r apps root@SEU_IP:/var/www/aqkin/"
    echo "  scp -r database root@SEU_IP:/var/www/aqkin/"
    echo ""
    echo "Ou use rsync:"
    echo "  rsync -avz --exclude node_modules --exclude .git apps database root@SEU_IP:/var/www/aqkin/"
    echo ""
    mkdir -p "$APP_DIR"
    read -p "Após fazer upload, pressione Enter para continuar..." dummy
  fi
fi

[ ! -d "$API_DIR" ] && { echo "Erro: $API_DIR não existe. Verifique a estrutura do projeto."; exit 1; }

# -----------------------------------------------------------------------------
# 4. Configurar Backend (Python)
# -----------------------------------------------------------------------------
echo ""
echo ">>> Configurando API Python..."
cd "$API_DIR"
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

# .env
if [ ! -f .env ]; then
  echo ""
  echo "Criando .env. Informe os valores:"
  read -p "SUPABASE_URL [https://xntxtdximacsdnldouxa.supabase.co]: " SV
  SV="${SV:-https://xntxtdximacsdnldouxa.supabase.co}"
  read -p "SUPABASE_SERVICE_KEY: " SK
  read -p "JWT_SECRET: " JS
  cat > .env << EOF
SUPABASE_URL=$SV
SUPABASE_SERVICE_KEY=$SK
JWT_SECRET=$JS
EOF
  echo ".env criado."
else
  echo ".env já existe. Verifique se SUPABASE_* e JWT_SECRET estão corretos."
fi
deactivate
cd - > /dev/null

# -----------------------------------------------------------------------------
# 5. Serviço systemd
# -----------------------------------------------------------------------------
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
  echo "API rodando!"
else
  echo "ERRO: API não iniciou. Verifique: systemctl status ativo-real-api"
fi

# -----------------------------------------------------------------------------
# 6. Nginx
# -----------------------------------------------------------------------------
echo ""
echo ">>> Configurando Nginx..."
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
# Remove default se existir
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl restart nginx
echo "Nginx configurado para $API_DOMAIN"

# -----------------------------------------------------------------------------
# 7. SSL (opcional)
# -----------------------------------------------------------------------------
echo ""
read -p "Configurar SSL com Let's Encrypt para $API_DOMAIN? (s/n): " DO_SSL
if [ "$DO_SSL" = "s" ]; then
  certbot --nginx -d "$API_DOMAIN" --non-interactive --agree-tos --redirect -m admin@$API_DOMAIN 2>/dev/null || \
  certbot --nginx -d "$API_DOMAIN"
  echo "SSL configurado!"
fi

# -----------------------------------------------------------------------------
# 8. Teste
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Deploy concluído!"
echo "=============================================="
echo ""
echo "API URL: http://$API_DOMAIN"
[ "$DO_SSL" = "s" ] && echo "API URL (HTTPS): https://$API_DOMAIN"
echo ""
echo "Teste: curl http://$API_DOMAIN/"
echo ""
echo "Próximos passos:"
echo "1. Configure DNS: A $API_DOMAIN -> IP deste servidor"
echo "2. No frontend .env: VITE_API_URL=https://$API_DOMAIN"
echo "3. Build do frontend: cd apps/web && npm run build"
echo "4. Subir dist: scp -r dist/* root@IP:/var/www/html/"
echo ""
