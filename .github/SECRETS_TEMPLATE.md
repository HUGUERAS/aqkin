# GitHub Secrets Configuration Template

Copy this template and fill in your actual values, then add them to GitHub Secrets.

## Backend Secrets (Azure Functions)

```bash
# Azure Function App Configuration
AZURE_FUNCTION_APP_NAME=ativo-real-api-593
AZURE_RESOURCE_GROUP=ativo-real-rg

# Get this from Azure Portal → Function App → Get publish profile
AZURE_FUNCTION_APP_PUBLISH_PROFILE=<paste-entire-xml-content-here>

# Database Configuration (from Supabase or Azure PostgreSQL)
# Format: postgresql://username:password@host:port/database?sslmode=require
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Generate with: openssl rand -base64 32
JWT_SECRET=<your-generated-secret>

# Supabase Configuration
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_SERVICE_KEY=<from-supabase-dashboard-settings-api-service-role-key>
```

## Frontend Secrets (Vercel Deployment)

```bash
# Get from https://vercel.com/account/tokens
VERCEL_TOKEN=<your-vercel-token>

# Get from .vercel/project.json after running 'vercel' command
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>

# Backend API URL (after backend is deployed)
VITE_AZURE_BACKEND_URL=https://ativo-real-api-593.azurewebsites.net/api
```

## How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click on **Settings**
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. For each secret above:
   - Enter the name (e.g., `AZURE_FUNCTION_APP_NAME`)
   - Paste the value
   - Click **Add secret**

## Quick Commands

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Get Vercel Project Info
```bash
cd apps/web
vercel
# Follow prompts, then check:
cat .vercel/project.json
```

### Download Azure Publish Profile
```bash
az functionapp deployment list-publishing-profiles \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --xml
```

### Test Database Connection
```bash
psql "postgresql://user:pass@host:port/db"
```

## Validation Checklist

Before triggering deployment, verify:

- [ ] All 8 backend secrets are configured
- [ ] All 4 frontend secrets are configured
- [ ] Database connection string is valid (test with psql)
- [ ] Azure Function App exists and is running
- [ ] Supabase project is created and schema is deployed
- [ ] Vercel project is linked to repository

## Security Notes

⚠️ **NEVER commit these secrets to Git!**

- Secrets should only be stored in:
  - GitHub Secrets (for CI/CD)
  - `.env` files (local development, added to `.gitignore`)
  - Azure Key Vault (production alternative)

- The `SUPABASE_SERVICE_KEY` bypasses Row Level Security - use only in backend
- The `JWT_SECRET` should be at least 32 characters and randomly generated
- Rotate secrets regularly, especially if exposed
