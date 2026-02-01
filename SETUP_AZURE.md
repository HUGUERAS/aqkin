# 🚀 Ativo Real Monorepo - Setup Azure

## ⚙️ Configuração Rápida (SEM localhost!)

### 1️⃣ **Configurar Environment Variables**

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com a URL real do Azure
VITE_AZURE_BACKEND_URL=https://func-ativo-real.azurewebsites.net/api
```

### 2️⃣ **Build para Deploy (NO Azure Static Web Apps)**

```bash
# Build frontend
npx nx build web

# Arquivos prontos em: dist/apps/web/
```

### 3️⃣ **Deploy no Azure Static Web Apps**

```bash
# Via Azure CLI
az staticwebapp create \
  --name swa-ativo-real \
  --resource-group rg-ativo-real \
  --source dist/apps/web \
  --location "East US 2"

# Ou via GitHub Actions (automated)
git push origin main
```

## 🔗 **Backend Azure Functions**

O backend já existe no `novo-projeto/backend/`:
- **URL**: `https://func-ativo-real.azurewebsites.net/api`
- **Database**: PostgreSQL + PostGIS no Azure
- **Auth**: JWT tokens

### Endpoints Disponíveis:

```
POST /auth/login
POST /auth/register
GET  /projects
POST /projects
GET  /parcels/{id}
POST /parcels/{id}/validate-geometry
GET  /parcels/{id}/neighbors
```

## 📁 **Estrutura do Projeto**

```
ativo-real-monorepo/
├── apps/web/          # Frontend React
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts        # 🔥 API Client (conecta Azure)
│   │   ├── pages/
│   │   └── components/
│   └── dist/          # Build output
│
├── backend/           # Backend Python (deploy separado)
│   ├── function_app.py
│   └── models.py
│
└── .env              # Environment variables
```

## 🗺️ **Como os Mapas Funcionam**

### Cliente desenha:
1. Abre `/cliente/desenhar`
2. Desenha polígono no OpenLayers
3. Clica "Salvar no Azure"
4. **API call**: `POST /parcels/{id}` com WKT
5. Backend salva no PostgreSQL + PostGIS

### Topógrafo valida:
1. Abre `/topografo/dashboard`
2. **API call**: `GET /projects/{id}/parcels`
3. Recebe geometrias em WKT
4. ViewMap renderiza com layers coloridas
5. Backend roda `ST_Overlaps` para detectar problemas

## 🚫 **O QUE NÃO USAR**

- ❌ **localhost** - Trava e é desnecessário
- ❌ **Mock data** - API real já funciona
- ❌ **npm run dev** local - Deploy direto no Azure

## ✅ **Workflow Recomendado**

```bash
# 1. Fazer mudanças no código
code apps/web/src/

# 2. Build
npx nx build web

# 3. Deploy (Azure Static Web Apps auto-deploya via GitHub)
git add .
git commit -m "feat: update map component"
git push

# Azure detecta push → build automático → deploy
```

## 🔐 **Autenticação**

```typescript
import apiClient from './services/api';

// Login
const response = await apiClient.login('user@example.com', 'senha123');

// Token é salvo automaticamente no localStorage
// Todas as próximas chamadas usam o token

// Logout
apiClient.logout();
```

## 📊 **Database Azure**

- **Server**: `psql-bemreal-ai1-4764.postgres.database.azure.com`
- **Database**: `ativoreal_geo`
- **PostGIS**: Habilitado
- **Tables**: `projects`, `parcels`, `users`, `neighbors`

## 🆘 **Troubleshooting**

### Erro: "Failed to fetch"
→ Verificar `VITE_AZURE_BACKEND_URL` no `.env`

### Erro: "Unauthorized"
→ Fazer login primeiro: `/login`

### Erro: "CORS"
→ Backend já configurado com CORS, verificar Azure Function settings

## 📖 **Docs Adicionais**

- Backend API: `novo-projeto/backend/README.md`
- Database Schema: `novo-projeto/database/init/01_schema.sql`
- Deploy Guide: `novo-projeto/DEPLOY_BACKEND_COMPLETO.ps1`
