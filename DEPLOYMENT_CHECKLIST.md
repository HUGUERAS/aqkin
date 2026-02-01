# 🎯 Deployment Status Checklist

Use this checklist to track your deployment progress. Check off items as you complete them.

## 📋 Phase 1: Azure Setup (Backend)

### Azure Function App
- [ ] Azure Function App created (e.g., `ativo-real-api-593`)
- [ ] Resource Group created (e.g., `ativo-real-rg`)
- [ ] Function App is running (verify in Azure Portal)
- [ ] Python runtime version set to 3.11
- [ ] Linux OS configured

### Azure Publish Profile
- [ ] Download publish profile from Azure Portal
- [ ] Add `AZURE_FUNCTION_APP_PUBLISH_PROFILE` to GitHub Secrets
- [ ] Add `AZURE_FUNCTION_APP_NAME` to GitHub Secrets
- [ ] Add `AZURE_RESOURCE_GROUP` to GitHub Secrets

## 📋 Phase 2: Database Setup (Supabase)

### Supabase Project
- [ ] Supabase project created at https://supabase.com
- [ ] Project is accessible
- [ ] Note project reference ID from URL

### Database Configuration
- [ ] PostGIS extension enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`)
- [ ] Database schema deployed (run `database/init/01_schema.sql` if exists)
- [ ] Tables created and verified in Table Editor
- [ ] Connection string obtained from Settings → Database

### Supabase Secrets
- [ ] Copy Supabase URL from Settings → API
- [ ] Add `SUPABASE_URL` to GitHub Secrets
- [ ] Copy service_role key from Settings → API
- [ ] Add `SUPABASE_SERVICE_KEY` to GitHub Secrets
- [ ] Copy database connection string
- [ ] Add `DATABASE_URL` to GitHub Secrets
- [ ] Test database connection with `psql` command

### Security Configuration
- [ ] JWT_SECRET generated with `openssl rand -base64 32`
- [ ] Add `JWT_SECRET` to GitHub Secrets

## 📋 Phase 3: Frontend Setup (Vercel)

### Vercel Account
- [ ] Vercel account created at https://vercel.com
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Repository connected to Vercel

### Vercel Project
- [ ] Run `vercel` command in `apps/web` directory
- [ ] Project linked to Vercel
- [ ] Note Organization ID from `.vercel/project.json`
- [ ] Note Project ID from `.vercel/project.json`

### Vercel Secrets
- [ ] Create Vercel token at https://vercel.com/account/tokens
- [ ] Add `VERCEL_TOKEN` to GitHub Secrets
- [ ] Add `VERCEL_ORG_ID` to GitHub Secrets
- [ ] Add `VERCEL_PROJECT_ID` to GitHub Secrets
- [ ] Determine backend URL (after backend is deployed)
- [ ] Add `VITE_AZURE_BACKEND_URL` to GitHub Secrets

### Vercel Environment Variables
- [ ] Add `VITE_AZURE_BACKEND_URL` in Vercel Dashboard
- [ ] Environment variable set for Production
- [ ] Environment variable set for Preview (optional)

## 📋 Phase 4: GitHub Configuration

### Repository Secrets Summary
Verify all 12 secrets are added:

#### Backend (8 secrets)
- [ ] `AZURE_FUNCTION_APP_NAME`
- [ ] `AZURE_RESOURCE_GROUP`
- [ ] `AZURE_FUNCTION_APP_PUBLISH_PROFILE`
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_KEY`

#### Frontend (4 secrets)
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `VITE_AZURE_BACKEND_URL`

### Workflow Files
- [ ] `.github/workflows/ci.yml` exists
- [ ] `.github/workflows/deploy-backend.yml` exists
- [ ] `.github/workflows/deploy-frontend.yml` exists

## 📋 Phase 5: First Deployment

### Trigger Deployment
- [ ] Commit all changes
- [ ] Push to main branch: `git push origin main`
- [ ] Check GitHub Actions tab for workflow runs

### Monitor Backend Deployment
- [ ] "Deploy Backend" workflow started
- [ ] Backend deployment completed successfully
- [ ] Check Azure Function App for deployed code
- [ ] Verify functions appear in Azure Portal

### Monitor Frontend Deployment
- [ ] "Deploy Frontend" workflow started
- [ ] Frontend deployment completed successfully
- [ ] Note Vercel deployment URL from logs

## 📋 Phase 6: Verification

### Backend Verification
- [ ] Test health endpoint: `curl https://ativo-real-api-593.azurewebsites.net/`
- [ ] Response received (should show FastAPI welcome or API status)
- [ ] Test API endpoint: `curl https://ativo-real-api-593.azurewebsites.net/api/projetos`
- [ ] No CORS errors
- [ ] Check Azure Function logs for errors

### Frontend Verification
- [ ] Open frontend URL in browser
- [ ] Page loads without errors
- [ ] Check browser console for errors
- [ ] Verify frontend can connect to backend
- [ ] Test login functionality (if implemented)
- [ ] Test map functionality (if implemented)

### Integration Testing
- [ ] Frontend successfully calls backend API
- [ ] Authentication works (if implemented)
- [ ] Data persists to database
- [ ] PostGIS queries work correctly

## 📋 Phase 7: Post-Deployment

### Documentation
- [ ] Update STATUS_DEPLOY.md with current status
- [ ] Document any issues encountered
- [ ] Update environment URLs in documentation

### Monitoring Setup
- [ ] Azure Application Insights configured (optional)
- [ ] Vercel Analytics enabled (optional)
- [ ] Set up error alerting (optional)

### Domain Configuration (Optional)
- [ ] Custom domain configured in Vercel
- [ ] DNS records updated
- [ ] SSL certificate verified
- [ ] Update CORS settings with new domain

## 🎉 Deployment Complete!

- [ ] All checklist items above are complete
- [ ] Application is live and accessible
- [ ] Backend and frontend are communicating
- [ ] Database is functioning correctly

## 📝 Notes

Use this section to note any issues, custom configurations, or deviations from the standard setup:

```
[Add your notes here]
```

## 🔄 Next Deployments

After initial setup, deployments are automatic:
- Push to `main` branch triggers deployments
- Monitor in GitHub Actions tab
- Check Vercel dashboard for frontend deployments
- Check Azure Portal for backend deployments

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for error messages
2. Review Azure Function logs: `az functionapp log tail --name <app-name> --resource-group <rg-name>`
3. Check Vercel deployment logs in dashboard
4. Review DEPLOYMENT_CONFIG.md for troubleshooting guide
