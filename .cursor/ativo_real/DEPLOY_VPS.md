# Deploy na VPS (Hostinger) com Docker + Nginx

## 1) DNS
- Crie um registro A para `api.seudominio.com` apontando para o IP da VPS.
- Se for usar Vercel, configure `app.seudominio.com` no painel da Vercel.

## 2) Preparar a VPS
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker
```

## 3) Subir o backend
```bash
git clone <SEU_REPO> ativo_real
cd ativo_real/ativo_real
```

Edite `backend/.env.production.local`:
- `DJANGO_SECRET_KEY`
- `DJANGO_ALLOWED_HOSTS=api.seudominio.com`
- `CORS_ALLOWED_ORIGINS=https://app.seudominio.com`
- `CSRF_TRUSTED_ORIGINS=https://app.seudominio.com`
- `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (Supabase)
```

Atualize o `server_name` em `nginx/ativo_real.conf` para `api.seudominio.com`.

Suba os containers:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Rode migracoes e crie o superusuario:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## 4) HTTPS (Certbot)
Se preferir HTTPS agora, pare o Nginx, rode o Certbot em standalone e suba de novo:
```bash
docker compose -f docker-compose.prod.yml stop nginx
sudo snap install certbot --classic
sudo certbot certonly --standalone -d api.seudominio.com
docker compose -f docker-compose.prod.yml start nginx
```

Para usar os certificados dentro do container Nginx, monte `/etc/letsencrypt` como volume e ajuste o `nginx/ativo_real.conf` com `listen 443 ssl;` e `ssl_certificate`.

## 5) Frontend (Vercel)
Edite `frontend/config.js` e troque para o seu dominio:
```js
window.APP_API_BASE = 'https://api.seudominio.com/api';
window.APP_TOKEN_STORAGE = 'local';
```

Depois, faça o deploy no Vercel.
