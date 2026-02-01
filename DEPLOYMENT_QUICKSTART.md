# 🚀 Quick Deployment Guide

This repository is configured with automated CI/CD pipelines for deploying to Azure Functions (backend) and Vercel (frontend).

## ⚡ Quick Start

### Prerequisites
1. Azure account with Function App created
2. Supabase account with database setup
3. Vercel account (or use Azure Static Web Apps)
4. GitHub repository secrets configured

### One-Time Setup

1. **Configure GitHub Secrets** (see `.github/SECRETS_TEMPLATE.md`)
   - 8 backend secrets for Azure deployment
   - 4 frontend secrets for Vercel deployment

2. **Deploy**
   ```bash
   git push origin main
   ```

That's it! GitHub Actions will automatically:
- Build and test the code
- Deploy backend to Azure Functions
- Deploy frontend to Vercel

## 📁 Project Structure

```
aqkin/
├── apps/
│   ├── api/              # Python FastAPI backend
│   │   ├── main.py
│   │   └── requirements.txt
│   └── web/              # React frontend
│       └── src/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # CI tests and linting
│   │   ├── deploy-backend.yml        # Azure Functions deployment
│   │   └── deploy-frontend.yml       # Vercel deployment
│   └── SECRETS_TEMPLATE.md           # Secret configuration guide
├── DEPLOYMENT_CONFIG.md              # Detailed deployment guide
└── STATUS_DEPLOY.md                  # Current deployment status
```

## 🔄 Automated Workflows

### CI Pipeline (`ci.yml`)
Runs on every PR and push:
- Lints frontend and backend code
- Runs tests
- Builds all projects

### Backend Deployment (`deploy-backend.yml`)
Triggers on:
- Push to `main` with changes in `apps/api/**`
- Manual workflow dispatch

Deploys to: Azure Functions

### Frontend Deployment (`deploy-frontend.yml`)
Triggers on:
- Push to `main` with changes in `apps/web/**`
- Manual workflow dispatch

Deploys to: Vercel

## 🔧 Manual Deployment

### Deploy Backend Manually
```bash
# Option 1: Via GitHub Actions
# Go to Actions → Deploy Backend → Run workflow

# Option 2: Via Azure CLI
cd apps/api
func azure functionapp publish ativo-real-api-593 --python
```

### Deploy Frontend Manually
```bash
# Option 1: Via GitHub Actions
# Go to Actions → Deploy Frontend → Run workflow

# Option 2: Via Vercel CLI
cd apps/web
npx nx build web
vercel --prod
```

## 🧪 Testing

### Test Backend Locally
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload
```

### Test Frontend Locally
```bash
npx nx serve web
```

### Test Deployed Backend
```bash
curl https://ativo-real-api-593.azurewebsites.net/
```

### Test Deployed Frontend
```bash
curl https://your-app.vercel.app
```

## 📚 Documentation

- **[DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md)** - Complete deployment configuration guide
- **[.github/SECRETS_TEMPLATE.md](./.github/SECRETS_TEMPLATE.md)** - GitHub secrets template
- **[STATUS_DEPLOY.md](./STATUS_DEPLOY.md)** - Current deployment status
- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Alternative deployment options
- **[SETUP_AZURE.md](./SETUP_AZURE.md)** - Azure-specific setup

## 🐛 Troubleshooting

### Deployment fails
1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Check Azure Function App logs

### Backend not responding
1. Verify environment variables in Azure
2. Check database connection
3. View Azure Function logs

### Frontend can't connect to backend
1. Check CORS configuration in backend
2. Verify `VITE_AZURE_BACKEND_URL` in Vercel
3. Test backend URL directly

## 🔑 Required Secrets

See [.github/SECRETS_TEMPLATE.md](./.github/SECRETS_TEMPLATE.md) for the complete list.

**Backend (8 secrets):**
- AZURE_FUNCTION_APP_NAME
- AZURE_RESOURCE_GROUP
- AZURE_FUNCTION_APP_PUBLISH_PROFILE
- DATABASE_URL
- JWT_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_KEY

**Frontend (4 secrets):**
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- VITE_AZURE_BACKEND_URL

## ✅ Deployment Checklist

- [ ] Azure Function App created
- [ ] Supabase database configured
- [ ] All 12 GitHub secrets added
- [ ] Vercel project linked
- [ ] Test local development works
- [ ] Push to main branch
- [ ] Verify GitHub Actions pass
- [ ] Test deployed backend endpoint
- [ ] Test deployed frontend
- [ ] Verify frontend connects to backend

## 🎯 Next Steps

After deployment is configured:

1. **Monitor deployments** in GitHub Actions
2. **Set up monitoring** in Azure Application Insights
3. **Configure custom domain** in Vercel
4. **Set up database backups** in Supabase
5. **Configure alerts** for deployment failures

## 💡 Tips

- Use `workflow_dispatch` to manually trigger deployments
- Check Azure Function logs for debugging: `az functionapp log tail`
- Use Vercel preview deployments for testing
- Keep secrets secure and rotate regularly
