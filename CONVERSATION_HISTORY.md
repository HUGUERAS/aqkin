# 📜 Histórico de Conversas e Diretrizes do Projeto

Este documento consolida as conversas e decisões importantes do projeto AtivoReal (aqkin) encontradas nos Pull Requests do GitHub.

---

## 🎯 Contexto do Projeto

O **AtivoReal** é um sistema geoespacial de gestão de propriedades desenvolvido como monorepo usando Nx, com:
- **Frontend**: React 19 + TypeScript + Vite + OpenLayers
- **Backend**: Python FastAPI + PostGIS (SIRGAS 2000 - SRID 4674)
- **Database**: Supabase PostgreSQL

---

## 📚 Pull Requests com Conversas Importantes

### PR #44 - Documentação Consolidada de Referência (10/02/2026)
**Título**: "Add consolidated reference documentation for project completion"
**Link**: https://github.com/HUGUERAS/aqkin/pull/44

**Contexto da Conversa Original**:
> "copilot eu preciso de algumas referências pra concluir esse trabalho"

**O Que Foi Criado**:
1. **REFERENCES.md** (21KB) - Referência central completa com:
   - Stack tecnológica (React 19, FastAPI, PostGIS)
   - 20+ endpoints da API
   - Schema com 14 tabelas
   - Workflows de desenvolvimento
   - Guias de testes (Vitest/pytest/Playwright)
   - Opções de deployment (Vercel/Railway/VPS)
   - Troubleshooting

2. **GUIA_RAPIDO.md** (6KB) - Referência rápida em português com:
   - Comandos mais usados
   - Variáveis de ambiente
   - Estrutura básica
   - Troubleshooting comum

3. **API_REFERENCE.md** (11KB) - Especificação completa da API com:
   - Exemplos de request/response
   - Todos os endpoints: auth, projetos, lotes, validação geométrica
   - Import/export (KML/Shapefile/GeoJSON)
   - AI chat
   - Integração SIGEF

**Review Comments Importantes** (21 comentários do code review):

#### 🔴 Problemas Críticos Identificados:
1. **SRID Incorreto na Documentação**: Documentação diz SRID 4326 (WGS 84), mas o banco usa SRID 4674 (SIRGAS 2000) - sistema geodésico oficial brasileiro exigido pelo INCRA
2. **URLs de Produção Expostas**: Hardcoded `https://xntxtdximacsdnldouxa.supabase.co` na documentação
3. **Endpoints em Inglês vs. Implementação em Português**: Docs usam `/projects`, `/parcels`, mas o backend real usa `/api/projetos`, `/api/lotes`
4. **Schema do Banco Diferente**: Docs descrevem tabelas em inglês (tenant, app_user, project, parcel), mas o banco usa português (projetos, lotes, pagamentos, perfis)

#### 📝 Inconsistências Documentadas:
- **Auth endpoints**: `/auth/login`, `/auth/logout` documentados não existem - auth é via Supabase
- **Geometry validation**: `/geometry/validate` não existe no backend real
- **Import/export paths**: Docs dizem `/import/kml` mas o real é `/api/import-export/import/kml`
- **SIGEF paths**: Docs em inglês (`/sigef/validate`) vs. real em português (`/api/sigef/validar`)
- **AI Chat**: Path `/ai/chat` não está registrado corretamente no router

---

### PR #41 - CAD/GIS Tools + AmCharts Fix (10/02/2026)
**Título**: "feat: Add AmCharts fix + CAD tools + Documentation cleanup"
**Link**: https://github.com/HUGUERAS/aqkin/pull/41

**Mudanças**:
- ✅ Fix de erros de build do Vite com aliasing do AmCharts5
- ✅ Adicionadas 43 ferramentas CAD/GIS para workflow de topógrafo
- ✅ Removidos 56 arquivos de documentação obsoletos
- Build time: 45.63s
- PWA: 755 entries (14.98 MB)

**Arquivos Alterados**: 199 arquivos
**Adições**: 23,592 linhas
**Deleções**: 24,255 linhas

---

### PR #34 - Feature CAD GIS Tools (10/02/2026)
**Título**: "Feature/cad gis tools"
**Link**: https://github.com/HUGUERAS/aqkin/pull/34

**Status**: Closed (não merged - substituído por PRs menores #35-#40)

**Context**: PR grande que foi dividido em sub-PRs menores:
- #35 - Fix race condition in AIChat message history
- #36 - security: Add rehype-sanitize to prevent XSS in AI markdown rendering
- #37 - Remove rehype-raw to fix XSS vulnerability
- #38 - Security: Add XSS protection to AI chat markdown rendering
- #39 - fix: address PR review comments - security and code quality improvements
- #40 - Fix security vulnerabilities and code quality issues from PR #34 review

**Review Focus**: Segurança XSS no chat AI, race conditions, e qualidade de código

---

## 🔐 Decisões de Segurança Importantes

### XSS Prevention (PRs #35-#38)
**Problema Identificado**: Renderização de markdown gerado por AI criava vulnerabilidades XSS

**Soluções Implementadas**:
1. Adicionado `rehype-sanitize` com allowlist explícita
2. Removido `rehype-raw` que permitia HTML bruto
3. Mantido apenas `rehype-highlight` para syntax highlighting seguro

**Memória Armazenada**:
- Sempre usar `rehype-sanitize` com `rehype-raw` quando renderizar markdown com HTML
- Aplicar sanitização entre plugins raw e highlighting
- Nunca usar `rehype-raw` com conteúdo gerado por usuário ou AI sem sanitização

### Race Conditions (PR #35)
**Problema**: Race condition no histórico de mensagens do AIChat

**Solução**: Uso de refs com useEffect para rastrear estado mais recente em callbacks async
```typescript
// Pattern implementado:
const messagesRef = useRef(messages);
useEffect(() => {
  messagesRef.current = messages;
}, [messages]);
// Usar messagesRef.current em callbacks async
```

---

## 🏗️ Arquitetura e Stack

### Frontend (apps/web)
```
React 19.0.0
TypeScript 5.9.2
Vite 7.0.0
React Router 6.30.3
OpenLayers 10.7.0
Supabase JS Client 2.93.3
Vitest 4.0.0
Tailwind CSS 3.4.17
```

### Backend (apps/api)
```
FastAPI 0.109.0
Python 3.11+
SQLAlchemy 2.0.25 (mencionado em docs mas não em requirements.txt)
GeoAlchemy2 0.14.3 (mencionado em docs mas não em requirements.txt)
Shapely 2.0.2
Supabase Python 2.3.4
Uvicorn (ASGI server)

Bibliotecas Geoespaciais (reais):
- fastkml
- pyshp
- fiona
- ezdxf
- gpxpy
- rasterio
- scipy
```

### Database
```
Supabase PostgreSQL
PostGIS (extensão geoespacial)
SRID 4674 (SIRGAS 2000) - Sistema geodésico brasileiro oficial
SRID 3857 (Web Mercator) para visualização
```

---

## 🗄️ Schema Real do Banco de Dados

**Tabelas em Português** (não inglês como nas docs antigas):
- `projetos` (não `project`)
- `lotes` (não `parcel`)
- `pagamentos` (não `payment`)
- `perfis` (não `profile`)

**Campos Importantes do Lotes**:
```sql
CREATE TABLE lotes (
  id UUID PRIMARY KEY,
  nome_cliente VARCHAR,
  email_cliente VARCHAR,
  cpf_cnpj_cliente VARCHAR,
  token_acesso VARCHAR,
  matricula VARCHAR,
  geom GEOMETRY(POLYGON, 4674),  -- SIRGAS 2000, não WGS 84!
  projeto_id UUID REFERENCES projetos(id),
  ...
);
```

**IMPORTANTE**: O banco usa **SRID 4674 (SIRGAS 2000)**, não 4326 (WGS 84)

---

## 🛣️ Endpoints Reais da API

Todos os endpoints usam **português** e prefixo `/api/`:

### Auth
- Não há endpoints `/auth/login`, `/auth/logout`
- Auth é via Supabase diretamente
- Endpoints disponíveis:
  - `/api/perfis/me` - Get current user profile
  - `/api/perfis/set-role` - Set user role

### Projetos
- `POST /api/projetos` - Criar projeto
- `GET /api/projetos` - Listar projetos
- `GET /api/projetos/{id}` - Detalhes do projeto
- `PUT /api/projetos/{id}` - Atualizar projeto
- `DELETE /api/projetos/{id}` - Deletar projeto

### Lotes (Parcelas)
- `POST /api/lotes` - Criar lote
- `GET /api/lotes` - Listar lotes
- `GET /api/lotes/{id}` - Detalhes do lote
- `PUT /api/lotes/{id}` - Atualizar lote
- `DELETE /api/lotes/{id}` - Deletar lote

### Import/Export
- `POST /api/import-export/import/kml` - Upload KML
- `POST /api/import-export/import/shapefile` - Upload Shapefile (ZIP)
- `POST /api/import-export/import/gpx` - Upload GPX
- `POST /api/import-export/export/dxf` - Export para DXF
- `POST /api/import-export/export/geojson` - Export para GeoJSON

### SIGEF (Sistema brasileiro de certificação)
- `POST /api/sigef/validar` - Validar área contra SIGEF
- `POST /api/sigef/memorial` - Gerar memorial descritivo
- `POST /api/sigef/vertices-sirgas` - Obter vértices em SIRGAS 2000

### AI Chat
- Endpoint AI existe mas path precisa ser verificado no router

---

## 🎓 Lições Aprendidas e Best Practices

### Convenções do Projeto
1. **Língua**: Backend e banco de dados em **português**, não inglês
2. **Coordinate System**: Usar **SRID 4674 (SIRGAS 2000)** para armazenamento (exigência INCRA)
3. **Coordinate Display**: Transformar para SRID 3857 (Web Mercator) apenas para visualização
4. **Import Paths**: Use relative imports `from services...` no backend (não absolute paths)
5. **Shapefile Handling**: Usar case-insensitive lookup para arquivos ZIP
6. **Geometry Handling**: Nunca acessar `geometry.coords` genericamente - usar branches por tipo (Point, LineString, Polygon)

### Segurança
1. **XSS Prevention**: Sempre sanitizar markdown com `rehype-sanitize`
2. **Secrets**: Nunca commitar arquivos `.env` - usar `.env.example`
3. **Module Imports**: Import optional dependencies no module scope com try/except
4. **Division Guards**: Sempre verificar denominador != 0
5. **Zero Division**: Usar lógica condicional ou tolerância absoluta para valores zero/near-zero

### Firewall (VPS Deployment)
- UFW deve permitir SSH (port 22) antes de enable
- Permitir HTTP (80) e HTTPS (443)
- **Port 8000 (API) nunca deve ser exposto** - apenas localhost via Nginx reverse proxy

---

## 📋 Checklist de Tarefas Pendentes

Com base nos review comments do PR #44:

- [ ] Corrigir SRID na documentação (4326 → 4674)
- [ ] Remover URLs de produção hardcoded da documentação
- [ ] Atualizar todos os endpoints da documentação para português
- [ ] Corrigir schema do banco na documentação (inglês → português)
- [ ] Criar `apps/web/.env.example` (referenciado mas não existe)
- [ ] Adicionar dependências faltantes na documentação (fastkml, pyshp, fiona, etc.)
- [ ] Verificar e documentar corretamente path do AI Chat endpoint
- [ ] Corrigir exemplos de curl para usar endpoints reais em português
- [ ] Atualizar versão do Nx na documentação (22.4.4 → 22.4.5)

---

## 📞 Onde Encontrar Mais Informações

### Documentação no Repositório
- **REFERENCES.md** - Guia completo de referências (⚠️ contém inconsistências)
- **GUIA_RAPIDO.md** - Referência rápida em português
- **API_REFERENCE.md** - Especificação da API (⚠️ contém inconsistências)
- **BACKEND_IMPLEMENTATION.md** - Detalhes da arquitetura
- **SUPABASE_SETUP.md** - Setup do banco
- **.github/copilot-instructions.md** - Instruções para GitHub Copilot
- **.github/instructions/** - Guias especializados (frontend, backend, testing)

### Pull Requests Importantes
- **PR #44**: https://github.com/HUGUERAS/aqkin/pull/44 - Documentação consolidada
- **PR #41**: https://github.com/HUGUERAS/aqkin/pull/41 - CAD Tools + AmCharts fix
- **PR #34**: https://github.com/HUGUERAS/aqkin/pull/34 - Feature CAD/GIS Tools (dividido em sub-PRs)
- **PRs #35-#40**: Security fixes derivados do PR #34

### Código Fonte Real
Para informações precisas, sempre verificar:
- `apps/api/main.py` - Configuração dos routers
- `apps/api/routers/` - Endpoints reais da API
- `database/init/01_schema.sql` - Schema real do banco
- `apps/api/requirements.txt` - Dependências reais do Python

---

## 🔄 Última Atualização

**Data**: 17/02/2026
**Mantido por**: Copilot Agent
**Versão**: 1.0

---

## ⚠️ Notas Importantes

1. **Conversas do GitHub Copilot não são persistidas** - Este documento foi reconstruído a partir de Pull Requests
2. **Documentação desatualizada** - REFERENCES.md, API_REFERENCE.md e GUIA_RAPIDO.md contêm inconsistências com o código real
3. **Consulte sempre o código fonte** para informações precisas sobre endpoints, schema e dependências
4. **SRID Crítico**: Projeto usa SIRGAS 2000 (4674), não WGS 84 (4326) - exigência regulatória brasileira

---

## 🎯 Próximos Passos Sugeridos

1. Atualizar toda documentação para refletir:
   - Endpoints reais em português
   - SRID correto (4674)
   - Schema real do banco
   - Dependências corretas

2. Criar script de validação que compara:
   - Docs vs. routers reais
   - Docs vs. schema real
   - Docs vs. requirements.txt real

3. Adicionar testes que verifiquem:
   - Endpoints documentados existem
   - Schemas documentados correspondem ao banco
   - SRID usado é consistente em todo o código

---

*Para sugestões de melhoria desta documentação, abra uma issue no GitHub.*
