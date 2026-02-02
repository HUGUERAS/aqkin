# Setup MVP Ativo Real

## 1. Banco de Dados (Supabase)

Execute as migrações no Supabase Dashboard > SQL Editor (na ordem):

1. `database/init/01_schema.sql`
2. `database/init/02_extensions.sql`

Ou use o script (requer RPC `exec` configurado):

```bash
node scripts/run-migration.js
```

## 2. API (FastAPI)

```bash
cd apps/api
pip install -r requirements.txt
# Configure .env com SUPABASE_URL e SUPABASE_SERVICE_KEY
uvicorn main:app --reload --port 8000
```

## 3. Web (Vite/React)

```bash
# Raiz do projeto
npm install
npx nx serve web
```

Configure `apps/web/.env` (VITE_API_URL é **obrigatório**, use URL real do deploy):

```
VITE_API_URL=https://sua-api.exemplo.com
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 4. Fluxo de Uso

1. **Topógrafo** acessa `/topografo` → cria projeto → cria lote → copia link `/cliente/desenhar?token=UUID` ou `?lote=ID`
2. **Cliente** acessa o link → desenha área → valida topologia em tempo real → salva
3. **Topógrafo** vê desenhos no Dashboard → aprova

## 5. Endpoints principais

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/projetos` | Listar projetos |
| POST | `/api/projetos` | Criar projeto |
| GET | `/api/lotes?projeto_id=X` | Listar lotes |
| POST | `/api/lotes` | Criar lote |
| PUT | `/api/lotes/{id}/geometria` | Salvar desenho |
| POST | `/api/lotes/{id}/validar-topologia` | Validar geometria |
| PATCH | `/api/lotes/{id}/status` | Aprovar/rejeitar |
| GET | `/api/acesso-lote?token=XXX` | Magic Link |
| GET/POST | `/api/vizinhos`, `/api/lotes/{id}/vizinhos` | Confrontantes |
