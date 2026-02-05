## 🚀 Deploy Docker à VPS - Checklist

### ✅ Pré-requisitos Verificar

#### 1️⃣ **VPS - Acesso SSH**
```bash
# Testar conexão
ssh -v root@76.13.113.9

# Se funcionar: ✅ OK
# Se não: precisa SSH key configurada
```

**O que preciso:**
- [ ] IP/Host: `76.13.113.9` ✅
- [ ] User: `root` ❓ (ou qual?)
- [ ] SSH Port: `22` (padrão)
- [ ] SSH Key: Tem em `~/.ssh/id_rsa.pub`? ❓

---

#### 2️⃣ **Docker na VPS**
```bash
ssh root@76.13.113.9
docker --version  # Deve estar instalado
docker-compose --version
```

**Se não tiver:**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

#### 3️⃣ **GitHub Container Registry (GHCR) - Auth**
```bash
# Na sua máquina local
cat ~/YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Salvar credenciais (para usar na VPS depois)
cat ~/.docker/config.json
```

**O que preciso:**
- [ ] GitHub Personal Access Token (PAT) ❓
  - Ir a: https://github.com/settings/tokens
  - Criar novo token com `read:packages`
  - Copiar token

---

#### 4️⃣ **Environment Variables na VPS**
```bash
ssh root@76.13.113.9
cd /home/bemreal/ativreal-monorepo

# Verificar se ``.env.production` existe
cat .env.production
```

**Variáveis necessárias (copiar de .env.example):**
```bash
# Frontend
VITE_API_URL=https://api.bemreal.com

# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=seu-secret-aqui
S3_BUCKET=bucketname
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
STRIPE_SECRET_KEY=...
PAGSEGURO_TOKEN=...
CORS_ORIGINS=https://bemreal.com,https://www.bemreal.com
```

---

### 🎯 **Dois Caminhos**

#### **Caminho A: Script Automatizado** (Recomendado)
```bash
# Na sua máquina local (Windows/Mac/Linux)

# 1. Definir variáveis
export VPS_HOST=76.13.113.9
export VPS_USER=root
export GITHUB_TOKEN=ghp_xxxxx

# 2. Rodar deploy script
./scripts/deploy-docker-vps.sh main

# Done! ✅
```

#### **Caminho B: Manual na VPS** (Debugging)
```bash
# SSH na VPS
ssh root@76.13.113.9

# Fazer login no GHCR
echo "ghp_xxxxx" | docker login ghcr.io -u seu-username --password-stdin

# Ir para pasta do projeto
cd /home/bemreal/ativreal-monorepo

# Pull das imagens Docker
docker pull ghcr.io/seu-repo-api:main
docker pull ghcr.io/seu-repo-web:main

# Verificar .env.production
cat .env.production

# Rodar
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f

# Health check
curl http://localhost:8000/health
curl http://localhost:80/
```

---

## 📋 **Checklist Final - Responda com ✅ ou ❌**

- [ ] VPS IP: `76.13.113.9` - Correto?
- [ ] SSH User: `root` - Correto?
- [ ] SSH Login funciona: `ssh root@76.13.113.9`
- [ ] Docker instalado na VPS: `docker --version`
- [ ] Docker Compose instalado: `docker-compose --version`
- [ ] GitHub Token criado: `ghp_xxxxx`
- [ ] `.env.production` pronta na VPS
- [ ] Domain DNS aponta para VPS: `bemreal.com`
- [ ] Nginx SSL certificado pronto (Certbot)

---

## 🚀 **Próximos Passos**

1. **Responda com os dados da VPS** (host, user, etc)
2. **Cu crio um deployment plan customizado** para seu setup específico
3. **Run deploy script** e vai estar live em ~15 minutos

---

**Qual informação falta?**
