# 🚀 Guia Rápido: Executar e Testar Módulo Financeiro

## ⚡ Início Rápido

### 1. Verificar Migrações no Banco (Supabase)

**Acesse:** Supabase Dashboard → SQL Editor

**Execute:** O conteúdo do arquivo `database/init/04_financeiro.sql`

**Ou execute:** `scripts/check-migrations.sql` para verificar se tudo foi criado

### 2. Iniciar API Backend

```bash
# Terminal 1
cd apps/api

# Instalar dependências (primeira vez)
pip install -r requirements.txt

# Verificar .env está configurado
cat .env
# Deve ter: SUPABASE_URL e SUPABASE_SERVICE_KEY

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

**Verificar:** Acesse `http://0.0.0.0:8000/docs` - deve mostrar Swagger UI

### 3. Iniciar Frontend

```bash
# Terminal 2
# Na raiz do projeto
npm install  # Se necessário

# Configurar .env
cd apps/web
cp .env.example .env
# Editar .env e adicionar:
# VITE_API_URL=http://0.0.0.0:8000
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Iniciar servidor
npx nx serve web
```

**Verificar:** Acesse a URL do frontend configurada (use variável de ambiente, nunca localhost)

## 🧪 Teste Rápido

### Teste 1: Verificar API está rodando

```bash
curl http://0.0.0.0:8000/
# Deve retornar: {"status": "online", "service": "Ativo Real API"}
```

### Teste 2: Verificar Endpoints no Swagger

1. Acesse `http://0.0.0.0:8000/docs`
2. Procure por:
   - `/api/orcamentos`
   - `/api/despesas`
   - `/api/pagamentos`
3. Todos devem aparecer na lista

### Teste 3: Fluxo no Frontend

1. Login como topógrafo
2. Ir em "Orçamentos" (menu lateral)
3. Criar um orçamento
4. Ir em "Financeiro"
5. Criar uma despesa
6. Ver pagamentos

## 📋 Checklist de Verificação

### Banco de Dados

- [ ] Tabela `orcamentos` existe
- [ ] Tabela `despesas` existe
- [ ] RLS habilitado
- [ ] Políticas RLS criadas

### API

- [ ] Servidor rodando na porta 8000
- [ ] Swagger UI acessível
- [ ] Endpoints aparecem na documentação
- [ ] Health check retorna OK

### Frontend

- [ ] Servidor rodando (configurado com `host: '0.0.0.0'` no vite.config.mts)
- [ ] `VITE_API_URL` configurado corretamente (nunca localhost)
- [ ] Login funciona
- [ ] Menu mostra "Orçamentos" e "Financeiro"
- [ ] Telas carregam sem erros

## 🔧 Solução de Problemas

### API não inicia

- Verifique se Python está instalado: `python --version`
- Verifique se dependências estão instaladas: `pip list`
- Verifique variáveis de ambiente: `cat apps/api/.env`

### Frontend não carrega

- Verifique se Node está instalado: `node --version`
- Verifique se dependências estão instaladas: `npm list`
- Verifique variáveis de ambiente: `cat apps/web/.env`
- Verifique console do navegador (F12)

### Erro 401/403

- Verifique se está logado
- Verifique se token está sendo enviado
- Verifique se perfil está correto (topógrafo)

### Tabelas não existem

- Execute `database/init/04_financeiro.sql` no Supabase
- Verifique se não há erros no SQL Editor

## 📚 Documentação Completa

Para mais detalhes, veja: `TESTE_INTEGRAÇÃO.md`
