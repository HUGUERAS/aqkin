# MATRIZ DE COMPATIBILIDADE: BACKEND ↔ FRONTEND

## Status de Integração: Endpoint → Chamada → Componente

---

## 3. MATRIZ ENDPOINT ↔ FRONTEND CALL

### **AUTH & PERFIL (3/3 = 100% OK)**

| Backend Endpoint | Frontend Call | Componentes | Status | Observações |
|---|---|---|---|---|
| `GET /api/perfis/me` | ✅ `getPerfilMe()` | Login.tsx,SignUp.tsx | ✅ **OK** | Usado logo após login para detectar role |
| `POST /api/perfis/set-role` | ✅ `setPerfilRole()` | Login.tsx,SignUp.tsx | ✅ **OK** | Primeira autenticação: define proprietario/topografo |
| `GET /` (health) | ❌ Não existe | - | ✅ **OK** | Não precisa ser chamado |

---

### **PROJETOS (6/5 = 83% OK)**

| Backend Endpoint | Frontend Call | Componentes | Status | Problema |
|---|---|---|---|---|
| `GET /api/projetos` | ✅ `getProjects()` | MeusProjetos, Dashboard, Orcamentos, Financeiro | ✅ **OK** | Chamada frequente, multitenant funciona |
| `POST /api/projetos` | ✅ `createProject()` | MeusProjetos, DashboardConfluencia | ✅ **OK** | Cria projeto novo |
| `PUT /api/projetos/{id}` | ✅ `updateProject()` | MeusProjetos | ✅ **OK** | Atualiza dados do projeto |
| `DELETE /api/projetos/{id}` | ✅ `deleteProject()` | MeusProjetos | ✅ **OK** | Deleta projeto |
| `GET /api/projetos/{id}` | ❌ `getProject()` | **NUNCA CHAMADO** | ⚠️ **ORFÃO** | Função existe mas não é usada em nenhum lugar |
| `GET /api/projetos/{id}/sobreposicoes` | ✅ `getSobreposicoesProjeto()` | DashboardConfluencia → `getOverlaps()` | ✅ **OK** | Dashboard mostra sobreposições do projeto |

---

### **LOTES (8/6 = 75% OK)**

| Backend Endpoint | Frontend Call | Componentes | Status | Problema |
|---|---|---|---|---|
| `GET /api/lotes?projeto_id=` | ✅ `getLotes()` | Orcamentos, Financeiro, Dashboard, DesenharArea, MeusVizinhos | ✅ **OK** | Muito usado, funciona |
| `GET /api/lotes/{id}` | ⚠️ `getLote()` | (alias apenas) | ⚠️ **NUNCA DIRETO** | Nunca chamado diretamente, só via getLotes |
| `POST /api/lotes` | ✅ `createLote()` | DashboardConfluencia, DesenharArea | ✅ **OK** | Cria lote com token_acesso |
| `PUT /api/lotes/{id}/geometria` | ✅ `updateLoteGeometria()` | DesenharArea → `updateParcel()` | ✅ **OK** | **CRÍTICO**: Cliente desenha geometria aqui |
| `PATCH /api/lotes/{id}/status` | ✅ `updateLoteStatus()` | DashboardConfluencia | ✅ **OK** | Topografo muda status para VALIDACAO_SIGEF |
| `GET /api/lotes/{id}/sobreposicoes` | ❌ `getSobreposicoesLote()` | **NUNCA CHAMADO** | ⚠️ **ORFÃO** | Endpoint existe mas nunca é chamado |
| `POST /api/lotes/{id}/validar-topologia` | ❌ `validarTopologia()` | **NUNCA CHAMADO** | 🔴 **CRÍTICO FALTANDO** | Deveria validar desenho do cliente |
| `GET /api/acesso-lote?token=` | ✅ `getLotePorToken()` | DesenharArea, MeusVizinhos | ✅ **OK** | Magic link: cliente acessa por token |

---

### **SOBREPOSIÇÕES (2/1 = 50% OK)**

| Backend Endpoint | Frontend Call | Componentes | Status | Crítico? |
|---|---|---|---|---|
| `GET /api/projetos/{id}/sobreposicoes` | ✅ `getSobreposicoesProjeto()` | DashboardConfluencia | ✅ **OK** | Dashboard mostra overlaps do projeto |
| `GET /api/lotes/{id}/sobreposicoes` | ❌ `getSobreposicoesLote()` | **NUNCA CHAMADO** | 🔴 **PROBLEMA** | Deveria mostrar overlaps do lote específico |

---

### **VIZINHOS (3/3 = 100% OK)**

| Backend Endpoint | Frontend Call | Componentes | Status | Observação |
|---|---|---|---|---|
| `GET /api/lotes/{id}/vizinhos` | ✅ `getVizinhos()` | MeusVizinhos | ✅ **OK** | Cliente vê vizinhos |
| `POST /api/vizinhos` | ✅ `addVizinho()` | MeusVizinhos | ✅ **OK** | Cliente adiciona vizinho confrontante |
| `DELETE /api/vizinhos/{id}` | ✅ `removeVizinho()` | MeusVizinhos | ✅ **OK** | Cliente remove vizinho |

---

### **ORÇAMENTOS (5/5 = 100% OK)**

| Backend Endpoint | Frontend Call | Componentes | Status | Observação |
|---|---|---|---|---|
| `GET /api/orcamentos` | ✅ `getOrcamentos()` | Orcamentos, Financeiro | ✅ **OK** | Lista orçamentos com filtros |
| `GET /api/orcamentos/{id}` | ⚠️ `getOrcamento()` | (nunca chamado) | ⚠️ **ORFÃO** | Exists but never used |
| `POST /api/orcamentos` | ✅ `createOrcamento()` | Orcamentos | ✅ **OK** | Cria novo orçamento |
| `PUT /api/orcamentos/{id}` | ✅ `updateOrcamento()` | Orcamentos | ✅ **OK** | Atualiza valor/status |
| `DELETE /api/orcamentos/{id}` | ✅ `deleteOrcamento()` | Orcamentos | ✅ **OK** | Deleta orçamento |

---

### **DESPESAS (5/5 = 100% OK, MAS COM SAFE CALL)**

| Backend Endpoint | Frontend Call | Componentes | Status | Observação |
|---|---|---|---|---|
| `GET /api/despesas` | ✅ `getDespesas()` | Financeiro | ✅ **OK** | Lista despesas |
| `GET /api/despesas/{id}` | ⚠️ `getDespesa()` | (nunca chamado) | ⚠️ **ORFÃO** | Never used |
| `POST /api/despesas` | ✅ `createDespesa?()` | Financeiro | ⚠️ **SAFE CALL** | Usa `?.` (optional) - pode falhar silenciosamente |
| `PUT /api/despesas/{id}` | ✅ `updateDespesa?()` | Financeiro | ⚠️ **SAFE CALL** | Usa `?.` - pode falhar silenciosamente |
| `DELETE /api/despesas/{id}` | ✅ `deleteDespesa?()` | Financeiro | ⚠️ **SAFE CALL** | Usa `?.` - pode falhar silenciosamente |

🔴 **PROBLEMA:** Financeiro.tsx usa safe call `apiClient.updateDespesa?.()` - se a função não existir, falha silenciosamente!

---

### **PAGAMENTOS (1/1 = 100% OK, MAS SOMENTE LEITURA)**

| Backend Endpoint | Frontend Call | Componentes | Status | Crítico |
|---|---|---|---|---|
| `GET /api/pagamentos` | ✅ `getPagamentos?()` | Financeiro | ✅ **OK (LEITURA)** | Safe call, lista pagamentos |
| (POST não existe) | ❌ `createPagamento()` | **NÃO EXISTE** | 🔴 **FALTANDO** | Não há como registrar pagamento no frontend |
| (PUT não existe) | ❌ `updatePagamento()` | **NÃO EXISTE** | 🔴 **FALTANDO** | Não há como atualizar pagamento |
| (DELETE não existe) | ❌ `deletePagamento()` | **NÃO EXISTE** | 🔴 **FALTANDO** | Não há como deletar pagamento |

🔴 **CRÍTICO:** Backend aceitaria POST/PUT/DELETE para pagamentos, mas frontend não implementa!

---

### **CONTRATOS (0/4 = 0% IMPLEMENTADO)**

| Backend Endpoint | Frontend Call | Componentes | Status | Impacto |
|---|---|---|---|---|
| `POST /api/contracts/generate` | ❌ Não existe | **NUNCA CHAMADO** | 🔴 **FALTANDO** | Impossível gerar contrato |
| `POST /api/contracts/sign` | ❌ Não existe | **NUNCA CHAMADO** | 🔴 **FALTANDO** | Impossível assinar contrato |
| `GET /api/contracts/{id}` | ❌ Não existe | **NUNCA CHAMADO** | 🔴 **FALTANDO** | Impossível buscar contrato |
| `GET /api/contracts/orcamento/{id}` | ❌ Não existe | **NUNCA CHAMADO** | 🔴 **FALTANDO** | Impossível verificar se contrato existe |

🔴 **CRÍTICO:** Módulo de contratos está 100% não implementado no frontend!

---

### **PARCELS.PY (0/3 = 0% INTEGRADO)**

| Backend Endpoint | Frontend Call | Componentes | Status | Impacto |
|---|---|---|---|---|
| `GET /api/parcels/{id}/layers` | ❌ Não existe | **NUNCA CHAMADO** | 🔴 **FALTANDO** | ValidarDesenhos não pode mostrar 4 layers |
| `POST /api/parcels/{id}/validate-topography` | ❌ Não existe | **NUNCA CHAMADO** | 🔴 **FALTANDO** | Topografo não pode validar desenho completo |
| `GET /api/parcels/{id}/overlaps` | ❌ Não existe | **NUNCA CHAMADO** | 🔴 **FALTANDO** | Dashboard não mostra overlaps de forma detalhada |

🔴 **PROBLEMA:** Router `parcels.py` foi criado mas nunca foi integrado ao frontend!

---

## 📊 RESUMO GERAL

| Categoria | Total | ✅ Funcionando | ⚠️ Orfão/Parcial | 🔴 Faltando | % Cobertura |
|---|---|---|---|---|---|
| Auth | 3 | 3 | 0 | 0 | 100% |
| Projetos | 6 | 5 | 1 | 0 | 83% |
| Lotes | 8 | 6 | 0 | 2 | 75% |
| Sobreposições | 2 | 1 | 0 | 1 | 50% |
| Vizinhos | 3 | 3 | 0 | 0 | 100% |
| Orçamentos | 5 | 5 | 0 | 0 | 100% |
| Despesas | 5 | 5 | 0 | 0 | 100% |
| Pagamentos | 4 | 1 | 0 | 3 | 25% |
| Contratos | 4 | 0 | 0 | 4 | 0% |
| Parcels | 3 | 0 | 0 | 3 | 0% |
| **TOTAL** | **43** | **28** | **1** | **14** | **65%** |
