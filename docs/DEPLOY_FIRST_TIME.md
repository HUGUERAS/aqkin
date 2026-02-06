# Bem Real - First Deployment Setup (Zero to Hero)

**Timeline**: 15-30 minutes | **Difficulty**: Intermediate | **Requirements**: GitHub account, Domain, VPS

---

## 🎯 Goal

Deploy Bem Real to production in <30 minutes with zero localhost reliance.

---

## 📊 Prerequisites

- [ ] GitHub repository (public or private)
- [ ] VPS with Ubuntu 20.04+ (Linode, DigitalOcean, Hetzner, AWS EC2, etc)
- [ ] Domain name (e.g., bemreal.com)
- [ ] DNS access (to point domain to VPS IP)
- [ ] SSH key pair for VPS
- [ ] Supabase account (free tier OK for testing)

### Estimated Costs (Monthly)

| Service | Cheapest | Recommended |
|---------|----------|-------------|
| VPS | $5 (1GB RAM) | $15 (2GB RAM) |
| Domain | $1-3 | $5-10 |
| Supabase | Free | $25 |
| S3 Storage | $0 (free tier) | $5-20 |
| **TOTAL** | **~$10/mo** | **~$50/mo** |

---

## 🚀 Step 1: Prepare VPS (5 min)

### 1.1: Create VPS

Choose any provider (DigitalOcean, Linode, Hetzner, AWS):

- OS: Ubuntu 20.04 LTS
- RAM: 2GB (minimum)
- Storage: 20GB SSD

Get: _VPS IP Address_

### 1.2: Connect via SSH

```bash
# Add SSH key (if using password auth)
ssh root@YOUR_VPS_IP
# Or with key:
ssh -i ~/.ssh/id_rsa root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Set hostname
hostnamectl set-hostname bemreal
```

### 1.3: Configure DNS

In your domain registrar:

- Add A record: `bemreal.com` → `YOUR_VPS_IP`
- Add A record: `www.bemreal.com` → `YOUR_VPS_IP`

DNS can take 5-30 minutes to propagate.

---

## 🔑 Step 2: Setup GitHub Secrets (5 min)

### 2.1: Generate SSH Key for Deployment

```bash
# On your local machine
ssh-keygen -t ed25519 -f ~/.ssh/bemreal_deploy -C "bemreal-deploy"

# Get public key
cat ~/.ssh/bemreal_deploy.pub
```

### 2.2: Add SSH Key to VPS

```bash
# On VPS
mkdir -p ~/.ssh
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2.3: Add Secrets to GitHub

GitHub → Settings → Secrets and variables → Actions:

```
# VPS Connection
PROD_HOST=YOUR_VPS_IP
PROD_USER=root  # (or create 'bemreal' user first)
PROD_SSH_KEY=<content_of_~/.ssh/bemreal_deploy>
PROD_PORT=22

# Application
JWT_SECRET=<generate below>
```

**Generate JWT_SECRET**:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🗄️ Step 3: Setup Database (Supabase) (5 min)

### 3.1: Create Supabase Project

1. Visit <https://supabase.com/>
2. Sign up / Login
3. Create new project
4. Choose region (pick closest to your users)
5. Set password (save it!)
6. Wait for setup (~2 min)

### 3.2: Enable PostGIS Extension

In Supabase dashboard:

- SQL Editor
- Create new query
- Paste:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

- Execute

### 3.3: Get Connection String

In Supabase → Project Settings → Database:

- Copy "Connection pooling" string
- Replace `[YOUR-PASSWORD]` with your password
- Format: `postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres`

Store this as `DATABASE_URL` in GitHub Secrets and .env.production

---

## 📦 Step 4: Configure Environment (2 min)

### 4.1: Copy .env Template

```bash
# On your computer / local repo
cp .env.production.example .env.production
```

### 4.2: Edit .env.production

```bash
# Set your actual values
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.supabase.co:5432/postgres
JWT_SECRET=<use the same one from GitHub Secrets>
S3_BUCKET=bemreal-docs
S3_REGION=us-east-1
# ... other values
```

Don't commit this file! It's in .gitignore

---

## 🏗️ Step 5: Deploy VPS Setup Script (3 min)

Run the automated setup on VPS:

```bash
# SSH to VPS as root
ssh root@YOUR_VPS_IP

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/bem-real/main/scripts/setup-vps.sh | sudo bash

# Or manually:
wget https://raw.githubusercontent.com/YOUR_ORG/bem-real/main/scripts/setup-vps.sh
sudo chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

This will:

- ✅ Install Docker + Docker Compose
- ✅ Install Nginx + Certbot
- ✅ Setup SSL/HTTPS
- ✅ Create systemd service
- ✅ Configure firewall (optional)
- ✅ Setup log rotation

---

## 🚢 Step 6: Trigger First Deployment (5 min)

### 6.1: Push Code to Main Branch

```bash
# Ensure you're on main branch
git checkout main

# Make a small change (or just commit with --allow-empty)
git commit --allow-empty -m "feat: first production deployment"
git push origin main
```

### 6.2: Monitor GitHub Actions

GitHub → Actions tab:

- Watch build progress
- Check for errors
- Should complete in ~5-10 minutes

If it fails:

1. Click on failed job
2. Scroll to "Deploy to production"
3. Read error message
4. Fix issue and push again

### 6.3: Verify Deployment

Once GitHub Actions completes:

```bash
# Check VPS
ssh root@YOUR_VPS_IP

# View containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health
curl http://localhost:8000/health

# Test API
curl http://localhost:8000/projects
```

---

## ✅ Verify It's Working

### 7.1: Test in Browser

```
http://YOUR_VPS_IP:80
http://bemreal.com  (after DNS propagates, might take 30 min)
```

You should see Bem Real frontend loading.

### 7.2: Test API Endpoint

```bash
curl https://bemreal.com/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### 7.3: Test HTTPS/SSL

```bash
curl -I https://bemreal.com
# Expected: HTTP/1.1 200 OK
# Check: Certificate expires in ~90 days
```

---

## 🔄 Optional: Setup Staging Environment

For testing before production:

```bash
# In GitHub Secrets, add STAGING_* versions:
STAGING_HOST=staging-ip
STAGING_USER=bemreal
STAGING_SSH_KEY=<key>
STAGING_PORT=22

# Create develop branch
git checkout -b develop
git push origin develop

# Now pushes to develop auto-deploy to staging
```

---

## 🛠️ Troubleshooting

### "Connection refused" / Can't SSH to VPS

```bash
# Check SSH port
ssh root@YOUR_VPS_IP -p 22 -v

# Try with password if key issues
ssh root@YOUR_VPS_IP  # then enter password
```

### GitHub Actions Fails with "Permission denied"

```bash
# SSH key issue - check:
1. Private key in GitHub Secret is correct (no extra spaces)
2. Public key added to VPS ~/.ssh/authorized_keys
3. Permissions are 600: chmod 600 ~/.ssh/authorized_keys
```

### Docker build runs out of disk space

```bash
# On VPS, clean Docker
docker system prune -a
docker image prune -a

# Check space
df -h
```

### Certbot (SSL) fails

```bash
# On VPS, verify DNS points to IP
nslookup bemreal.com
ping bemreal.com

# Manually request certificate
sudo certbot certonly --standalone -d bemreal.com -d www.bemreal.com
```

### Application won't start / Health check fails

```bash
# On VPS
docker-compose logs -f api

# Check database connection
docker-compose exec api psql -c "SELECT version();"

# Check migrations
docker-compose exec api alembic current
```

---

## 📈 Next Steps After Deployment

1. **Verify Database**: `psql $DATABASE_URL -c "\dt"`
2. **Setup S3 Bucket**: For document uploads
3. **Configure Stripe**: For payments
4. **Setup Monitoring**: Sentry / LogRocket
5. **Enable Backups**: Database snapshots
6. **Test Full Flow**: Client → Topografo workflow

---

## 🔐 Security Checklist

After deployment, on VPS:

```bash
# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Setup firewall
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Setup fail2ban (brute force protection)
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

---

## 📊 Monitoring

### Check System Health

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Disk usage
df -h

# Memory usage
free -h

# Docker containers
docker ps -a

# Backend logs (last 100 lines)
docker-compose logs --tail=100

# Database connections
docker-compose exec api psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### Setup Alerts (Optional)

```bash
# Email alerts when service down
# Use a monitoring service like:
# - Uptime Robot (free)
# - StatusPage.io
# - New Relic
```

---

## 💰 Cost Optimization

To reduce costs:

1. **VPS**: Use $5/month (1GB) for small traffic
2. **S3**: Use Backblaze B2 instead (cheaper)
3. **Database**: Use Supabase free tier during development
4. **CDN**: Add Cloudflare (free tier) for caching
5. **Domain**: Get .xyz for $1/year

---

## 🎉 Success

You've deployed Bem Real to production without localhost development!

From now on:

- Push to `main` → Auto-deploys to production
- Push to `develop` → Auto-deploys to staging
- Pull requests get tested automatically

---

## 📞 Need Help?

Issues during deployment?

1. Check logs: `docker-compose logs -f`
2. Check GitHub Actions: View failed job logs
3. Check connectivity: `ping YOUR_VPS_IP`
4. Review [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md) for detailed guide

---

**Deployment completed!** 🚀
