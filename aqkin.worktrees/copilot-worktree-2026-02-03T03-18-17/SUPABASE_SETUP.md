# 🚀 Configuração Supabase - Ativo Real

## ✅ O que já foi feito

1. **Projeto Criado**: `xntxtdximacsdnldouxa`
2. **PostgreSQL + PostGIS**: Habilitado automaticamente
3. **Schema Migration**: Executado via SQL Editor (01_schema.sql)
4. **API Keys**: Configuradas no `.env.example`

## 🔑 Credenciais (Já Configuradas)

```bash
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (frontend - seguro expor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (backend - NUNCA expor)
DATABASE_URL=postgresql://postgres.xntxtdximacsdnldouxa:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## 📋 Próximos Passos

### 1. Obter Senha do Banco de Dados

No Supabase Dashboard:
1. Vá em **Settings** → **Database**
2. Copie a **Connection String** (modo Pooler - porta 6543)
3. Substitua `[YOUR-PASSWORD]` pela senha real
4. Atualize `DATABASE_URL` no `.env`

### 2. Atualizar Backend Python

O backend já está configurado para usar PostgreSQL. Apenas ajuste a connection string:

```python
# novo-projeto/backend/database.py
DATABASE_URL = os.getenv("DATABASE_URL")  # Já configurado!
```

### 3. Instalar Dependências

```bash
cd novo-projeto/backend
pip install -r requirements.txt
```

### 4. Testar Conexão

```bash
python check_tables.py  # Script já existente no backend
```

### 5. Deploy do Backend

**Opção A: Azure Functions (já configurado)**
```bash
# Adicionar variáveis no Azure Portal
az functionapp config appsettings set --resource-group seu-rg --name seu-function-app --settings DATABASE_URL="postgresql://..."
```

**Opção B: Hostinger VPS**
```bash
# Upload via FTP/SSH
# Instalar Python 3.11+
# Configurar Gunicorn/Uvicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker function_app:app
```

## 🗺️ PostGIS Habilitado

Supabase já tem PostGIS instalado. Você pode usar:

```sql
-- Testar no SQL Editor
SELECT PostGIS_version();

-- Ver tabelas criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## 🔐 Segurança

- ✅ **ANON_KEY**: Frontend pode usar (RLS protege dados)
- ⚠️ **SERVICE_ROLE_KEY**: Backend apenas (bypass RLS - acesso total)
- 🔒 **DATABASE_URL**: Backend apenas (acesso direto ao PostgreSQL)

## 📊 Plano Atual: Supabase Pro ($25/mês)

- 100K usuários ativos/mês
- 8GB disco + 250GB egress
- PostGIS + extensões ilimitadas
- Backups diários (7 dias)
- Suporte dedicado

## 🧪 Testar API do Backend

Depois de configurar `DATABASE_URL`:

```bash
# Criar projeto de teste
curl -X POST https://seu-backend.azurewebsites.net/api/projetos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Projeto Teste", "tipo": "INDIVIDUAL"}'

# Verificar no Supabase Dashboard → Table Editor
```

## 🔄 Migração do Azure Antigo (Opcional)

Se você tem dados no Azure PostgreSQL antigo:

```bash
# Exportar do Azure
pg_dump -h seu-azure-postgres.postgres.database.azure.com -U admin -d ativoreal_geo > backup.sql

# Importar para Supabase
psql "postgresql://postgres.xntxtdximacsdnldouxa:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" < backup.sql
```

## 📱 Frontend já configurado

```typescript
// ativo-real-monorepo/apps/web/src/lib/supabase.ts
export const supabase = createClient(
  'https://xntxtdximacsdnldouxa.supabase.co',
  'eyJhbGci...' // ANON_KEY
)
```

## ✅ Checklist Final

- [ ] Obter senha do banco de dados
- [ ] Atualizar `DATABASE_URL` no `.env`
- [ ] Instalar dependências Python
- [ ] Testar conexão com `check_tables.py`
- [ ] Fazer deploy do backend
- [ ] Testar endpoints da API
- [ ] Conectar frontend aos endpoints

---

**🎯 Status Atual**: Banco configurado, schema criado. **Falta**: Conectar backend com `DATABASE_URL` real.
