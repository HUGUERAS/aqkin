# 📚 Referências do Projeto AtivoReal

Este documento consolida todas as referências importantes para concluir o trabalho no projeto AtivoReal - um sistema de gestão de propriedades geoespaciais.

## 📖 Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Arquitetura e Stack Tecnológica](#arquitetura-e-stack-tecnológica)
3. [Estrutura do Monorepo](#estrutura-do-monorepo)
4. [Documentação Principal](#documentação-principal)
5. [Como Começar](#como-começar)
6. [Comandos Essenciais](#comandos-essenciais)
7. [Endpoints da API](#endpoints-da-api)
8. [Schema do Banco de Dados](#schema-do-banco-de-dados)
9. [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
10. [Testes](#testes)
11. [Deploy](#deploy)
12. [Troubleshooting](#troubleshooting)
13. [Recursos Externos](#recursos-externos)

---

## 🎯 Visão Geral do Projeto

**AtivoReal** é um sistema geoespacial de gestão de propriedades desenvolvido como monorepo usando Nx, com:

- **Frontend**: React 19 + TypeScript + Vite + OpenLayers
- **Backend**: Python FastAPI + PostGIS
- **Database**: Supabase PostgreSQL com extensão PostGIS
- **Objetivo**: Gerenciar projetos topográficos, parcelas de terra, validação de geometrias e detecção de sobreposições

### Principais Funcionalidades

1. **Gestão de Projetos e Parcelas**: CRUD completo com multi-tenancy
2. **Desenho de Geometrias**: Interface de mapa interativo com OpenLayers
3. **Validação Geoespacial**: Detecção de sobreposições com SIGEF (INCRA)
4. **Autenticação**: JWT com roles (TOPOGRAFO, PROPRIETARIO)
5. **Processamento de Arquivos**: Import/Export de KML, Shapefile, GeoJSON
6. **AI Chat**: Assistente com Anthropic Claude

---

## 🏗️ Arquitetura e Stack Tecnológica

### Frontend (apps/web)
```
React 19.0.0
TypeScript 5.9.2
Vite 7.0.0 (build tool)
React Router 6.30.3 (navegação)
OpenLayers 10.7.0 (mapas)
Supabase JS Client 2.93.3
Vitest 4.0.0 (testes)
Tailwind CSS 3.4.17
```

### Backend (apps/api)
```
FastAPI 0.109.0
Python 3.11+
SQLAlchemy 2.0.25 (ORM)
GeoAlchemy2 0.14.3 (PostGIS)
Shapely 2.0.2 (geometrias)
Supabase Python 2.3.4
Uvicorn (ASGI server)
python-jose (JWT)
```

### Database
```
Supabase PostgreSQL
PostGIS (extensão geoespacial)
SRID 4326 (WGS 84) para armazenamento
SRID 3857 (Web Mercator) para visualização
```

### DevOps
```
Nx 22.4.5 (monorepo)
Docker + Docker Compose
GitHub Actions (CI/CD)
Playwright (E2E tests)
```

---

## 📁 Estrutura do Monorepo

```
aqkin/
├── apps/
│   ├── api/                    # Backend FastAPI
│   │   ├── routers/           # Endpoints REST
│   │   ├── services/          # Lógica de negócio
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── main.py            # Aplicação principal
│   │   └── requirements.txt   # Dependências Python
│   │
│   ├── web/                   # Frontend React
│   │   ├── src/
│   │   │   ├── components/   # Componentes reutilizáveis
│   │   │   ├── pages/        # Páginas (Cliente, Topografo)
│   │   │   ├── hooks/        # Custom hooks
│   │   │   └── utils/        # Utilitários
│   │   └── .env.example      # Variáveis de ambiente
│   │
│   └── web-e2e/              # Testes E2E Playwright
│
├── database/                  # SQL migrations
├── scripts/                   # Scripts de deploy
├── .github/
│   └── instructions/         # Instruções Copilot
│       ├── frontend.instructions.md
│       ├── backend.instructions.md
│       └── testing.instructions.md
│
├── README.md                 # Início rápido
├── SUPABASE_SETUP.md         # Setup do banco
├── BACKEND_IMPLEMENTATION.md # Detalhes da API
├── DEPLOY_GUIDE.md           # Guia de deploy
└── package.json              # Dependências raiz
```

---

## 📚 Documentação Principal

### Documentos Essenciais

| Arquivo | Propósito |
|---------|-----------|
| [README.md](./README.md) | Guia de início rápido e overview |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Configuração do banco de dados |
| [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) | Detalhes da API e arquitetura |
| [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) | Instruções de deploy (Railway, Vercel, VPS) |
| [SECURITY.md](./SECURITY.md) | Políticas de segurança |
| [.github/instructions/](/.github/instructions/) | Guias especializados (Frontend, Backend, Testing) |

### Documentação da API

- **Swagger UI**: `http://localhost:8000/docs` (quando o backend estiver rodando)
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

---

## 🚀 Como Começar

### Pré-requisitos

```bash
Node.js 20+
Python 3.11+
npm ou yarn
Git
```

### 1. Clonar e Instalar

```bash
# Clone o repositório
git clone https://github.com/HUGUERAS/aqkin.git
cd aqkin

# Instale as dependências do monorepo
npm install

# Configure Python para o backend
cd apps/api
pip install -r requirements.txt
cd ../..
```

### 2. Configurar Ambiente

```bash
# Frontend
cp apps/web/.env.example apps/web/.env
# Edite apps/web/.env com suas credenciais Supabase

# Backend
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env com DATABASE_URL e secrets
```

**Variáveis Essenciais:**

```env
# Frontend (apps/web/.env)
VITE_SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key
VITE_API_URL=http://localhost:8000

# Backend (apps/api/.env)
DATABASE_URL=postgresql://user:pass@host:port/dbname
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_SERVICE_KEY=seu_service_key
JWT_SECRET=seu_secret_seguro
```

### 3. Iniciar Desenvolvimento

```bash
# Terminal 1: Frontend (porta 4200)
npx nx serve web

# Terminal 2: Backend (porta 8000)
npx nx serve api

# Ou com Python direto:
cd apps/api
python -m uvicorn main:app --reload --port 8000
```

### 4. Acessar

- Frontend: http://localhost:4200
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## ⚡ Comandos Essenciais

### Monorepo (Nx)

```bash
# Ver todos os projetos
npx nx show projects

# Ver targets disponíveis para um projeto
npx nx show project web

# Visualizar grafo de dependências
npx nx graph
```

### Frontend

```bash
# Desenvolvimento
npx nx serve web                    # Dev server (port 4200)

# Build
npx nx build web                    # Build produção

# Testes
npx nx test web                     # Unit tests (Vitest)
npx nx test web --coverage          # Com coverage
npx nx e2e web-e2e                  # E2E tests (Playwright)

# Qualidade
npx nx lint web                     # ESLint
npx nx typecheck web                # TypeScript check
```

### Backend

```bash
# Desenvolvimento
npx nx serve api                    # Via Nx
cd apps/api && python -m uvicorn main:app --reload  # Direto

# Build
npx nx build api

# Testes
cd apps/api && pytest               # Python tests
cd apps/api && pytest --cov         # Com coverage

# Qualidade
cd apps/api && black .              # Format Python
cd apps/api && flake8 . --max-line-length=120 --extend-ignore=E203,W503
```

### Database

```bash
# Migrations (Alembic)
cd apps/api
alembic revision --autogenerate -m "descrição"
alembic upgrade head
alembic downgrade -1

# Conectar ao banco Supabase
psql "postgresql://postgres.xntxtdximacsdnldouxa:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

---

## 🔌 Endpoints da API

### Autenticação

```http
POST   /auth/login                    # Login (retorna JWT)
POST   /auth/logout                   # Logout
POST   /auth/invite/{project_id}      # Criar link de convite
```

### Projetos

```http
GET    /projects                      # Listar projetos
POST   /projects                      # Criar projeto (TOPOGRAFO)
GET    /projects/{project_id}         # Detalhes do projeto
PUT    /projects/{project_id}         # Atualizar projeto
DELETE /projects/{project_id}         # Deletar projeto
```

### Parcelas (Lotes)

```http
GET    /projects/{project_id}/parcels              # Listar parcelas
POST   /projects/{project_id}/parcels              # Criar parcela
GET    /projects/{project_id}/parcels/{parcel_id}  # Detalhes
PUT    /projects/{project_id}/parcels/{parcel_id}  # Atualizar
DELETE /projects/{project_id}/parcels/{parcel_id}  # Deletar
```

### Validação Geométrica

```http
POST   /geometry/validate             # Validar geometria completa
                                      # (área, sobreposição SIGEF, vizinhos)
```

### Import/Export

```http
POST   /import/kml                    # Upload KML
POST   /import/shapefile              # Upload Shapefile (ZIP)
POST   /import/geojson                # Upload GeoJSON
GET    /export/kml/{project_id}       # Download KML
GET    /export/shapefile/{project_id} # Download Shapefile
GET    /export/geojson/{project_id}   # Download GeoJSON
```

### AI Chat

```http
POST   /ai/chat                       # Enviar mensagem para Claude
```

### SIGEF

```http
POST   /sigef/validate                # Validar área contra SIGEF
GET    /sigef/search                  # Buscar certificações
POST   /sigef/memorial                # Gerar memorial descritivo
```

### Health Check

```http
GET    /health                        # Status da API
GET    /                              # Info da API
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

#### `tenant`
Multi-tenancy (uma empresa topógrafo = um tenant)
```sql
- id: UUID
- name: VARCHAR
- email: VARCHAR
- created_at: TIMESTAMP
```

#### `app_user`
Usuários (TOPOGRAFO ou PROPRIETARIO)
```sql
- id: UUID
- tenant_id: UUID (FK)
- email: VARCHAR
- password_hash: VARCHAR
- role: ENUM (TOPOGRAFO, PROPRIETARIO)
- created_at: TIMESTAMP
```

#### `project`
Projetos topográficos
```sql
- id: UUID
- tenant_id: UUID (FK)
- owner_topografo_id: UUID (FK)
- name: VARCHAR
- description: TEXT
- status: ENUM
- created_at: TIMESTAMP
```

#### `parcel` (Parcela/Lote)
Propriedades individuais com geometrias
```sql
- id: UUID
- project_id: UUID (FK)
- name: VARCHAR
- geom_client_sketch: GEOMETRY(POLYGON, 4326)  # Rascunho do cliente
- geom_official: GEOMETRY(POLYGON, 4326)       # Geometria oficial
- sketch_status: ENUM
- parcel_status: ENUM
- area_m2: DECIMAL
- perimeter_m: DECIMAL
- created_at: TIMESTAMP
```

#### `sigef_certified`
Geometrias certificadas pelo INCRA
```sql
- id: SERIAL
- codigo_imovel: VARCHAR
- owner: VARCHAR
- geom: GEOMETRY(POLYGON, 4326)
- certification_date: DATE
- area_ha: DECIMAL
```

#### `validation_event`
Histórico de validações (audit log)
```sql
- id: UUID
- parcel_id: UUID (FK)
- validation_type: ENUM
- result: ENUM (OK, WARN, FAIL)
- severity: ENUM
- details: JSONB
- created_at: TIMESTAMP
```

### Relacionamentos

```
tenant (1) ─── (N) app_user
tenant (1) ─── (N) project
project (1) ─── (N) parcel
parcel (1) ─── (N) validation_event
parcel (1) ─── (N) document
```

### Índices Espaciais

```sql
-- PostGIS GIST index para queries espaciais
CREATE INDEX idx_parcel_geom_official ON parcel USING GIST(geom_official);
CREATE INDEX idx_parcel_geom_sketch ON parcel USING GIST(geom_client_sketch);
CREATE INDEX idx_sigef_geom ON sigef_certified USING GIST(geom);
```

---

## 🔄 Fluxo de Desenvolvimento

### 1. Criar Feature Branch

```bash
git checkout -b feature/nome-da-feature
```

### 2. Desenvolver

```bash
# Fazer mudanças
code .

# Testar localmente
npx nx test web
npx nx lint web

cd apps/api && pytest
```

### 3. Commit (Conventional Commits)

```bash
git add .
git commit -m "feat(web): adicionar filtro de projetos"
# ou
git commit -m "fix(api): corrigir validação de geometria"
```

**Tipos de commit:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### 4. Push e Pull Request

```bash
git push origin feature/nome-da-feature

# Criar PR no GitHub
# Aguardar CI passar (lint, tests, build)
# Solicitar review
# Merge
```

---

## 🧪 Testes

### Frontend (Vitest + React Testing Library)

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

**Rodar testes:**
```bash
npx nx test web                # Unit tests
npx nx test web --coverage     # Com coverage
npx nx test web --watch        # Watch mode
npx nx e2e web-e2e            # E2E tests
```

### Backend (pytest)

```python
# API test example
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_create_project(client):
    response = client.post(
        "/projects",
        json={"name": "Test Project", "description": "Test"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
```

**Rodar testes:**
```bash
cd apps/api
pytest                         # Todos os testes
pytest --cov                   # Com coverage
pytest tests/test_geometry.py  # Arquivo específico
pytest -v                      # Verbose
```

### E2E (Playwright)

```typescript
// E2E test example
import { test, expect } from '@playwright/test';

test('should create a new project', async ({ page }) => {
  await page.goto('http://localhost:4200/projects');
  await page.click('button:has-text("New Project")');
  await page.fill('input[name="name"]', 'Test Project');
  await page.click('button[type="submit"]');
  await expect(page.locator('h1')).toContainText('Test Project');
});
```

**Rodar testes:**
```bash
npx nx e2e web-e2e             # Headless
npx nx e2e web-e2e --headed    # Com browser visível
npx nx e2e web-e2e --ui        # UI interativa
```

---

## 🚀 Deploy

### Opções de Deploy

| Componente | Opção 1 | Opção 2 | Opção 3 |
|------------|---------|---------|---------|
| Frontend | Vercel | Netlify | Hostinger VPS |
| Backend | Railway | Render | Hostinger VPS |
| Database | Supabase | - | - |

### Deploy Frontend (Vercel)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
cd apps/web
vercel

# Configurar variáveis no dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_API_URL
```

### Deploy Backend (Railway)

```bash
# Instalar CLI
npm i -g @railway/cli

# Deploy
cd apps/api
railway login
railway init
railway up

# Adicionar variáveis no dashboard:
# DATABASE_URL
# SUPABASE_URL
# SUPABASE_SERVICE_KEY
# JWT_SECRET
```

### Deploy em VPS (Hostinger)

Ver guia completo em [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

**Resumo:**
```bash
# SSH no servidor
ssh root@seu-ip

# Instalar dependências
apt update && apt install python3 python3-pip nginx certbot git -y

# Clone e setup
cd /var/www
git clone https://github.com/HUGUERAS/aqkin.git
cd aqkin

# Frontend build
cd apps/web
npm install
npm run build

# Backend setup
cd ../api
pip3 install -r requirements.txt

# Configurar Nginx + systemd
# Ver DEPLOY_GUIDE.md para detalhes
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro ao instalar dependências

```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Python
cd apps/api
rm -rf __pycache__
pip install -r requirements.txt --force-reinstall
```

#### 2. Backend não conecta ao Supabase

```bash
# Verificar variáveis
cd apps/api
cat .env | grep SUPABASE

# Testar conexão
python -c "from supabase import create_client; client = create_client('URL', 'KEY'); print(client)"
```

#### 3. PostGIS não funciona

```sql
-- No Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_version();

-- Verificar SRID
SELECT ST_SRID(geom_official) FROM parcel LIMIT 1;
```

#### 4. CORS errors no frontend

No backend (`apps/api/main.py`):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Dev
    # allow_origins=["*"],  # Produção (restringir)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 5. Testes falhando

```bash
# Frontend
rm -rf apps/web/node_modules/.vite
npx nx test web --clearCache

# Backend
cd apps/api
pytest --cache-clear
```

#### 6. Build falhando

```bash
# TypeScript errors
npx nx typecheck web

# ESLint errors
npx nx lint web --fix

# Python errors
cd apps/api && black . && flake8 .
```

---

## 🌐 Recursos Externos

### Documentação Oficial

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Nx**: https://nx.dev/getting-started/intro
- **OpenLayers**: https://openlayers.org/en/latest/doc/
- **Supabase**: https://supabase.com/docs
- **PostGIS**: https://postgis.net/documentation/

### Tutoriais Relevantes

- **Nx React Monorepo**: https://nx.dev/getting-started/tutorials/react-monorepo-tutorial
- **FastAPI Tutorial**: https://fastapi.tiangolo.com/tutorial/
- **OpenLayers Tutorial**: https://openlayers.org/en/latest/doc/tutorials/
- **PostGIS Tutorial**: https://postgis.net/workshops/postgis-intro/

### APIs e Serviços

- **Supabase Dashboard**: https://app.supabase.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **SIGEF (INCRA)**: https://sigef.incra.gov.br/

### Ferramentas de Desenvolvimento

- **VS Code**: https://code.visualstudio.com/
- **Insomnia/Postman**: Para testar API
- **DBeaver**: Cliente SQL para PostgreSQL
- **QGIS**: Visualizar geometrias PostGIS

---

## 📞 Suporte

### Onde Buscar Ajuda

1. **Documentação do Projeto**: Leia os arquivos .md neste repositório
2. **Issues do GitHub**: Verifique issues abertas
3. **Logs da Aplicação**: 
   - Frontend: Console do navegador (F12)
   - Backend: Logs do uvicorn/railway
4. **Supabase Dashboard**: Verificar logs e queries

### Boas Práticas ao Buscar Ajuda

1. **Descreva o problema**: O que você esperava vs o que aconteceu
2. **Inclua logs**: Copie mensagens de erro completas
3. **Ambiente**: Especifique (dev/prod, OS, versões)
4. **Passos para reproduzir**: Liste o que você fez antes do erro
5. **O que já tentou**: Mencione soluções que não funcionaram

---

## ✅ Checklist de Conclusão de Trabalho

Use esta checklist para garantir que seu trabalho está completo:

### Desenvolvimento
- [ ] Código implementado e testado localmente
- [ ] Testes unitários escritos e passando
- [ ] Linting sem erros
- [ ] TypeScript sem erros de tipo
- [ ] Documentação atualizada (se necessário)

### Qualidade
- [ ] Code review feito (ou solicitado)
- [ ] Testes E2E passando (se relevante)
- [ ] Sem vulnerabilidades de segurança
- [ ] Performance adequada

### Deploy
- [ ] Build de produção funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations do banco aplicadas (se houver)
- [ ] Testado em ambiente de staging

### Documentação
- [ ] Commit messages seguem convenção
- [ ] PR com descrição clara
- [ ] README atualizado (se necessário)
- [ ] Changelog atualizado (se houver)

---

## 🎓 Próximos Passos Sugeridos

Baseado no estado atual do projeto:

1. **Implementação Pendente** (ver BACKEND_IMPLEMENTATION.md):
   - Endpoints de contratos
   - Endpoints de pagamento
   - Endpoints de milestones
   - Upload de documentos para S3

2. **Frontend Pendente**:
   - Wizard completo do cliente (5 steps)
   - Dashboard do topógrafo
   - Ferramentas CAD para edição de geometrias
   - Visualização de histórico de validações

3. **DevOps**:
   - CI/CD pipeline completo
   - Monitoramento e alertas
   - Backups automáticos
   - Testes de carga

4. **Melhorias**:
   - Performance optimization
   - Acessibilidade (WCAG)
   - Internacionalização (i18n)
   - PWA features

---

**Última atualização**: 2026-02-10  
**Versão do Documento**: 1.0  
**Mantido por**: Equipe AtivoReal

Para sugestões de melhoria desta documentação, abra uma issue no GitHub.
