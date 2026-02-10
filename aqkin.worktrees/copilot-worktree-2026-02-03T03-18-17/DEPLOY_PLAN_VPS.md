# 🚀 Deploy Docker à VPS - Plano Executivo

# user: root | host: 76.13.113.9

## PASSO 1: Preparar SSH Key (30 seg)

```powershell
# Testar conexão SSH
ssh -v root@76.13.113.9

# Se funcionar: ✅ Pronto
# Se falhar: Precisa configurar SSH key
```

**Se precisa SSH key:**

```powershell
# Gerar nova chave
ssh-keygen -t ed25519 -f "$HOME\.ssh\id_bemreal" -C "bemreal-deploy"

# Copiar public key para VPS (ele pedirá senha root)
type $HOME\.ssh\id_bemreal.pub | ssh root@76.13.113.9 "cat >> ~/.ssh/authorized_keys"

# Testar conexão
ssh -i "$HOME\.ssh\id_bemreal" root@76.13.113.9 "echo 'SSH OK'"
```

---

## PASSO 2: Verificar Docker na VPS (2 min)

```powershell
# Conectar e verificar Docker
ssh root@76.13.113.9

# Commands na VPS:
docker --version     # Deve retornar Docker version
docker-compose --version  # Deve retornar compose version

# Se não tiver, instalar (vou fornecer script)
```

**Se Docker não estiver instalado, rodar na VPS:**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker root

# Verify
docker --version && docker-compose --version
```

---

## PASSO 3: Preparar Environment na VPS (5 min)

```powershell
ssh root@76.13.113.9 mkdir -p /home/bemreal/ativreal-monorepo
```

**Copiar `.env.production` para VPS:**

```powershell
# Criar arquivo localmente com dados reais
@"
# Frontend
VITE_API_URL=https://api.bemreal.com
VITE_SUPABASE_URL=seu-supabase-url
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_ESRI_API_KEY=sua-esri-key

# Backend - Database
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres

# JWT Security
JWT_SECRET=seu-jwt-secret-aqui-min-32-chars

# S3 / Cloud Storage
S3_BUCKET=seu-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_ENDPOINT_URL=https://s3.amazonaws.com

# Payments
STRIPE_SECRET_KEY=sk_live_xxxxx
PAGSEGURO_TOKEN=xxxxx

# CORS
CORS_ORIGINS=https://bemreal.com,https://www.bemreal.com

# Environment
ENV=production
SQL_ECHO=false
"@ | ssh root@76.13.113.9 "cat > /home/bemreal/ativreal-monorepo/.env.production"

# Verificar
ssh root@76.13.113.9 "cat /home/bemreal/ativreal-monorepo/.env.production"
```

---

## PASSO 4: Build Docker Localmente (10 min)

```powershell
cd C:\Users\User\aqkin\aqkin.worktrees\copilot-worktree-2026-02-03T03-18-17

# Build API
docker build -t ghcr.io/seu-username/ativreal-monorepo-api:main -f apps/api/Dockerfile .

# Build Web
docker build -t ghcr.io/seu-username/ativreal-monorepo-web:main -f apps/web/Dockerfile .

# Verificar
docker images | grep ativreal
```

---

## PASSO 5: Push para GitHub Container Registry (5 min)

**Primeiro: Criar GitHub Token**

1. Abrir: <https://github.com/settings/tokens>
2. Click "Generate new token (classic)"
3. Scope: `write:packages, read:packages, delete:packages`
4. Copy token (exemplo: `ghp_xxxxxxxxxxxxxx`)

**Depois: Login no Docker Registry**

```powershell
$GithubToken = "ghp_xxxxxx"  # Sua token aqui
$GithubUsername = "seu-username"  # Seu username GitHub

echo $GithubToken | docker login ghcr.io -u $GithubUsername --password-stdin

# Verificar
docker info | grep Registry
```

**Push das imagens**

```powershell
docker push ghcr.io/seu-username/ativreal-monorepo-api:main
docker push ghcr.io/seu-username/ativreal-monorepo-web:main

# Confirmar no GitHub: https://github.com/seu-repo/packages
```

---

## PASSO 6: Deploy na VPS (5 min)

```powershell
$VpsHost = "root@76.13.113.9"
$AppPath = "/home/bemreal/ativreal-monorepo"
$ApiImage = "ghcr.io/seu-username/ativreal-monorepo-api:main"
$WebImage = "ghcr.io/seu-username/ativreal-monorepo-web:main"

# Login Docker na VPS (se private images)
ssh $VpsHost "echo 'GIT_TOKEN' | docker login ghcr.io -u seu-username --password-stdin"

# Pull das imagens
ssh $VpsHost "docker pull $ApiImage && docker pull $WebImage"

# Stop old containers
ssh $VpsHost "cd $AppPath && docker-compose -f docker-compose.prod.yml down --timeout=30 || true"

# Start new containers
ssh $VpsHost "cd $AppPath && docker-compose -f docker-compose.prod.yml up -d"

# Ver logs
ssh $VpsHost "cd $AppPath && docker-compose logs -f"
```

---

## PASSO 7: Verificar Deploy (2 min)

```powershell
# Health Check API
ssh root@76.13.113.9 "curl -s http://localhost:8000/health"

# Verificar containers
ssh root@76.13.113.9 "docker-compose -f /home/bemreal/ativreal-monorepo/docker-compose.prod.yml ps"

# Acessar no browser
# https://bemreal.com  ← Deve estar LIVE!
```

---

## ✅ Checklist Antes de Rodar

- [ ] SSH key configurada (`ssh root@76.13.113.9` funciona)
- [ ] Docker na VPS (`docker --version` retorna version)
- [ ] `.env.production` pronta com dados reais
- [ ] GitHub Token criado
- [ ] GitHub username confirmado
- [ ] DNS aponta bemreal.com → 76.13.113.9
- [ ] SSL certificate pronto (Certbot/Let's Encrypt)
- [ ] `docker-compose.prod.yml` pronto no projeto

---

## 🔥 TL;DR - Comando Rápido (Para depois que todo setup acima está feito)

```powershell
# 1. Build
docker build -t ghcr.io/seu-username/ativreal-monorepo-api:main -f apps/api/Dockerfile .
docker build -t ghcr.io/seu-username/ativreal-monorepo-web:main -f apps/web/Dockerfile .

# 2. Push
docker push ghcr.io/seu-username/ativreal-monorepo-api:main
docker push ghcr.io/seu-username/ativreal-monorepo-web:main

# 3. Deploy
ssh root@76.13.113.9 "cd /home/bemreal/ativreal-monorepo && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"

# ✅ Done! Acesse https://bemreal.com
```
