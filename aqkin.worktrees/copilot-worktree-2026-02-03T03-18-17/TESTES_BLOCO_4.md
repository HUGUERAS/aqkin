# 🧪 Plano de Testes - Bloco 4: Proteção de Rotas por Perfil

## ✅ Checklist de Verificação

### 1. **Verificação de Conflitos**

#### App.tsx - Rotas e Proteção

- [x] Rotas `/cliente` protegidas com `ProtectedRoute` (allowedRole="proprietario")
- [x] Rotas `/topografo` protegidas com `ProtectedRoute` (allowedRole="topografo")
- [x] Rotas públicas (`/`, `/login`) sem proteção
- [x] Rotas de orçamentos e financeiro dentro de `/topografo` protegidas
- [x] Importações corretas (ProtectedRoute, Orcamentos, Financeiro)

#### TopografoLayout.tsx - Links da Sidebar

- [x] Links para `/topografo/orcamentos` e `/topografo/financeiro` presentes
- [x] Links funcionando corretamente
- [x] Estilos de navegação ativa funcionando

#### api.ts - Métodos de API

- [x] Método `getPerfilMe()` implementado
- [x] Métodos de orçamentos (`getOrcamentos`, `createOrcamento`, etc.)
- [x] Métodos de despesas (`getDespesas`, `createDespesa`, etc.)
- [x] Métodos de pagamentos (`getPagamentos`)
- [x] Token JWT sendo enviado no header Authorization

#### Páginas Novas

- [x] `MeusProjetos.tsx` - CRUD completo de projetos
- [x] `Orcamentos.tsx` - CRUD de orçamentos
- [x] `Financeiro.tsx` - CRUD de despesas e listagem de pagamentos
- [x] Erro de sintaxe corrigido em `MeusProjetos.tsx`

---

## 🧪 Testes Funcionais

### 2. **Teste de Login e Redirecionamento**

#### Teste 2.1: Login como Topógrafo

```bash
# Cenário:
1. Acessar /login
2. Selecionar "Topógrafo" no dropdown
3. Inserir email e senha válidos
4. Clicar em "Entrar"

# Resultado Esperado:
✅ Redirecionado para /topografo/dashboard
✅ Sidebar mostra todas as opções (Dashboard, Projetos, Orçamentos, Financeiro, etc.)
✅ Token JWT salvo no localStorage
✅ Token configurado no apiClient
```

#### Teste 2.2: Login como Proprietário

```bash
# Cenário:
1. Acessar /login
2. Selecionar "Proprietário" no dropdown
3. Inserir email e senha válidos
4. Clicar em "Entrar"

# Resultado Esperado:
✅ Redirecionado para /cliente/desenhar
✅ Não vê sidebar do topógrafo
✅ Token JWT salvo no localStorage
```

#### Teste 2.3: Tentativa de Acesso Direto sem Login

```bash
# Cenário:
1. Limpar localStorage (sem token)
2. Tentar acessar /topografo/dashboard diretamente
3. Tentar acessar /cliente/desenhar diretamente

# Resultado Esperado:
✅ Redirecionado para /login
✅ Mensagem de loading "Verificando acesso..." aparece brevemente
```

---

### 3. **Teste de Proteção de Rotas por Perfil**

#### Teste 3.1: Proprietário Tentando Acessar Área de Topógrafo

```bash
# Cenário:
1. Fazer login como Proprietário
2. Tentar acessar /topografo/dashboard diretamente (digitar na URL)

# Resultado Esperado:
✅ Redirecionado automaticamente para /cliente
✅ Não consegue ver conteúdo do topógrafo
✅ Mensagem de loading aparece durante verificação
```

#### Teste 3.2: Topógrafo Tentando Acessar Área de Proprietário

```bash
# Cenário:
1. Fazer login como Topógrafo
2. Tentar acessar /cliente/desenhar diretamente (digitar na URL)

# Resultado Esperado:
✅ Redirecionado automaticamente para /topografo
✅ Não consegue ver conteúdo do proprietário
✅ Mensagem de loading aparece durante verificação
```

#### Teste 3.3: Navegação Normal Dentro do Perfil Correto

```bash
# Cenário (Topógrafo):
1. Login como Topógrafo
2. Clicar em "Meus Projetos" na sidebar
3. Clicar em "Orçamentos" na sidebar
4. Clicar em "Financeiro" na sidebar

# Resultado Esperado:
✅ Todas as navegações funcionam normalmente
✅ Sem redirecionamentos inesperados
✅ Loading aparece apenas na primeira verificação

# Cenário (Proprietário):
1. Login como Proprietário
2. Navegar entre /cliente/desenhar, /cliente/vizinhos, /cliente/documentos

# Resultado Esperado:
✅ Todas as navegações funcionam normalmente
✅ Sem redirecionamentos inesperados
```

---

### 4. **Teste de CRUD de Projetos**

#### Teste 4.1: Criar Projeto

```bash
# Cenário:
1. Login como Topógrafo
2. Acessar /topografo/projetos
3. Clicar em "Novo Projeto"
4. Preencher formulário:
   - Nome: "Loteamento Teste"
   - Descrição: "Projeto de teste"
   - Tipo: "Loteamento"
5. Clicar em "Criar"

# Resultado Esperado:
✅ Projeto criado com sucesso
✅ Modal fecha automaticamente
✅ Projeto aparece na lista
✅ Status inicial é "RASCUNHO"
```

#### Teste 4.2: Editar Projeto

```bash
# Cenário:
1. Login como Topógrafo
2. Acessar /topografo/projetos
3. Clicar em "Editar" em um projeto existente
4. Alterar nome e status
5. Clicar em "Atualizar"

# Resultado Esperado:
✅ Projeto atualizado com sucesso
✅ Mudanças refletidas na lista
✅ Modal fecha automaticamente
```

#### Teste 4.3: Excluir Projeto

```bash
# Cenário:
1. Login como Topógrafo
2. Acessar /topografo/projetos
3. Clicar em "Excluir" em um projeto
4. Confirmar exclusão no modal

# Resultado Esperado:
✅ Modal de confirmação aparece
✅ Projeto excluído após confirmação
✅ Projeto desaparece da lista
```

#### Teste 4.4: Filtrar Projetos por Status

```bash
# Cenário:
1. Login como Topógrafo
2. Acessar /topografo/projetos
3. Clicar nos filtros: "Todos", "Rascunho", "Em Andamento", etc.

# Resultado Esperado:
✅ Lista filtra corretamente por status
✅ Contadores mostram quantidade correta
✅ Badges de status aparecem corretamente
```

---

### 5. **Teste de Telas de Orçamentos e Financeiro**

#### Teste 5.1: Acessar Tela de Orçamentos

```bash
# Cenário:
1. Login como Topógrafo
2. Clicar em "Orçamentos" na sidebar

# Resultado Esperado:
✅ Página carrega sem erros
✅ Lista de orçamentos aparece (mesmo que vazia)
✅ Filtros funcionam (projeto, lote, status)
✅ Botão "Novo Orçamento" visível
```

#### Teste 5.2: Criar Orçamento

```bash
# Cenário:
1. Login como Topógrafo
2. Acessar /topografo/orcamentos
3. Clicar em "Novo Orçamento"
4. Preencher formulário:
   - Projeto: selecionar projeto
   - Valor: 5000.00
   - Status: "RASCUNHO"
5. Clicar em "Criar"

# Resultado Esperado:
✅ Orçamento criado com sucesso
✅ Aparece na lista
✅ Resumo financeiro atualizado
```

#### Teste 5.3: Acessar Tela Financeiro

```bash
# Cenário:
1. Login como Topógrafo
2. Clicar em "Financeiro" na sidebar

# Resultado Esperado:
✅ Página carrega sem erros
✅ Abas "Despesas" e "Pagamentos" visíveis
✅ Lista de despesas aparece (mesmo que vazia)
✅ Botão "Nova Despesa" visível
```

#### Teste 5.4: Criar Despesa

```bash
# Cenário:
1. Login como Topógrafo
2. Acessar /topografo/financeiro
3. Clicar em "Nova Despesa"
4. Preencher formulário:
   - Projeto: selecionar projeto
   - Descrição: "Material de escritório"
   - Valor: 150.00
   - Categoria: "MATERIAL"
5. Clicar em "Criar"

# Resultado Esperado:
✅ Despesa criada com sucesso
✅ Aparece na lista
✅ Resumo financeiro atualizado
```

---

### 6. **Teste de Redirecionamento quando Perfil Não Tem Acesso**

#### Teste 6.1: Proprietário Tentando Acessar Rotas de Topógrafo

```bash
# URLs para testar (como Proprietário):
- /topografo
- /topografo/dashboard
- /topografo/projetos
- /topografo/orcamentos
- /topografo/financeiro
- /topografo/validar
- /topografo/pecas

# Resultado Esperado:
✅ Todas redirecionam para /cliente
✅ Mensagem de loading aparece brevemente
✅ Não há erro no console
```

#### Teste 6.2: Topógrafo Tentando Acessar Rotas de Proprietário

```bash
# URLs para testar (como Topógrafo):
- /cliente
- /cliente/desenhar
- /cliente/vizinhos
- /cliente/documentos

# Resultado Esperado:
✅ Todas redirecionam para /topografo
✅ Mensagem de loading aparece brevemente
✅ Não há erro no console
```

---

### 7. **Teste de Performance e UX**

#### Teste 7.1: Loading State

```bash
# Cenário:
1. Limpar localStorage
2. Acessar rota protegida diretamente

# Resultado Esperado:
✅ Loading "Verificando acesso..." aparece
✅ Não há tela branca
✅ Transição suave para redirecionamento ou conteúdo
```

#### Teste 7.2: Cache de Perfil

```bash
# Cenário:
1. Login como Topógrafo
2. Navegar entre várias páginas do topógrafo
3. Verificar Network tab no DevTools

# Resultado Esperado:
✅ GET /api/perfis/me chamado apenas uma vez (na primeira rota)
✅ Navegação subsequente não faz nova chamada
✅ Performance adequada
```

#### Teste 7.3: Token Expirado

```bash
# Cenário:
1. Login como Topógrafo
2. Esperar token expirar (ou remover manualmente do localStorage)
3. Tentar navegar para outra página

# Resultado Esperado:
✅ Redirecionado para /login
✅ Mensagem de erro apropriada (se houver)
✅ Não há crash da aplicação
```

---

## 🐛 Problemas Conhecidos e Soluções

### Problema 1: Erro de Sintaxe em MeusProjetos.tsx

**Status:** ✅ CORRIGIDO

- Linha 395 tinha um `);` solto
- Corrigido removendo o fechamento extra

### Problema 2: Possível Loop de Redirecionamento

**Prevenção:**

- ProtectedRoute verifica perfil antes de redirecionar
- Evita redirecionamentos infinitos

### Problema 3: Token Não Sincronizado

**Prevenção:**

- App.tsx configura token no mount
- ProtectedRoute também configura token antes de buscar perfil

---

## 📋 Checklist de Execução

Execute os testes na seguinte ordem:

1. ✅ **Correção de Sintaxe** - Verificar se MeusProjetos.tsx compila sem erros
2. ⬜ **Teste de Login** - Testar login como Topógrafo e Proprietário
3. ⬜ **Teste de Proteção** - Verificar redirecionamentos
4. ⬜ **Teste de CRUD** - Testar criação, edição e exclusão de projetos
5. ⬜ **Teste de Orçamentos** - Verificar tela e funcionalidades
6. ⬜ **Teste de Financeiro** - Verificar tela e funcionalidades
7. ⬜ **Teste de Redirecionamento** - Verificar todos os cenários de acesso negado
8. ⬜ **Teste de Performance** - Verificar loading states e cache

---

## 🎯 Próximos Passos Após Testes

1. Se todos os testes passarem: ✅ Bloco 4 completo!
2. Se houver falhas: Documentar problemas e corrigir
3. Considerar melhorias:
   - Cache de perfil em contexto React
   - Tratamento de erro mais robusto
   - Logout automático quando token expira
