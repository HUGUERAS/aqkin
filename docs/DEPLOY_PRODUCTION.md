# Bem Real - Production Deployment Guide

**Status**: Production-ready with Docker + Supabase + VPS

---

## 📋 Checklist Overview

- [x] **Docker Setup** - Backend + Frontend containerized
- [x] **CI/CD Pipeline** - GitHub Actions automated testing & deployment
- [x] **Database** - Supabase PostgreSQL + PostGIS
- [x] **VPS Configuration** - Automated setup script
- [x] **SSL/HTTPS** - Certbot with Nginx
- [x] **Monitoring** - Health checks + logging

---

## 🚀 Quick Start (5 steps)

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "feat: production deployment setup"
git push origin main
```

**GitHub Actions starts automatically:**

- Builds Docker images
- Runs tests
- Pushes to registry
- Deploys to VPS (if you've configured secrets)

### Step 2: Setup VPS (first time only)

```bash
# On your VPS as root
ssh root@your-vps-ip

curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/bem-real/main/scripts/setup-vps.sh | bash

# Or download and run manually
wget https://raw.githubusercontent.com/YOUR_ORG/bem-real/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### Step 3: Configure GitHub Secrets

In GitHub repo → Settings → Secrets and variables → Actions:

```
# VPS Connection
PROD_HOST=your-vps-ip
PROD_USER=bemreal
PROD_SSH_KEY=<your-private-ssh-key>
PROD_PORT=22

STAGING_HOST=staging-ip
STAGING_USER=bemreal
STAGING_SSH_KEY=<private-key>
STAGING_PORT=22

# GitHub Container Registry (auto from GitHub)
GITHUB_TOKEN=<auto>

# Application Secrets
JWT_SECRET=<generate-random-key>
STRIPE_SECRET_KEY=sk_live_...
PAGSEGURO_TOKEN=...
```

### Step 4: Create Environment Files

On VPS at `/home/bemreal/bemreal/.env.production`:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/bemreal

# JWT
JWT_SECRET=<same-as-github-secret>

# S3 (Backblaze B2 or AWS)
S3_BUCKET=bemreal-docs
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# CORS
CORS_ORIGINS=https://bemreal.com,https://www.bemreal.com

# Payments
STRIPE_SECRET_KEY=sk_live_...
PAGSEGURO_TOKEN=...

# Frontend
VITE_API_URL=https://bemreal.com/api
```

### Step 5: Deploy

```bash
# Either: Push code to main branch (auto-deploys)
git push origin main

# Or: SSH to VPS and manually trigger
ssh bemreal@your-vps-ip
cd /home/bemreal/bemreal
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🏗️ Architecture

```
GitHub Push (main)
    ↓
GitHub Actions CI/CD
    ├─ Lint + Test Backend
    ├─ Lint + Test Frontend
    ├─ Build Docker Images
    ├─ Push to Docker Registry (ghcr.io)
    └─ SSH Deploy to VPS
         ↓
VPS (Ubuntu 20.04+)
    ├─ Docker Compose
    │   ├─ Frontend (Nginx + React dist)
    │   └─ Backend (FastAPI + Alembic migrations)
    └─ External Services
         ├─ Supabase PostgreSQL + PostGIS
         ├─ S3 / Backblaze B2 (documents)
         ├─ Stripe / PagSeguro (payments)
         └─ Certbot SSL (HTTPS)
```

---

## 📦 Docker Images

### Backend Image

- **Base**: `python:3.11-slim`
- **Size**: ~400MB
- **Includes**:
  - FastAPI + Uvicorn
  - SQLAlchemy + Alembic
  - PostGIS types (geoalchemy2)
  - Gunicorn (optional, for production)

### Frontend Image

- **Base**: `nginx:alpine` (production)
- **Build**: `node:20-alpine`
- **Size**: ~30MB
- **Includes**:
  - React + Vite (generated static files)
  - Nginx with gzip compression
  - Reverse proxy to backend

---

## 🔧 Configuration

### Environment Variables

| Variable | Backend | Frontend | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | ✅ | - | Supabase PostgreSQL connection |
| `JWT_SECRET` | ✅ | - | Secret key for JWT signing |
| `JWT_EXPIRATION_SECONDS` | ✅ | - | Token lifetime (900s = 15min) |
| `S3_BUCKET` | ✅ | - | S3 bucket for documents |
| `S3_ACCESS_KEY_ID` | ✅ | - | S3 access key |
| `S3_SECRET_ACCESS_KEY` | ✅ | - | S3 secret key |
| `CORS_ORIGINS` | ✅ | - | Allowed origins for API |
| `ENV` | ✅ | - | Environment (production/staging) |
| `STRIPE_SECRET_KEY` | ✅ | - | Stripe API key |
| `VITE_API_URL` | - | ✅ | Backend API URL |
| `VITE_APP_NAME` | - | ✅ | Application name |

Deployment automatically sets:

- `PYTHONUNBUFFERED=1` (Python stdout flushing)
- `PYTHONDONTWRITEBYTECODE=1` (skip .pyc files)
- `NODE_ENV=production` (minified builds)

---

## 📊 Monitoring & Logging

### Docker Logs

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs --tail=100

# Specific service
docker-compose logs -f api --tail=50
```

### Health Checks

Both containers have healthchecks:

```bash
# Check status
docker-compose ps

# Manual health check
curl https://bemreal.com/health
# Expected: 200 OK with timestamp

# Backend metrics
curl https://bemreal.com/health | jq
```

### Persistent Logs

Docker logs rotate automatically:

- Max file size: 10MB
- Keep 3 files max
- Location: `/var/lib/docker/containers/.../`

For persistent JSON logs:

```bash
docker-compose logs --follow --timestamps
```

---

## 🔐 Security

### SSL/HTTPS

Automatic via Certbot:

```bash
# On VPS
sudo certbot renew --dry-run  # Test renewal
sudo certbot renew             # Force renewal
```

Auto-renewal scheduled via systemd timer.

### Secrets Management

❌ **Never commit secrets to Git**

✅ **Use GitHub Secrets:**

- Settings → Secrets and variables
- Variables are injected at deploy time

✅ **Use .env files** (gitignored on VPS):

- `.env.production` → server only
- `.env.staging` → staging server
- `.env` → (local, gitignored)

### SSH Access

```bash
# Generate SSH key (if needed)
ssh-keygen -t ed25519 -C "deployment"

# Add to GitHub
cat ~/.ssh/deployment.pub
# Settings → Deploy keys → Add deploy key

# Test SSH to VPS
ssh -i ~/deployment bemreal@your-vps-ip
```

---

## 🚨 Troubleshooting

### Deployment Failed in GitHub Actions

1. **Check logs**: Actions tab → click failed workflow
2. **Common issues**:
   - Missing secrets (check GitHub Settings → Secrets)
   - Docker image build failed (check syntax)
   - Test failures (check recent code changes)

**Fix**:

```bash
# View full log
cat ~/.github/workflows/logs/

# Re-run workflow
GitHub UI → Re-run failed jobs
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs -f api

# Common errors:
# "Address already in use" → Change port in docker-compose.prod.yml
# "Permission denied" → Check user permissions
# "Database connection failed" → Check DATABASE_URL
```

### Health Check Failed

```bash
# Test endpoint manually
curl http://localhost:8000/health

# Check if service is running
docker-compose ps

# Restart container
docker-compose restart api
```

### Database Migration Failed

```bash
# SSH to VPS
ssh bemreal@your-vps-ip

# View migration history
docker-compose exec api alembic current
docker-compose exec api alembic history

# Rollback (if needed)
docker-compose exec api alembic downgrade -1

# Re-run migrations
docker-compose exec api alembic upgrade head
```

---

## 📈 Scaling Tips

### Horizontal Scaling

For multiple backend instances:

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3  # 3 instances
  
  load-balancer:
    image: nginx:alpine
    # Routes to api:1, api:2, api:3
```

### Vertical Scaling

```bash
# Increase resources per container
docker update --memory=2g bemreal-api
docker update --cpus="1.5" bemreal-api
```

### Caching

```bash
# Frontend: Redis cache
# Backend: Database query caching
# S3: CDN distribution (Cloudflare, etc)
```

---

## 🔄 CI/CD Workflow

### Branch Strategy

| Branch | Environment | Auto-Deploy | Testing |
|--------|-------------|------------|---------|
| `develop` | Staging | ✅ | All tests |
| `main` | Production | ✅ | All tests + approval |
| `feature/*` | None | ❌ | Tests only (PR) |

### Deployment Gates

```mermaid
graph LR
    A[Push Code] --> B[Run Tests]
    B --> C{Tests Pass?}
    C -->|No| D[Notify Developer]
    C -->|Yes| E[Build Docker]
    E --> F[Push Registry]
    F --> G{Auto-Deploy?}
    G -->|Staging| H[Deploy to Staging]
    G -->|Main| I[Deploy to Production]
```

---

## 📝 Useful Commands

### Local Development (with Docker)

```bash
# Build locally (test before push)
docker-compose build

# Run locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### VPS Management

```bash
# SSH to VPS
ssh bemreal@your-vps-ip

# Check service status
systemctl status bemreal

# Restart application
systemctl restart bemreal

# View live logs
docker-compose -f docker-compose.prod.yml logs -f

# Execute command in container
docker-compose exec api python -c "import sys; print(sys.version)"

# Database query
docker-compose exec api psql $DATABASE_URL -c "SELECT COUNT(*) FROM app_user;"
```

### Docker Registry

```bash
# Login to GitHub Container Registry
docker login ghcr.io

# Pull latest images
docker pull ghcr.io/your-org/bem-real-api:main
docker pull ghcr.io/your-org/bem-real-web:main

# List images
docker images | grep bemreal
```

---

## 🎓 Learning Resources

- **Docker**: <https://docs.docker.com/>
- **Docker Compose**: <https://docs.docker.com/compose/>
- **GitHub Actions**: <https://docs.github.com/en/actions>
- **Supabase**: <https://supabase.com/docs>
- **FastAPI**: <https://fastapi.tiangolo.com/>
- **Nginx**: <https://nginx.org/en/docs/>

---

## 🔗 Related Documentation

- [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) - Backend architecture
- [BACKEND_API_TESTING.md](./BACKEND_API_TESTING.md) - Testing endpoints
- [QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md) - Local backend setup

---

## ✅ Deployment Checklist

Before pushing to production:

- [ ] All tests pass locally
- [ ] No hardcoded secrets in code
- [ ] Environment variables documented
- [ ] Database migrations created
- [ ] SSL certificate valid
- [ ] DNS configured (CNAME/A record pointing to VPS)
- [ ] Backups configured
- [ ] Monitoring alerts enabled
- [ ] Error tracking (Sentry, etc) configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Database indexes optimized
- [ ] Frontend build size checked
- [ ] Health checks responding
- [ ] Logs being rotated

---

## 📞 Support

For issues or questions:

1. Check `docker-compose logs -f`
2. Review error in GitHub Actions
3. Check configuration in .env files
4. Consult troubleshooting section above
5. Contact deployment team

---

**Last Updated**: February 5, 2026  
**Version**: 1.0.0
