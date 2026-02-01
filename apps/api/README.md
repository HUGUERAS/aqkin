# Ativo Real API - Python Backend

FastAPI backend conectado ao Supabase PostgreSQL com PostGIS.

## 🚀 Deploy (Cloud-First)

### Opção 1: Railway (Recomendado)
```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd apps/api
railway up
```

### Opção 2: Render
1. Conectar GitHub repo
2. New Web Service → Python
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Opção 3: Hostinger VPS
```bash
# SSH no servidor
ssh root@your-vps-ip

# Instalar Python e dependências
apt update && apt install python3 python3-pip nginx -y

# Clone repo
git clone https://github.com/HUGUERAS/ativo-real-monorepo.git
cd ativo-real-monorepo/apps/api

# Instalar deps
pip3 install -r requirements.txt

# Configurar .env
nano .env
# Adicionar SUPABASE_URL e SUPABASE_SERVICE_KEY

# Rodar com systemd
sudo nano /etc/systemd/system/ativo-real-api.service
```

Arquivo systemd:
```ini
[Unit]
Description=Ativo Real API
After=network.target

[Service]
User=root
WorkingDirectory=/root/ativo-real-monorepo/apps/api
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable ativo-real-api
sudo systemctl start ativo-real-api
```

## 📡 Endpoints

- `GET /` - Health check
- `POST /api/projetos` - Criar projeto
- `GET /api/projetos` - Listar projetos
- `GET /api/projetos/{id}` - Obter projeto
- `POST /api/lotes` - Criar lote
- `GET /api/lotes` - Listar lotes
- `GET /api/lotes/{id}` - Obter lote
- `GET /api/lotes/token/{token}` - Acesso via magic link
- `PATCH /api/lotes/{id}/geometria` - Atualizar geometria

## 🔐 Environment Variables

```env
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=your-secret
```

## 🧪 Teste Local (Apenas Desenvolvimento)

```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload
```

**⚠️ IMPORTANTE**: Desenvolvimento local trava muito. Use deploy direto em cloud.
