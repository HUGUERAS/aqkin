# 🧪 Guia de Teste de Integração - Módulo Financeiro

## 📋 Checklist de Verificação

### 1. Banco de Dados (Supabase)

#### ✅ Verificar Migrações Aplicadas

**Opção A: Via SQL Editor (Recomendado)**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo `scripts/check-migrations.sql`
4. Verifique se todas as tabelas, índices e políticas foram criadas

**Opção B: Via Script Python**

```bash
cd scripts
python test-financeiro-integration.py
```

**O que verificar:**

- [ ] Tabela `orcamentos` existe
- [ ] Tabela `despesas` existe
- [ ] Enum `status_orcamento` existe com valores corretos
- [ ] Índices criados (`idx_orcamentos_projeto`, `idx_orcamentos_lote`, etc.)
- [ ] RLS habilitado nas tabelas
- [ ] Políticas RLS criadas (`orcamentos_topografo_all`, `despesas_topografo_all`, etc.)
- [ ] Triggers criados (`trigger_update_orcamentos`, `trigger_update_despesas`)

### 2. API FastAPI

#### ✅ Iniciar Servidor

```bash
cd apps/api

# Instalar dependências (se necessário)
pip install -r requirements.txt

# Verificar variáveis de ambiente
cat .env
# Deve conter:
# SUPABASE_URL=...
# SUPABASE_SERVICE_KEY=...

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

#### ✅ Testar Endpoints

**Health Check:**

```bash
curl http://0.0.0.0:8000/
# Deve retornar: {"status": "online", "service": "Ativo Real API"}
```

**Endpoints de Orçamentos (requer autenticação):**

```bash
# Listar orçamentos (sem auth = 401)
curl http://0.0.0.0:8000/api/orcamentos
# Deve retornar: {"detail": "Token inválido ou ausente"}

# Com token (após login)
curl -H "Authorization: Bearer SEU_TOKEN" http://0.0.0.0:8000/api/orcamentos
```

**Endpoints de Despesas:**

```bash
curl http://0.0.0.0:8000/api/despesas
```

**Endpoints de Pagamentos:**

```bash
curl http://0.0.0.0:8000/api/pagamentos
```

**Verificar Documentação Swagger:**

- Acesse: `http://0.0.0.0:8000/docs`
- Verifique se os endpoints aparecem:
  - `/api/orcamentos` (GET, POST)
  - `/api/orcamentos/{orcamento_id}` (GET, PUT, DELETE)
  - `/api/despesas` (GET, POST)
  - `/api/despesas/{despesa_id}` (GET, PUT, DELETE)
  - `/api/pagamentos` (GET)

### 3. Frontend React

#### ✅ Iniciar Aplicação

```bash
# Na raiz do projeto
npm install

# Configurar variáveis de ambiente
cd apps/web
cp .env.example .env
# Editar .env e adicionar:
# VITE_API_URL=http://0.0.0.0:8000
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Iniciar servidor de desenvolvimento
npx nx serve web
```

#### ✅ Testar Fluxo Completo

**1. Login:**

- Acesse a URL configurada em `VITE_API_URL` (nunca use localhost)
- Faça login com usuário topógrafo
- Deve redirecionar para `/topografo/dashboard`

**2. Navegação:**

- Verifique se aparecem os links:
  - 💰 Orçamentos
  - 💳 Financeiro
- Clique em "Orçamentos"
- Deve abrir `/topografo/orcamentos`

**3. Tela de Orçamentos:**

- [ ] Lista de orçamentos carrega (pode estar vazia)
- [ ] Filtros por projeto/lote funcionam
- [ ] Botão "Novo Orçamento" abre modal
- [ ] Formulário permite criar orçamento
- [ ] Orçamento criado aparece na lista
- [ ] Botão "Editar" funciona
- [ ] Botão "Excluir" funciona

**4. Tela Financeiro:**

- Clique em "Financeiro"
- Deve abrir `/topografo/financeiro`
- [ ] Aba "Despesas" funciona
- [ ] Aba "Pagamentos" funciona
- [ ] Botão "Nova Despesa" abre modal
- [ ] Formulário permite criar despesa
- [ ] Despesa criada aparece na lista
- [ ] Resumo financeiro mostra valores corretos

### 4. Teste de Integração Completo

#### Fluxo: Login → Topógrafo → Meus Projetos → Orçamentos/Financeiro

**Passo 1: Criar Projeto**

1. Login como topógrafo
2. Ir em "Meus Projetos"
3. Criar um novo projeto
4. Anotar o ID do projeto

**Passo 2: Criar Lote**

1. No projeto criado, criar um lote
2. Anotar o ID do lote

**Passo 3: Criar Orçamento**

1. Ir em "Orçamentos"
2. Filtrar pelo projeto criado
3. Criar novo orçamento vinculado ao projeto/lote
4. Verificar se aparece na lista
5. Editar o orçamento
6. Mudar status para "APROVADO"
7. Verificar se atualizou

**Passo 4: Criar Despesa**

1. Ir em "Financeiro"
2. Aba "Despesas"
3. Criar nova despesa vinculada ao projeto
4. Verificar se aparece na lista
5. Verificar resumo financeiro

**Passo 5: Ver Pagamentos**

1. Aba "Pagamentos"
2. Verificar se lista pagamentos (pode estar vazia se não houver)
3. Verificar resumo financeiro

### 5. Teste de RBAC

#### ✅ Topógrafo

- [ ] Pode criar orçamentos
- [ ] Pode editar orçamentos
- [ ] Pode excluir orçamentos
- [ ] Pode criar despesas
- [ ] Pode editar despesas
- [ ] Pode excluir despesas
- [ ] Vê apenas orçamentos/despesas dos seus projetos

#### ✅ Proprietário

- [ ] Pode ver orçamentos dos seus lotes (apenas leitura)
- [ ] Não pode criar/editar/excluir orçamentos
- [ ] Não tem acesso a despesas
- [ ] Vê apenas pagamentos dos seus lotes

### 6. Verificação de Erros Comuns

#### ❌ Problema: Tabelas não existem

**Solução:** Execute `database/init/04_financeiro.sql` no Supabase SQL Editor

#### ❌ Problema: API retorna 500

**Solução:**

- Verifique logs do servidor
- Verifique se SUPABASE_URL e SUPABASE_SERVICE_KEY estão corretos
- Verifique se as tabelas foram criadas

#### ❌ Problema: Frontend não carrega dados

**Solução:**

- Verifique se VITE_API_URL está configurado
- Verifique console do navegador (F12)
- Verifique se API está rodando

#### ❌ Problema: Erro 401/403

**Solução:**

- Verifique se está logado
- Verifique se o token está sendo enviado
- Verifique se o perfil está correto (topógrafo vs proprietário)

### 7. Scripts de Teste Automatizado

```bash
# Teste completo de integração
cd scripts
python test-financeiro-integration.py

# Verificar migrações no banco
# Execute scripts/check-migrations.sql no Supabase SQL Editor
```

## ✅ Checklist Final

- [ ] Migrações aplicadas no banco
- [ ] API rodando e respondendo
- [ ] Endpoints de orçamentos funcionando
- [ ] Endpoints de despesas funcionando
- [ ] Endpoints de pagamentos funcionando
- [ ] Frontend carregando corretamente
- [ ] Tela de Orçamentos funcionando
- [ ] Tela de Financeiro funcionando
- [ ] RBAC funcionando (topógrafo vs proprietário)
- [ ] Multitenant funcionando (isolamento por tenant)

## 🎯 Próximos Passos Após Testes

1. Criar dados de teste (projetos, lotes, orçamentos, despesas)
2. Testar com múltiplos tenants
3. Testar performance com muitos registros
4. Validar cálculos financeiros
5. Testar integração com gateway de pagamento (se aplicável)
