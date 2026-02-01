# 🚀 O QUE FALTA PARA FAZER O DEPLOY DESSE BRANCH

## ✅ O QUE JÁ FOI CONFIGURADO

### Infraestrutura de CI/CD
- ✅ GitHub Actions workflows criados
- ✅ Pipeline de CI para testes e linting
- ✅ Pipeline de deploy do backend (Azure Functions)
- ✅ Pipeline de deploy do frontend (Vercel)
- ✅ Pipeline alternativo (Railway/Render)

### Documentação
- ✅ Guia completo de configuração (DEPLOYMENT_CONFIG.md)
- ✅ Guia rápido (DEPLOYMENT_QUICKSTART.md)
- ✅ Checklist de progresso (DEPLOYMENT_CHECKLIST.md)
- ✅ Template de secrets (.github/SECRETS_TEMPLATE.md)
- ✅ README atualizado com links

### Código
- ✅ Backend Python FastAPI pronto
- ✅ Frontend React pronto
- ✅ Configurações de ambiente (.env)
- ✅ .gitignore atualizado

---

## ⚠️ O QUE FALTA FAZER (AÇÕES NECESSÁRIAS)

### 1️⃣ CONFIGURAR AZURE (Backend)

#### a) Criar/Verificar Azure Function App
```bash
# Verificar se já existe
az functionapp list --resource-group ativo-real-rg -o table

# OU criar novo
az functionapp create \
  --name ativo-real-api-593 \
  --resource-group ativo-real-rg \
  --consumption-plan-location eastus2 \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --os-type linux
```

#### b) Baixar Publish Profile
1. Ir para Azure Portal: https://portal.azure.com
2. Abrir Function App → ativo-real-api-593
3. Clicar em "Get publish profile"
4. Salvar o arquivo XML

### 2️⃣ CONFIGURAR SUPABASE (Database)

#### a) Criar Projeto Supabase
1. Ir para https://supabase.com
2. Criar novo projeto (se ainda não existe)
3. Anotar:
   - URL do projeto
   - Service Role Key
   - Connection String

#### b) Habilitar PostGIS
```sql
-- No Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
```

#### c) Criar Schema (se necessário)
- Executar o SQL de `database/init/01_schema.sql` no SQL Editor
- OU usar o script de migração em `scripts/migrate-azure-to-supabase.py`

### 3️⃣ CONFIGURAR VERCEL (Frontend)

#### a) Instalar CLI e Fazer Login
```bash
npm i -g vercel
vercel login
```

#### b) Linkar Projeto
```bash
cd apps/web
vercel
# Seguir prompts para criar/linkar projeto
```

#### c) Obter Credentials
```bash
# IDs estarão em .vercel/project.json
cat .vercel/project.json
```

#### d) Criar Token
1. Ir para https://vercel.com/account/tokens
2. Criar novo token
3. Copiar token

### 4️⃣ CONFIGURAR GITHUB SECRETS

**Importante:** Todos os 12 secrets devem ser configurados!

#### Como Adicionar Secrets
1. Ir para o repositório no GitHub (Settings)
2. Clicar em **Settings**
3. Clicar em **Secrets and variables** → **Actions**
4. Clicar em **New repository secret**
5. Adicionar cada secret abaixo

#### Secrets do Backend (8)

```bash
# 1. Nome do Function App
AZURE_FUNCTION_APP_NAME=ativo-real-api-593

# 2. Resource Group
AZURE_RESOURCE_GROUP=ativo-real-rg

# 3. Publish Profile (conteúdo do XML baixado)
AZURE_FUNCTION_APP_PUBLISH_PROFILE=<colar-xml-aqui>

# 4. Database URL (de Supabase Settings → Database)
DATABASE_URL=postgresql://postgres.[ref]:[senha]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# 5. JWT Secret (gerar novo)
JWT_SECRET=$(openssl rand -base64 32)

# 6. Supabase URL (de Supabase Settings → API)
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co

# 7. Supabase Service Key (de Supabase Settings → API → service_role)
SUPABASE_SERVICE_KEY=eyJhbGci...

# 8. (Opcional) OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-...
```

#### Secrets do Frontend (4)

```bash
# 1. Vercel Token (de https://vercel.com/account/tokens)
VERCEL_TOKEN=<seu-token>

# 2. Organization ID (de .vercel/project.json)
VERCEL_ORG_ID=<seu-org-id>

# 3. Project ID (de .vercel/project.json)
VERCEL_PROJECT_ID=<seu-project-id>

# 4. URL do Backend (após deploy do backend)
VITE_AZURE_BACKEND_URL=https://ativo-real-api-593.azurewebsites.net/api
```

### 5️⃣ FAZER O DEPLOY

Depois de configurar todos os secrets:

```bash
# Commit e push para trigger deploy
git add .
git commit -m "Configure deployment secrets"
git push origin main
```

### 6️⃣ VERIFICAR DEPLOY

#### a) Monitorar GitHub Actions
1. Ir para https://github.com/HUGUERAS/aqkin/actions
2. Ver status dos workflows
3. Verificar logs se houver erro

#### b) Testar Backend
```bash
# Health check
curl https://ativo-real-api-593.azurewebsites.net/

# API endpoint
curl https://ativo-real-api-593.azurewebsites.net/api/projetos
```

#### c) Testar Frontend
1. Abrir URL do Vercel (mostrado nos logs do workflow)
2. Verificar console do browser por erros
3. Testar funcionalidades

---

## 📊 RESUMO DE AÇÕES

| # | Ação | Status | Onde Fazer |
|---|------|--------|------------|
| 1 | Verificar/criar Azure Function App | ⚠️ FAZER | Azure Portal |
| 2 | Baixar publish profile | ⚠️ FAZER | Azure Portal |
| 3 | Criar projeto Supabase | ⚠️ FAZER | supabase.com |
| 4 | Habilitar PostGIS | ⚠️ FAZER | Supabase SQL Editor |
| 5 | Configurar Vercel | ⚠️ FAZER | Terminal + vercel.com |
| 6 | Adicionar 12 GitHub Secrets | ⚠️ FAZER | GitHub Settings |
| 7 | Push para main | ⚠️ FAZER | Terminal |
| 8 | Verificar deploy | ⚠️ FAZER | GitHub Actions |

---

## 📖 DOCUMENTAÇÃO DISPONÍVEL

1. **[DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md)** - Guia completo passo a passo
2. **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** - Referência rápida
3. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist interativo
4. **[.github/SECRETS_TEMPLATE.md](./.github/SECRETS_TEMPLATE.md)** - Template de secrets
5. **[STATUS_DEPLOY.md](./STATUS_DEPLOY.md)** - Status atual (pode estar desatualizado)

---

## 🔧 FERRAMENTAS NECESSÁRIAS

```bash
# Instalar Azure CLI (se necessário)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Instalar Vercel CLI
npm i -g vercel

# Login no Azure
az login

# Login no Vercel
vercel login
```

---

## 💡 DICAS

1. **Use DEPLOYMENT_CHECKLIST.md** para marcar seu progresso
2. **Comece pelo backend** (Azure + Supabase) antes do frontend
3. **Gere o JWT_SECRET** com: `openssl rand -base64 32`
4. **Teste localmente** antes de fazer deploy:
   ```bash
   # Backend
   cd apps/api
   uvicorn main:app --reload
   
   # Frontend
   npx nx serve web
   ```

---

## ⏱️ TEMPO ESTIMADO

- **Configuração Azure**: 10-15 minutos
- **Configuração Supabase**: 5-10 minutos
- **Configuração Vercel**: 5 minutos
- **Adicionar GitHub Secrets**: 10 minutos
- **Deploy e testes**: 10-15 minutos

**Total**: ~40-55 minutos

---

## 🆘 PRECISA DE AJUDA?

1. **Erros no deploy**: Verificar logs em GitHub Actions
2. **Backend não responde**: Verificar logs do Azure Function
3. **Frontend não conecta**: Verificar CORS e URL do backend
4. **Database não conecta**: Testar connection string com `psql`

---

## ✅ CONCLUSÃO

Tudo está pronto para o deploy! Só falta:
1. ⚠️ Configurar os recursos (Azure, Supabase, Vercel)
2. ⚠️ Adicionar os 12 GitHub Secrets
3. ✅ Push para main (workflows já configurados!)

**Próximo passo**: Siga o [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) para começar!
