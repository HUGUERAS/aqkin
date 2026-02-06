# ⚡ Bem Real - Deploy Now (5-Step Checklist)

**Ready** ✅ | **Time**: 30 minutes | **Difficulty**: Easy

---

## 📋 YOUR 5-STEP PATH TO PRODUCTION

### ✅ Step 1: Prepare VPS (5 min)

```bash
# 1. Get VPS IP from your provider
VPS_IP = 123.456.789.0

# 2. Point your domain
Domain Registrar → Add A Record:
  bemreal.com → 123.456.789.0
  www.bemreal.com → 123.456.789.0

# 3. SSH and run setup
ssh root@$VPS_IP
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/bem-real/main/scripts/setup-vps.sh | sudo bash
```

### ✅ Step 2: Setup GitHub Secrets (3 min)

GitHub → Settings → Secrets and variables → Actions

Add these secrets:

```
PROD_HOST = your-vps-ip
PROD_USER = root
PROD_SSH_KEY = <paste your private SSH key>
PROD_PORT = 22

JWT_SECRET = <run: python3 -c "import secrets; print(secrets.token_urlsafe(32))">
```

### ✅ Step 3: Configure Database (2 min)

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get connection string from Settings → Database
# 3. Add to GitHub Secrets:

DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.supabase.co:5432/postgres
```

### ✅ Step 4: Configure Environment (1 min)

On VPS at `/home/bemreal/bemreal/.env.production`:

```bash
DATABASE_URL = postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres
JWT_SECRET = <same as GitHub Secret>
S3_BUCKET = bemreal-docs
S3_REGION = us-east-1
CORS_ORIGINS = https://bemreal.com,https://www.bemreal.com
VITE_API_URL = https://bemreal.com/api
```

### ✅ Step 5: Deploy (2 min)

```bash
# Push to main - automatic deploy
git add .
git commit -m "Ready for production"
git push origin main

# Monitor at: GitHub → Actions
# Check live at: https://bemreal.com (after ~10 minutes)
```

---

## ✨ That's It

Your app is now:

- ✅ Containerized (Docker)
- ✅ Tested (GitHub Actions)
- ✅ Deployed (VPS)
- ✅ Secured (SSL/HTTPS)
- ✅ Backed up (Supabase)

---

## 🔗 Detailed Guides

- **Full guide**: [DEPLOY_FIRST_TIME.md](./DEPLOY_FIRST_TIME.md)
- **Troubleshooting**: [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md)
- **Status overview**: [DEPLOY_STATUS.md](./DEPLOY_STATUS.md)

---

## 🚨 If Something Goes Wrong

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Check containers
docker-compose -f docker-compose.prod.yml ps

# View error logs
docker-compose -f docker-compose.prod.yml logs -f api

# Restart
docker-compose -f docker-compose.prod.yml restart api

# Database issue?
docker-compose exec api psql -c "SELECT version();"
```

---

## 📊 Expected Times

| Step | Time |
|------|------|
| VPS Setup | 5 min |
| GitHub Secrets | 3 min |
| Database | 2 min |
| Environment | 1 min |
| Deploy | 2 min |
| Deployment Pipeline | 10-15 min |
| DNS Propagation | 5-30 min |
| **TOTAL** | **~30 min** |

---

## 🎯 After Deployment

1. ✅ Visit <https://bemreal.com>
2. ✅ Try `/health` endpoint
3. ✅ Test login flow
4. ✅ Celebrate! 🎉

---

**Next**: Follow [DEPLOY_FIRST_TIME.md](./DEPLOY_FIRST_TIME.md) for detailed steps
