# Bem Real - Database Setup & Migration Guide

## Estrutura do Banco de Dados

Arquivos criados:

- `alembic/` – Diretório de migrações Alembic
- `alembic/versions/001_initial_schema.py` – Migration inicial com todas as tabelas
- `models.py` – Modelos SQLAlchemy (referência; pode ser usado quando migrar de Supabase para PostgreSQL direto)
- `requirements.txt` – Atualizados com: sqlalchemy, alembic, psycopg2-binary, geoalchemy2, shapely

## Schema do Banco de Dados

O banco está estruturado em:

### 1. Tenancy & Auth

- `tenant` – Tenants (cada topógrafo)
- `app_user` – Usuários (TOPOGRAFO, PROPRIETARIO)

### 2. Projects & Parcels

- `project` – Projetos (desmembramentos, lotes, etc.)
- `parcel` – Parcelas individuais com geometrias (sketch do cliente + official do topógrafo)

### 3. Contracts

- `contract_template` – Templates de contrato (versionados)
- `contract_acceptance` – Evidência de aceite (IP, timestamp)

### 4. Payments

- `payment_intent` – Intenção de pagamento (status, provider, valor)
- `payment_receipt` – Recibo/comprovante

### 5. Timeline & To-dos

- `milestone` – Etapas do processo (Contrato, Pagamento, Coleta, Protocolo, etc.)
- `milestone_status` – Status de cada etapa por parcela
- `todo` – Tarefas/pendências

### 6. Geospatial

- `sigef_certified` – Camada de áreas certificadas (SIGEF/INCRA)
- `validation_event` – Logs de validação (SIGEF overlap, gaps, etc.)

### 7. Security & Docs

- `invite_link` – Revogação de links (JWT JTI)
- `document` – Documentos enviados (matrícula, CAR, ART, etc.)

## Como Usar Alembic

### 1. Verificar Configuração

Atualize a URL do banco em `alembic/alembic.ini`:

```ini
sqlalchemy.url = postgresql://user:password@localhost/bem_real_db
```

### 2. Criar o Banco de Dados (PostgreSQL)

```bash
createdb bem_real_db
# ou via psql:
psql -c "CREATE DATABASE bem_real_db;"
```

### 3. Rodar a Migration Inicial

```bash
cd apps/api
alembic upgrade head
```

Isso executará `001_initial_schema.py` e criará todas as tabelas.

### 4. Verificar o Schema

```bash
psql bem_real_db -c "\dt"  # Listar tabelas
psql bem_real_db -c "\di"  # Listar índices
```

### 5. Revert (se necessário)

```bash
alembic downgrade base
```

## Campos Importantes

### Parcel

- `geom_client_sketch` → Polígono desenhado pelo cliente (subsídio)
- `geom_official` → Geometria refinada/medida pelo topógrafo (oficial)
- `sketch_status` → Status do sketch: pending, approved, rejected, request_revision
- `has_overlap_alert` → Flag para alertar topógrafo de sobreposição SIGEF
- `reviewed_by_topografo_at` → Quando topógrafo revisou
- `reviewed_notes` → Por que rejeitou ou pediu ajuste

### Validation Event

- `type` → SIGEF_OVERLAP, NEIGHBOR_OVERLAP, GAP_DETECTED, GEOM_INVALID
- `result` → OK, WARN, FAIL
- `severity` → INFO, WARN, ERROR
- `details` → JSON com detalhes do erro/overlap

### Payment Intent

- `status` → pending, requires_action, paid, failed, refunded, expired
- `provider` → stripe, pag.seguro, iugu, etc.
- `provider_ref` → ID do provedor para disparar webhooks

## Próximos Passos

1. **Backend**: Criar serviços FastAPI para CRUD (projects, parcels, intakes)
2. **Geo Service**: Implementar validação PostGIS (SIGEF overlap, gap detection)
3. **Auth**: JWT para links de proprietário (scopes: tenant, project, parcel)
4. **Frontend Cliente**: Wizard 5 passos
5. **Frontend Topógrafo**: Painel com editor CAD, import/export

---
**Documentação**: Ver `ARCHITECTURE.md` para fluxos completos.
