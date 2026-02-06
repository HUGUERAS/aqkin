# 🚀 Deploy na Hostinger VPS (Ativo Real)

Guia passo a passo para subir **backend** e **frontend** na Hostinger.

---

## ⚡ Deploy automático (script)

```bash
# 1. Conectar no VPS
ssh root@SEU_IP_HOSTINGER

# 2. Baixar e executar o script
curl -sSL https://raw.githubusercontent.com/SEU_USUARIO/aqkin/main/scripts/deploy-hostinger.sh -o deploy.sh
chmod +x deploy.sh
bash deploy.sh
```

**Ou** copie o conteúdo de `scripts/deploy-hostinger.sh` para o servidor e execute `bash deploy-hostinger.sh`.

O script vai:

- Instalar Python, Nginx, Certbot
- Clonar o projeto (ou pedir upload manual)
- Configurar API + systemd + Nginx
- Opcionalmente configurar SSL

---

## Pré-requisitos

- **VPS Hostinger** com acesso SSH
- **Domínio** apontando para o IP da VPS (ex: `ativoreal.com.br`)
- **Subdomínio** para API (ex: `api.ativoreal.com.br`)

---

## 1️⃣ Conectar no VPS

```bash
ssh root@SEU_IP_HOSTINGER
```

(IP está no painel Hostinger → VPS → Detalhes)

---

## 2️⃣ Instalar dependências no servidor

```bash
apt update && apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git
```

---

## 3️⃣ Deploy do Backend (FastAPI)

```bash
# Criar pasta
mkdir -p /var/www
cd /var/www

# Clone do repositório (troque pela URL do seu repo)
git clone https://github.com/SEU_USUARIO/aqkin.git
cd aqkin/apps/api

# Ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Dependências
pip install -r requirements.txt

# Criar .env
nano .env
```

**Conteúdo do `.env`:**

```env
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key
JWT_SECRET=seu-jwt-secret-do-supabase
```

Salvar: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 4️⃣ Criar serviço systemd (API sempre rodando)

```bash
nano /etc/systemd/system/ativo-real-api.service
```

**Conteúdo:**

```ini
[Unit]
Description=Ativo Real API
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/aqkin/apps/api
Environment="PATH=/var/www/aqkin/apps/api/venv/bin"
ExecStart=/var/www/aqkin/apps/api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**Ativar:**

```bash
systemctl daemon-reload
systemctl enable ativo-real-api
systemctl start ativo-real-api
systemctl status ativo-real-api
```

---

## 5️⃣ Configurar Nginx (reverso proxy)

```bash
nano /etc/nginx/sites-available/ativo-real
```

**Conteúdo** (troque `api.seudominio.com.br` pelo seu subdomínio):

```nginx
server {
    listen 80;
    server_name api.seudominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Ativar site e reiniciar Nginx:**

```bash
ln -sf /etc/nginx/sites-available/ativo-real /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 6️⃣ SSL grátis (HTTPS)

```bash
certbot --nginx -d api.seudominio.com.br
```

Siga as perguntas (email, aceitar termos). O Certbot configura o HTTPS automaticamente.

---

## 7️⃣ Deploy do Frontend (React)

**No seu PC (não no servidor):**

```bash
cd apps/web
npm run build
```

Depois, subir a pasta `dist` para o servidor:

```bash
scp -r dist/* root@SEU_IP:/var/www/html/
```

Ou configurar Nginx para servir o frontend:

```bash
# No servidor
nano /etc/nginx/sites-available/ativo-real
```

**Adicionar segundo `server` para o frontend:**

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name api.seudominio.com.br;
    # ... (config anterior da API)
}
```

---

## 8️⃣ Configurar DNS na Hostinger (bemreal.com)

No painel Hostinger → Domínios → **bemreal.com** → DNS:

| Tipo | Nome | Valor |
|------|------|-------|
| A | api | 76.13.113.9 |
| A | @ | 76.13.113.9 |
| A | www | 76.13.113.9 |

**URLs finais:**

- **API:** <https://api.bemreal.com>
- **Frontend:** <https://bemreal.com> ou <https://www.bemreal.com>

---

## 9️⃣ Variáveis do frontend (.env na build)

Antes do `npm run build`, crie `apps/web/.env`:

```env
VITE_API_URL=https://api.seudominio.com.br
VITE_SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_ESRI_API_KEY=sua-esri-key
```

Depois rode `npm run build` — o Vite injeta essas variáveis no build.

---

## ✅ Resultado

| Serviço | URL |
|---------|-----|
| **API** | `https://api.seudominio.com.br` |
| **Frontend** | `https://seudominio.com.br` |
| **Supabase** | (já configurado) |

---

## 🧪 Testar

```bash
# API
curl https://api.seudominio.com.br/

# Deve retornar algo como: {"status":"online",...}
```

---

## 🔄 Atualizar depois

```bash
cd /var/www/aqkin
git pull
cd apps/api
source venv/bin/activate
pip install -r requirements.txt  # se requirements mudou
systemctl restart ativo-real-api
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| API não responde | `systemctl status ativo-real-api` e ver logs |
| 502 Bad Gateway | Verificar se uvicorn está rodando na porta 8000 |
| CORS | Backend já tem `allow_origins=["*"]` |
| Frontend não chama API | Conferir `VITE_API_URL` no build |
