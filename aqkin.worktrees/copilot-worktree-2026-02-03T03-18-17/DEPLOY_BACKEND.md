# 🚀 Deploy Backend Azure Functions

## ✅ Function Apps Encontrados:

### 1. **ativo-real-api-593** (Recomendado)
- **Resource Group**: `ativo-real-rg`
- **URL**: `https://ativo-real-api-593.azurewebsites.net`
- **API Base**: `https://ativo-real-api-593.azurewebsites.net/api`
- **Status**: ✅ Ativo (mas sem código deployado)

### 2. **ativo-real-backend**
- **Resource Group**: `rg-ativo-real`
- **URL**: `https://ativo-real-backend.azurewebsites.net`
- **API Base**: `https://ativo-real-backend.azurewebsites.net/api`
- **Status**: ✅ Ativo (mas sem código deployado)

---

## 📦 Deploy Backend (Python Azure Functions)

### Opção A: Deploy Manual via Azure CLI

```bash
# 1. Navegar para o backend
cd novo-projeto/backend

# 2. Deploy para ativo-real-api-593
func azure functionapp publish ativo-real-api-593 --python

# OU para ativo-real-backend
func azure functionapp publish ativo-real-backend --python

# 3. Verificar deploy
az functionapp function list \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  -o table
```

### Opção B: Deploy via Script PowerShell

```powershell
# Usar script existente
cd novo-projeto
.\DEPLOY_BACKEND_COMPLETO.ps1
```

### Opção C: Deploy via Batch Script

```batch
cd novo-projeto
deploy_backend.bat
```

---

## ⚙️ Configurar Environment Variables no Azure

Após deploy, configurar variáveis de ambiente:

```bash
# DATABASE_URL
az functionapp config appsettings set \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --settings "DATABASE_URL=postgresql://adminativo:SENHA@psql-bemreal-ai1-4764.postgres.database.azure.com:5432/ativoreal_geo?sslmode=require"

# JWT_SECRET
az functionapp config appsettings set \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --settings "JWT_SECRET=sua_secret_key_super_segura"

# OPENROUTER_API_KEY (opcional, para dev tools)
az functionapp config appsettings set \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --settings "OPENROUTER_API_KEY=sk-or-v1-..."
```

---

## 🧪 Testar Backend Após Deploy

```bash
# Teste 1: Health check
curl https://ativo-real-api-593.azurewebsites.net

# Teste 2: Login endpoint
curl -X POST https://ativo-real-api-593.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Teste 3: Listar projetos (requer auth)
curl https://ativo-real-api-593.azurewebsites.net/api/projects \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔄 Atualizar Frontend (.env)

Depois do backend deployado:

```bash
# 1. Editar ativo-real-monorepo/.env
VITE_AZURE_BACKEND_URL=https://ativo-real-api-593.azurewebsites.net/api

# 2. Rebuild frontend
cd ativo-real-monorepo
npx nx build web

# 3. Deploy frontend (Azure Static Web Apps ou outro host)
```

---

## 📊 Status Atual

| Component | Status | URL |
|-----------|--------|-----|
| **Function App 1** | ✅ Criado (sem código) | ativo-real-api-593.azurewebsites.net |
| **Function App 2** | ✅ Criado (sem código) | ativo-real-backend.azurewebsites.net |
| **Backend Code** | ⚠️ Não deployado | `novo-projeto/backend/` |
| **Database** | ✅ Ativo | `psql-bemreal-ai1-4764.postgres.database.azure.com` |
| **Frontend Monorepo** | ✅ Pronto | `ativo-real-monorepo/` |

---

## 🚨 Próximos Passos CRÍTICOS

1. **Deploy Backend**: Escolher um dos Function Apps e fazer deploy do código
2. **Configurar Env Vars**: DATABASE_URL, JWT_SECRET
3. **Testar Endpoints**: Verificar se `/api/auth/login` funciona
4. **Atualizar Frontend .env**: Com URL correta
5. **Build + Deploy Frontend**: Azure Static Web Apps

---

## 💡 Recomendação

Use **ativo-real-api-593** porque:
- Nome mais limpo
- Resource group `ativo-real-rg` (mais organizado)
- Já está criado e ativo

Comando rápido:
```bash
cd novo-projeto/backend
func azure functionapp publish ativo-real-api-593 --python
```

---

## 📖 Referências

- Backend code: `novo-projeto/backend/function_app.py` (50KB, 1300+ linhas)
- Database schema: `novo-projeto/database/init/01_schema.sql`
- Deploy scripts: `novo-projeto/deploy_backend.bat` ou `DEPLOY_BACKEND_COMPLETO.ps1`
