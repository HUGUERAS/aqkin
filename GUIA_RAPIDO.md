# 🚀 Guia Rápido - AtivoReal

**Para quem está começando e precisa de referências rápidas**

## 📌 Links Essenciais

- **Documentação Completa**: [REFERENCES.md](./REFERENCES.md)
- **Setup do Banco**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Implementação Backend**: [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md)
- **Deploy**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

## ⚡ Comandos Mais Usados

### Iniciar Desenvolvimento
```bash
# Frontend (porta 4200)
npx nx serve web

# Backend (porta 8000)
cd apps/api && python -m uvicorn main:app --reload
```

### Testes
```bash
# Frontend
npx nx test web
npx nx test web --coverage

# Backend
cd apps/api && pytest
cd apps/api && pytest --cov
```

### Build
```bash
# Frontend
npx nx build web

# Backend
npx nx build api
```

### Qualidade de Código
```bash
# Frontend
npx nx lint web
npx nx typecheck web

# Backend
cd apps/api && black .
cd apps/api && flake8 . --max-line-length=120
```

## 🏗️ Estrutura Básica

```
aqkin/
├── apps/
│   ├── api/          # Backend FastAPI Python
│   │   ├── routers/  # Endpoints da API
│   │   ├── services/ # Lógica de negócio
│   │   ├── main.py   # Aplicação principal
│   │   └── models.py # Modelos do banco
│   │
│   └── web/          # Frontend React + TypeScript
│       └── src/
│           ├── components/  # Componentes UI
│           ├── pages/       # Páginas
│           └── hooks/       # Custom hooks
│
├── .github/instructions/   # Guias especializados
├── database/              # Migrations SQL
└── scripts/              # Scripts de deploy
```

## 🔑 Variáveis de Ambiente

### Frontend (apps/web/.env)
```env
VITE_SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
VITE_API_URL=http://localhost:8000
```

### Backend (apps/api/.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/database
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_SERVICE_KEY=seu_service_key_aqui
JWT_SECRET=seu_secret_seguro_aqui
```

## 📍 Principais Endpoints

```
GET    /health                         # Status da API
POST   /auth/login                     # Login
GET    /projects                       # Listar projetos
POST   /projects                       # Criar projeto
POST   /geometry/validate              # Validar geometria
POST   /import/kml                     # Upload KML
GET    /export/geojson/{project_id}   # Download GeoJSON
POST   /ai/chat                        # Chat com IA
```

## 🗄️ Tabelas Principais do Banco

```
tenant          # Empresas (multi-tenancy)
app_user        # Usuários (TOPOGRAFO, PROPRIETARIO)
project         # Projetos topográficos
parcel          # Parcelas/Lotes com geometrias
sigef_certified # Geometrias certificadas INCRA
validation_event # Histórico de validações
```

## 🧪 Exemplo de Teste

### Frontend (Vitest)
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Backend (pytest)
```python
def test_create_project(client):
    response = client.post("/projects", json={
        "name": "Test", 
        "description": "Test"
    })
    assert response.status_code == 201
    assert response.json()["name"] == "Test"
```

## 🚀 Deploy Rápido

### Vercel (Frontend)
```bash
npm i -g vercel
cd apps/web
vercel
```

### Railway (Backend)
```bash
npm i -g @railway/cli
cd apps/api
railway login
railway up
```

## 🔧 Troubleshooting Rápido

### Problema: Dependências não instalam
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: Backend não conecta
```bash
# Verificar .env
cd apps/api && cat .env

# Testar conexão Supabase
python -c "from supabase import create_client; print('OK')"
```

### Problema: CORS errors
Verifique em `apps/api/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problema: Testes falhando
```bash
# Limpar cache
npx nx test web --clearCache
cd apps/api && pytest --cache-clear
```

## 📚 Onde Buscar Mais Informações

1. **Documentação Detalhada**: [REFERENCES.md](./REFERENCES.md)
2. **Instruções Frontend**: [.github/instructions/frontend.instructions.md](./.github/instructions/frontend.instructions.md)
3. **Instruções Backend**: [.github/instructions/backend.instructions.md](./.github/instructions/backend.instructions.md)
4. **Instruções de Testes**: [.github/instructions/testing.instructions.md](./.github/instructions/testing.instructions.md)
5. **API Docs**: http://localhost:8000/docs (com o backend rodando)

## ✅ Checklist de Início

- [ ] Clonar repositório
- [ ] Instalar dependências (`npm install`)
- [ ] Configurar Python (`cd apps/api && pip install -r requirements.txt`)
- [ ] Copiar `.env.example` para `.env` (frontend e backend)
- [ ] Configurar variáveis de ambiente
- [ ] Iniciar frontend (`npx nx serve web`)
- [ ] Iniciar backend (`cd apps/api && uvicorn main:app --reload`)
- [ ] Acessar http://localhost:4200
- [ ] Verificar API docs em http://localhost:8000/docs

## 🎯 Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Vite + OpenLayers + Tailwind
- **Backend**: FastAPI + Python + SQLAlchemy + GeoAlchemy2
- **Database**: Supabase PostgreSQL + PostGIS
- **Tests**: Vitest + Playwright + pytest
- **Monorepo**: Nx 22.4

## 📞 Precisa de Ajuda?

1. Leia [REFERENCES.md](./REFERENCES.md) primeiro
2. Verifique [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) para detalhes da API
3. Consulte os logs da aplicação
4. Abra uma issue no GitHub com detalhes do problema

---

**Última atualização**: 2026-02-10  
**Versão**: 1.0

Para documentação completa e detalhada, veja [REFERENCES.md](./REFERENCES.md)
