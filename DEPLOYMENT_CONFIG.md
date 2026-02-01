# 🚀 Deployment Configuration Guide

This guide explains how to configure the deployment pipelines for the Ativo Real application.

## 📋 Prerequisites

Before deploying, you need to configure the following:

### 1. Azure Resources (Backend)
- Azure Function App (e.g., `ativo-real-api-593`)
- Azure Resource Group (e.g., `ativo-real-rg`)
- PostgreSQL Database (can use Supabase)

### 2. Frontend Hosting
- Vercel account (recommended) OR
- Netlify account OR
- Azure Static Web Apps

### 3. Supabase Setup
- Supabase project created
- PostGIS extension enabled
- Database schema deployed

## 🔑 Required GitHub Secrets

Configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### Backend Deployment Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AZURE_FUNCTION_APP_NAME` | Name of your Azure Function App | `ativo-real-api-593` |
| `AZURE_RESOURCE_GROUP` | Azure Resource Group name | `ativo-real-rg` |
| `AZURE_FUNCTION_APP_PUBLISH_PROFILE` | Download from Azure Portal → Function App → Get publish profile | (XML content) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with: `openssl rand -base64 32` |
| `SUPABASE_URL` | Supabase project URL | `https://xntxtdximacsdnldouxa.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGci...` (from Supabase Dashboard) |

### Frontend Deployment Secrets (Vercel)

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel` CLI or check project settings |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `vercel` CLI or check project settings |
| `VITE_AZURE_BACKEND_URL` | Backend API URL | `https://ativo-real-api-593.azurewebsites.net/api` |

## 📝 Step-by-Step Configuration

### Step 1: Configure Azure Function App

1. **Create or use existing Azure Function App:**
   ```bash
   # If creating new:
   az functionapp create \
     --name ativo-real-api-593 \
     --resource-group ativo-real-rg \
     --consumption-plan-location eastus2 \
     --runtime python \
     --runtime-version 3.11 \
     --functions-version 4 \
     --os-type linux
   ```

2. **Get the publish profile:**
   - Go to Azure Portal
   - Navigate to your Function App
   - Click "Get publish profile"
   - Copy the entire XML content
   - Add as `AZURE_FUNCTION_APP_PUBLISH_PROFILE` secret in GitHub

### Step 2: Configure Supabase

1. **Create project at https://supabase.com**

2. **Enable PostGIS:**
   ```sql
   -- In Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Run database migration:**
   - Copy content from `database/init/01_schema.sql` (if exists)
   - Execute in Supabase SQL Editor

4. **Get credentials:**
   - Settings → API
   - Copy `URL` → Add as `SUPABASE_URL` secret
   - Copy `service_role` key → Add as `SUPABASE_SERVICE_KEY` secret

5. **Get database connection string:**
   - Settings → Database
   - Copy Connection String (Session mode or Transaction mode)
   - Add as `DATABASE_URL` secret

### Step 3: Configure Vercel (Frontend)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Link project:**
   ```bash
   cd apps/web
   vercel
   ```

3. **Get credentials:**
   ```bash
   # Get org and project IDs from .vercel/project.json
   cat .vercel/project.json
   ```

4. **Create Vercel token:**
   - Go to https://vercel.com/account/tokens
   - Create new token
   - Add as `VERCEL_TOKEN` secret

5. **Add environment variable in Vercel Dashboard:**
   - Go to your project settings
   - Environment Variables
   - Add `VITE_AZURE_BACKEND_URL`

### Step 4: Configure GitHub Secrets

For each secret listed above:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the name and value
5. Click **Add secret**

## 🧪 Testing the Deployment

### Test Backend Deployment

After the backend workflow runs:

```bash
# Test health check
curl https://ativo-real-api-593.azurewebsites.net/

# Test API endpoint
curl https://ativo-real-api-593.azurewebsites.net/api/projetos
```

### Test Frontend Deployment

1. Visit your Vercel URL (shown in deployment logs)
2. Check browser console for any API connection errors
3. Try logging in (if auth is implemented)

## 🔄 Deployment Workflows

### Automatic Deployments

The following triggers automatic deployments:

- **Push to `main` branch** → Deploys both frontend and backend
- **Changes to `apps/api/**`** → Deploys only backend
- **Changes to `apps/web/**`** → Deploys only frontend

### Manual Deployments

You can trigger deployments manually:

1. Go to **Actions** tab in GitHub
2. Select the workflow (Deploy Backend or Deploy Frontend)
3. Click **Run workflow**
4. Select the branch
5. Click **Run workflow**

## 🐛 Troubleshooting

### Backend deployment fails

1. **Check Azure Function App logs:**
   ```bash
   az functionapp log tail \
     --name ativo-real-api-593 \
     --resource-group ativo-real-rg
   ```

2. **Verify environment variables:**
   ```bash
   az functionapp config appsettings list \
     --name ativo-real-api-593 \
     --resource-group ativo-real-rg
   ```

### Frontend can't connect to backend

1. **Verify CORS settings** in backend `main.py`
2. **Check environment variable** in Vercel Dashboard
3. **Test backend URL directly** with curl

### Database connection issues

1. **Test connection string:**
   ```bash
   psql "postgresql://user:pass@host:5432/db"
   ```

2. **Check firewall rules** in Azure/Supabase
3. **Verify SSL mode** in connection string

## 📚 Additional Resources

- [Azure Functions Python Guide](https://learn.microsoft.com/azure/azure-functions/functions-reference-python)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Supabase Database Connection](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## ✅ Deployment Checklist

Use this checklist to ensure everything is configured:

- [ ] Azure Function App created
- [ ] Azure publish profile downloaded
- [ ] Supabase project created and schema deployed
- [ ] PostGIS enabled in Supabase
- [ ] All GitHub secrets configured (8 backend + 4 frontend)
- [ ] Vercel project linked
- [ ] `.env` files configured locally for development
- [ ] Test backend manually with curl
- [ ] Test frontend locally with `npx nx serve web`
- [ ] Push to main branch to trigger deployments
- [ ] Verify deployments in GitHub Actions
- [ ] Test deployed backend URL
- [ ] Test deployed frontend URL
- [ ] Verify frontend connects to backend

## 🎯 Quick Start Commands

```bash
# 1. Configure all GitHub secrets (see table above)

# 2. Push to trigger deployment
git add .
git commit -m "Configure deployment"
git push origin main

# 3. Monitor deployment
# Go to GitHub → Actions tab

# 4. Test deployment
curl https://ativo-real-api-593.azurewebsites.net/
curl https://your-app.vercel.app
```
