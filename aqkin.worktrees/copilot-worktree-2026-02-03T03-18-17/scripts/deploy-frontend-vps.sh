#!/bin/bash
# Rode no VPS depois de subir apps/web/dist para /var/www/html
# Uso: bash deploy-frontend-vps.sh

set -e
echo ">>> Configurando Nginx para bemreal.com (frontend)..."
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
echo "Nginx OK. Configurando SSL..."
certbot --nginx -d bemreal.com -d www.bemreal.com --non-interactive --agree-tos --redirect -m admin@bemreal.com 2>/dev/null || certbot --nginx -d bemreal.com -d www.bemreal.com
echo ">>> Frontend: https://bemreal.com e https://www.bemreal.com"
