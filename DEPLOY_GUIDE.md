# 🚀 Guia de Deploy - Ativo Real Monorepo

## ✅ Stack Cloud-First (SEM LOCALHOST!)

- **Frontend**: Vercel / Netlify
- **Backend**: Railway / Render / Hostinger VPS
- **Database**: Supabase PostgreSQL + PostGIS
- **Storage**: Supabase Storage (documentos, fotos)

---

## 📦 1. Deploy do Backend (API Python)

### Opção A: Railway (Mais Fácil) ⭐
```bash
# 1. Instalar CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd apps/api
railway init
railway up

# 4. Adicionar variáveis de ambiente no Dashboard
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=ativo-real-secret-2024
```

### Opção B: Render
1. Ir em https://render.com
2. New → Web Service
3. Conectar repo GitHub
4. Configurações:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables: copiar as mesmas do Railway

### Opção C: Hostinger VPS (Você já pagou!)
```bash
# SSH no servidor
ssh root@seu-ip-hostinger

# Instalar dependências
apt update && apt install python3 python3-pip nginx certbot -y

# Clone do projeto
cd /var/www
git clone https://github.com/HUGUERAS/ativo-real-monorepo.git
cd ativo-real-monorepo/apps/api

# Instalar deps Python
pip3 install -r requirements.txt

# Criar .env
nano .env
# Colar:
# SUPABASE_URL=...
# SUPABASE_SERVICE_KEY=...
# JWT_SECRET=...

# Criar serviço systemd
nano /etc/systemd/system/ativo-real-api.service
```

Conteúdo do systemd:
```ini
[Unit]
Description=Ativo Real API
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/ativo-real-monorepo/apps/api
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar serviço
systemctl enable ativo-real-api
systemctl start ativo-real-api
systemctl status ativo-real-api

# Configurar Nginx reverso
nano /etc/nginx/sites-available/ativo-real-api
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.seu-dominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/ativo-real-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL Grátis com Let's Encrypt
certbot --nginx -d api.seu-dominio.com.br
```

**URL da API**: `https://api.seu-dominio.com.br`

---

## 🌐 2. Deploy do Frontend (React)

### Opção A: Vercel ⭐
```bash
# 1. Instalar CLI
npm i -g vercel

# 2. Deploy
cd apps/web
vercel

# 3. Configurar variáveis de ambiente no Dashboard
VITE_SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_API_URL=https://seu-backend-url.railway.app
```

### Opção B: Netlify
1. Ir em https://app.netlify.com
2. New Site → Import from Git
3. Build settings:
   - **Base directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/web/dist`
4. Environment variables: mesmas do Vercel

---

## 🗄️ 3. Configurar Supabase

### Já está feito! ✅
- **URL**: https://xntxtdximacsdnldouxa.supabase.co
- **Schema**: Criado via SQL Editor
- **PostGIS**: Ativado

### Se precisar recriar tabelas:
1. Ir em Supabase Dashboard → SQL Editor
2. Copiar conteúdo de `database/init/01_schema.sql`
3. Executar

---

## 🔗 4. Conectar Frontend → Backend

Após deploy, atualizar `.env` do frontend:

```env
# Frontend (.env ou Vercel/Netlify dashboard)
VITE_API_URL=https://ativo-real-api.railway.app  # ⚠️ TROCAR pela URL real do backend!
VITE_SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🧪 5. Testar a Stack

### Backend:
```bash
curl https://seu-backend.railway.app/
# Resposta esperada: {"status": "online", "service": "Ativo Real API"}

curl https://seu-backend.railway.app/api/projetos
# Resposta: []
```

### Frontend:
Acessar: `https://seu-frontend.vercel.app`

---

## 📝 6. Checklist Final

- [ ] Backend deployado (Railway/Render/Hostinger)
- [ ] Frontend deployado (Vercel/Netlify)
- [ ] Supabase PostgreSQL rodando
- [ ] PostGIS ativado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS liberado no backend
- [ ] Teste de criação de projeto funcionando
- [ ] Teste de desenho no mapa funcionando
- [ ] Detecção de sobreposição PostGIS funcionando

---

## ⚠️ IMPORTANTE: Cloud-First Development

**NUNCA use localhost!** Desenvolvimento local trava muito e os mocks causam problemas.

Se precisar testar algo:
1. Fazer mudança no código
2. `git commit && git push`
3. Deploy automático roda
4. Testar na URL de produção

**Ciclo de desenvolvimento**:
```bash
# 1. Fazer mudança
code .

# 2. Commit
git add .
git commit -m "feature: adiciona X"
git push

# 3. Testar em produção (Railway/Vercel auto-deploy)
curl https://seu-backend.railway.app/api/test
```

---

## 🆘 Troubleshooting

### Backend não conecta ao Supabase
- Verificar variável `SUPABASE_SERVICE_KEY` no Railway/Render
- Testar: `curl https://xntxtdximacsdnldouxa.supabase.co/rest/v1/projetos -H "apikey: SUA_KEY"`

### Frontend não chama backend
- Verificar CORS no `main.py` (deve estar `allow_origins=["*"]`)
- Verificar `VITE_API_URL` no Vercel/Netlify

### PostGIS não funciona
- No Supabase SQL Editor: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Verificar SRID 4674: `SELECT ST_SRID(geom) FROM lotes LIMIT 1;`

---

**🎉 Pronto! Stack totalmente em cloud, sem localhost!**
