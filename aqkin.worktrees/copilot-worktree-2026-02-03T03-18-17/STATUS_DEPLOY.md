# 🚨 Status Deploy Backend Azure Functions

## ✅ O que foi feito:

### 1. **Function Apps Encontrados**
- ✅ `ativo-real-api-593` (ativo-real-rg)
- ✅ `ativo-real-backend` (rg-ativo-real)
- ✅ Ambos online e respondendo

### 2. **Deploy Tentado**
- ✅ ZIP criado (53KB) com todo código backend
- ✅ Upload para Azure concluído
- ✅ Settings configurados (SCM_DO_BUILD_DURING_DEPLOYMENT)
- ⚠️ Functions não aparecem após deploy

### 3. **Frontend Configurado**
- ✅ `.env` com URL: `https://ativo-real-api-593.azurewebsites.net/api`
- ✅ API Client pronto (`services/api.ts`)
- ✅ Páginas conectadas (DesenharArea, DashboardConfluencia)

---

## ⚠️ **Problema Atual:**

**Azure Functions v2 Python Model** requer estrutura específica:
- `function_app.py` usa decorators `@app.route()`
- Código está correto (50KB, 1300 linhas)
- Upload funciona mas Functions não são reconhecidas

**Possíveis causas:**
1. Build remoto não completou (precisa mais tempo)
2. Falta environment variable `DATABASE_URL` (Functions podem estar crashando)
3. Requirements.txt com dependências pesadas (build lento)

---

## 🔧 **Solução Recomendada:**

### Opção A: Configurar DATABASE_URL e esperar build

```bash
# 1. Configurar DATABASE_URL
az functionapp config appsettings set \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --settings "DATABASE_URL=postgresql://USER:PASS@psql-bemreal-ai1-4764.postgres.database.azure.com:5432/ativoreal_geo?sslmode=require"

# 2. Configurar JWT_SECRET
az functionapp config appsettings set \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --settings "JWT_SECRET=sua_super_secret_key_aqui_123"

# 3. Restart para aplicar
az functionapp restart --name ativo-real-api-593 --resource-group ativo-real-rg

# 4. Aguardar 5-10 minutos para build completar

# 5. Testar
curl https://ativo-real-api-593.azurewebsites.net/api/auth/login
```

### Opção B: Deploy via GitHub Actions (mais confiável)

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['novo-projeto/backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: Azure/functions-action@v1
        with:
          app-name: ativo-real-api-593
          package: novo-projeto/backend
```

### Opção C: Deploy Manual via Portal Azure

1. Portal Azure → Function Apps → ativo-real-api-593
2. Development Tools → App Files
3. Upload `function_app.py`, `requirements.txt`, `host.json`
4. Configure Environment Variables
5. Restart

---

## 📊 **Environment Variables Necessárias:**

| Variable | Valor | Status |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | ⚠️ NÃO configurado |
| `JWT_SECRET` | `sua_secret_key` | ⚠️ NÃO configurado |
| `FUNCTIONS_WORKER_RUNTIME` | `python` | ✅ Configurado |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | ✅ Configurado |
| `ENABLE_ORYX_BUILD` | `true` | ✅ Configurado |

---

## 🗄️ **Database Info (do local.settings.json):**

```
Server: psql-bemreal-ai1-4764.postgres.database.azure.com
Database: ativoreal_geo
User: admin (ou adminativo)
Password: ??? (verificar no Azure Portal)
SSL: Required
```

**Como obter connection string:**
```bash
az postgres flexible-server show \
  --name psql-bemreal-ai1-4764 \
  --resource-group ativo-real-rg \
  --query "fullyQualifiedDomainName"
```

---

## 🚀 **Próximos Passos (Manual):**

### 1. Obter senha do PostgreSQL

```bash
# Listar secrets
az keyvault secret list --vault-name <vault-name> -o table

# OU resetar senha
az postgres flexible-server update \
  --name psql-bemreal-ai1-4764 \
  --resource-group ativo-real-rg \
  --admin-password "NovaSenhaSegura123!"
```

### 2. Configurar Environment Variables

```bash
az functionapp config appsettings set \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --settings \
    "DATABASE_URL=postgresql://admin:NovaSenhaSegura123!@psql-bemreal-ai1-4764.postgres.database.azure.com:5432/ativoreal_geo?sslmode=require" \
    "JWT_SECRET=$(openssl rand -base64 32)"
```

### 3. Verificar Logs

```bash
# Stream logs
az functionapp log tail --name ativo-real-api-593 --resource-group ativo-real-rg

# Ou portal: https://ativo-real-api-593.scm.azurewebsites.net/api/logstream
```

### 4. Testar Endpoints

```bash
# Health check
curl https://ativo-real-api-593.azurewebsites.net

# Login
curl -X POST https://ativo-real-api-593.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'
```

---

## 💡 **Alternativa: Usar ativo-real-backend**

Se `ativo-real-api-593` continuar com problemas:

```bash
# Deploy para o outro Function App
cd novo-projeto/backend
az functionapp deployment source config-zip \
  --resource-group rg-ativo-real \
  --name ativo-real-backend \
  --src deploy-backend.zip

# Atualizar frontend .env
VITE_AZURE_BACKEND_URL=https://ativo-real-backend.azurewebsites.net/api
```

---

## 📖 **Referências:**

- Backend code: `novo-projeto/backend/function_app.py`
- Requirements: `novo-projeto/backend/requirements.txt` (SQLAlchemy, GeoAlchemy2, Shapely)
- Database schema: `novo-projeto/database/init/01_schema.sql`
- Deploy ZIP: `novo-projeto/backend/deploy-backend.zip`

---

## 🎯 **Resumo:**

| Item | Status |
|------|--------|
| Backend Code | ✅ Pronto (50KB) |
| Function Apps | ✅ Criados e online |
| Deploy Upload | ✅ Concluído |
| Functions Ativas | ❌ Não aparecem |
| DATABASE_URL | ⚠️ Falta configurar |
| JWT_SECRET | ⚠️ Falta configurar |
| Frontend Ready | ✅ 100% pronto |

**Ação crítica:** Configurar DATABASE_URL + JWT_SECRET + aguardar build completar (5-10min)
