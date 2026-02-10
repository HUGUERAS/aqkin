# 🧪 Guia de Teste de Integração - Módulo Financeiro

## 📋 Passo a Passo Completo

### 1️⃣ Verificar Migrations no Banco de Dados (Supabase)

**Opção A: Via SQL Editor (Recomendado)**

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Execute o arquivo `scripts/check-financeiro-migrations.sql`
5. Verifique os resultados:
   - ✅ Tabelas `orcamentos` e `despesas` devem existir
   - ✅ ENUM `status_orcamento` deve existir
   - ✅ Índices devem estar criados
   - ✅ RLS deve estar habilitado
   - ✅ Políticas RLS devem estar criadas
   - ✅ Triggers devem estar criados

**Opção B: Aplicar Migration Manualmente**

Se as tabelas não existirem:

1. No Supabase SQL Editor, execute:

   ```sql
   -- Copie e cole o conteúdo de database/init/04_financeiro.sql
   ```

2. Clique em **Run** (ou F5)
3. Verifique se não há erros

**Verificação Rápida:**

```sql
-- Execute no SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orcamentos', 'despesas');
```

Deve retornar 2 linhas.

---

### 2️⃣ Configurar e Iniciar a API

**2.1. Verificar Variáveis de Ambiente**

```bash
cd apps/api
cat .env
# ou no Windows:
type .env
```

Deve conter:

```env
SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=seu-secret-aqui
```

**2.2. Instalar Dependências (se necessário)**

```bash
cd apps/api
pip install -r requirements.txt
```

**2.3. Iniciar a API**

```bash
cd apps/api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Você deve ver:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**2.4. Testar Health Check**

Em outro terminal:

```bash
curl http://127.0.0.1:8000/
# ou no PowerShell:
Invoke-WebRequest -Uri http://127.0.0.1:8000/
```

Deve retornar:

```json
{"status": "online", "service": "Ativo Real API"}
```

**2.5. Verificar Documentação Swagger**

Abra no navegador:

- <http://127.0.0.1:8000/docs>

Verifique se aparecem os endpoints:

- `/api/orcamentos` (GET, POST)
- `/api/orcamentos/{orcamento_id}` (GET, PUT, DELETE)
- `/api/despesas` (GET, POST)
- `/api/despesas/{despesa_id}` (GET, PUT, DELETE)
- `/api/pagamentos` (GET)

---

### 3️⃣ Testar Endpoints da API

**3.1. Testar Proteção de Endpoints (sem autenticação)**

```bash
# Deve retornar 401 (não autorizado)
curl http://127.0.0.1:8000/api/orcamentos
curl http://127.0.0.1:8000/api/despesas
curl http://127.0.0.1:8000/api/pagamentos
```

Todos devem retornar:

```json
{"detail": "Token inválido ou ausente"}
```

**3.2. Testar com Autenticação (via Swagger)**

1. Acesse <http://127.0.0.1:8000/docs>
2. Clique em **Authorize** (cadeado no topo)
3. Cole um token JWT válido do Supabase
4. Teste os endpoints:
   - GET `/api/orcamentos` - Deve retornar lista (pode estar vazia)
   - POST `/api/orcamentos` - Deve permitir criar
   - GET `/api/despesas` - Deve retornar lista
   - POST `/api/despesas` - Deve permitir criar

---

### 4️⃣ Configurar e Iniciar o Frontend

**4.1. Verificar Variáveis de Ambiente**

```bash
cd apps/web
cat .env
# ou no Windows:
type .env
```

Deve conter:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://xntxtdximacsdnldouxa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**⚠️ IMPORTANTE:** `VITE_API_URL` deve ser `http://127.0.0.1:8000` (não `localhost`)

**4.2. Instalar Dependências (se necessário)**

```bash
# Na raiz do projeto
npm install
```

**4.3. Iniciar Frontend**

```bash
# Na raiz do projeto
npx nx serve web
```

Você deve ver:

```
  ➜  Local:   http://0.0.0.0:4200/
  ➜  Network: use --host to expose
```

---

### 5️⃣ Testar Fluxo Completo no Frontend

**5.1. Login**

1. Acesse <http://0.0.0.0:4200> (ou <http://127.0.0.1:4200>)
2. Faça login com usuário **topógrafo**
3. Deve redirecionar para `/topografo/dashboard`

**5.2. Verificar Navegação**

No menu lateral, verifique se aparecem:

- 💰 Orçamentos
- 💳 Financeiro

**5.3. Testar Tela de Orçamentos**

1. Clique em **💰 Orçamentos**
2. Deve abrir `/topografo/orcamentos`
3. Verifique:
   - [ ] Lista carrega (pode estar vazia)
   - [ ] Filtros por projeto/lote funcionam
   - [ ] Botão "Novo Orçamento" abre modal
   - [ ] Formulário permite criar orçamento
   - [ ] Orçamento criado aparece na lista

**5.4. Testar Tela de Financeiro**

1. Clique em **💳 Financeiro**
2. Deve abrir `/topografo/financeiro`
3. Verifique:
   - [ ] Aba "Despesas" funciona
   - [ ] Aba "Pagamentos" funciona
   - [ ] Botão "Nova Despesa" abre modal
   - [ ] Formulário permite criar despesa
   - [ ] Despesa criada aparece na lista
   - [ ] Resumo financeiro mostra valores corretos

**5.5. Testar Fluxo Completo**

1. **Criar Projeto:**
   - Vá em "Meus Projetos"
   - Clique em "Novo Projeto"
   - Preencha e salve
   - Anote o ID do projeto

2. **Criar Orçamento:**
   - Vá em "Orçamentos"
   - Filtre pelo projeto criado
   - Clique em "Novo Orçamento"
   - Preencha: projeto, valor, status
   - Salve
   - Verifique se aparece na lista

3. **Criar Despesa:**
   - Vá em "Financeiro"
   - Aba "Despesas"
   - Clique em "Nova Despesa"
   - Preencha: projeto, descrição, valor, data
   - Salve
   - Verifique se aparece na lista

4. **Ver Pagamentos:**
   - Aba "Pagamentos"
   - Verifique se lista pagamentos (pode estar vazia)
   - Verifique resumo financeiro

---

### 6️⃣ Testar RBAC (Segurança)

**6.1. Como Topógrafo**

- [ ] Pode criar orçamentos
- [ ] Pode editar orçamentos
- [ ] Pode excluir orçamentos
- [ ] Pode criar despesas
- [ ] Pode editar despesas
- [ ] Pode excluir despesas
- [ ] Vê apenas orçamentos/despesas dos seus projetos

**6.2. Como Proprietário**

1. Faça logout
2. Faça login com usuário **proprietário**
3. Verifique:
   - [ ] Não tem acesso a `/topografo/orcamentos` (redireciona)
   - [ ] Não tem acesso a `/topografo/financeiro` (redireciona)
   - [ ] Pode ver orçamentos dos seus lotes (se houver endpoint público)

---

### 7️⃣ Verificar Erros Comuns

**❌ Problema: Tabelas não existem**

**Solução:**

1. Execute `database/init/04_financeiro.sql` no Supabase SQL Editor
2. Verifique se não há erros
3. Execute `scripts/check-financeiro-migrations.sql` para verificar

**❌ Problema: API retorna 500**

**Solução:**

1. Verifique logs do servidor (`uvicorn`)
2. Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` estão corretos
3. Verifique se as tabelas foram criadas
4. Teste conexão com Supabase:

   ```python
   from supabase import create_client
   supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
   result = supabase.table("orcamentos").select("*").limit(1).execute()
   print(result)
   ```

**❌ Problema: Frontend não carrega dados**

**Solução:**

1. Abra DevTools (F12) → Console
2. Verifique erros no console
3. Verifique Network tab → veja requisições falhando
4. Verifique se `VITE_API_URL` está configurado corretamente
5. Verifique se API está rodando

**❌ Problema: Erro 401/403**

**Solução:**

1. Verifique se está logado
2. Verifique se o token está sendo enviado (Network tab → Headers)
3. Verifique se o perfil está correto (topógrafo vs proprietário)
4. Teste token no Swagger (`/docs` → Authorize)

**❌ Problema: CORS Error**

**Solução:**

1. Verifique se `VITE_API_URL` está correto
2. Verifique se API está configurada para aceitar CORS
3. Verifique se não está usando `localhost` (use `127.0.0.1`)

---

### 8️⃣ Scripts de Teste Automatizado

**Testar API:**

```bash
python scripts/test-api-financeiro.py
```

**Verificar Migrations:**

Execute no Supabase SQL Editor:

```sql
-- scripts/check-financeiro-migrations.sql
```

**Teste Completo (PowerShell):**

```powershell
.\scripts\test-integration-complete.ps1
```

---

## ✅ Checklist Final

- [ ] Migrations aplicadas no Supabase
- [ ] Tabelas `orcamentos` e `despesas` existem
- [ ] RLS habilitado e políticas criadas
- [ ] API rodando e respondendo
- [ ] Endpoints de orçamentos funcionando
- [ ] Endpoints de despesas funcionando
- [ ] Endpoints de pagamentos funcionando
- [ ] Frontend carregando corretamente
- [ ] Tela de Orçamentos funcionando
- [ ] Tela de Financeiro funcionando
- [ ] RBAC funcionando (topógrafo vs proprietário)
- [ ] Multitenant funcionando (isolamento por tenant)

---

## 🎯 Próximos Passos Após Testes

1. Criar dados de teste (projetos, lotes, orçamentos, despesas)
2. Testar com múltiplos tenants
3. Testar performance com muitos registros
4. Validar cálculos financeiros
5. Testar integração com gateway de pagamento (se aplicável)

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs da API
2. Verifique o console do navegador (F12)
3. Execute os scripts de verificação
4. Consulte a documentação Swagger (`/docs`)
