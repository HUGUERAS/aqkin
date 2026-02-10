# FALHAS E FLUXOS CRÍTICOS IDENTIFICADOS

## Problemas Técnicos Encontrados na Auditoria

---

## 4. TOP 10 FALHAS CRÍTICAS IDENTIFICADAS

### 🔴 **1. CONTRATOS: MÓDULO 100% NÃO IMPLEMENTADO**

**Severidade:** 🔴 CRÍTICO  
**Impacto:** Impossível gerar/assinar contratos com clientes

**Problema:**

- Backend tem 4 endpoints de contratos (`POST /generate`, `POST /sign`, `GET /{id}`, `GET /orcamento/{id}`)
- Frontend **NÃO IMPLEMENTA** nenhuma chamada para contratos
- Orçamentos criados nunca viram contratos

**Detalhes:**

```
Backend OK: [POST /api/contracts/generate] ✅
         [POST /api/contracts/sign] ✅
         [GET /api/contracts/{id}] ✅
         [GET /api/contracts/orcamento/{id}] ✅

Frontend: ❌ SEM IMPLEMENTAÇÃO
```

**Fluxo quebrado:**

1. Topografo cria orçamento em Orcamentos.tsx
2. Deveria gerar contrato (falta!)
3. Deveria enviar para cliente assinar (falta!)
4. Deveria registrar aceitação (falta!)

**Componentes afetados:**

- Orcamentos.tsx - sem botão "Gerar Contrato"
- Nenhuma página de visualização de contrato
- Nenhuma página de assinatura

**Recomendação:** Implementar fluxo completo de contrato no frontend (URGENTE)

---

### 🔴 **2. VALIDAÇÃO TOPOLÓGICA: NÃO ESTÁ SENDO CHAMADA**

**Severidade:** 🔴 CRÍTICO  
**Impacto:** Cliente desenha geometria sem validação

**Problema:**

- Backend tem `POST /api/lotes/{id}/validar-topologia` funcionando e completo
- Frontend **NUNCA CHAMA** `validarTopologia()` em lugar nenhum
- Desenho do cliente não é validado

**Detalhes:**

```
Backend: POST /api/lotes/{id}/validar-topologia ✅
         Retorna: {valido: bool, erros[], avisos[]}

Frontend: ❌ NUNCA CHAMADO
         Função existe em api.ts: validarTopologia()
         Alias existe: validateGeometry()
         Mas ninguém chama!
```

**Fluxo quebrado:**

1. Cliente desenha geometria em DesenharArea.tsx
2. Chama `updateLoteGeometria()` ✅
3. **Deveria chamar `validarTopologia()` - MAS NÃO CHAMA!** ❌
4. Cliente nunca sabe se desenho é válido

**Código afetado:** [DesenharArea.tsx](../apps/web/src/pages/cliente/DesenharArea.tsx)

```typescript
// Linha ~82: updateLoteGeometria é chamada
const response = await apiClient.updateLoteGeometria(loteId, geometry);
// Falta chamada: await apiClient.validarTopologia(loteId, geometry);
```

**Recomendação:** Chamar validação logo após desenho ser salvo

---

### 🔴 **3. PAGAMENTOS: SEM CRUD COMPLETO**

**Severidade:** 🔴 CRÍTICO  
**Impacto:** Não há como registrar pagamentos recebidos

**Problema:**

- Backend implementa `GET /api/pagamentos` (somente leitura)
- Backend **NÃO IMPLEMENTA** POST/PUT/DELETE para pagamentos
- Frontend também não tem métodos de criar/atualizar

**Detalhes:**

```
Backend:
  GET /api/pagamentos ✅
  POST /api/pagamentos ❌
  PUT /api/pagamentos/{id} ❌
  DELETE /api/pagamentos/{id} ❌

Frontend:
  getPagamentos() ✅
  createPagamento() ❌ NÃO EXISTE
  updatePagamento() ❌ NÃO EXISTE
  deletePagamento() ❌ NÃO EXISTE
```

**Fluxo quebrado:**

1. Topografo cria orçamento ✅
2. Cliente recebe contrato ✅
3. Cliente paga ✅
4. **Topografo não consegue registrar pagamento** ❌ (Financeiro.tsx tem lugar para isso, mas botão não funciona)

**Componentes afetados:** Financeiro.tsx - aba Pagamentos está vazia/inoperante

**Recomendação:** Implementar POST /api/pagamentos no backend e frontend

---

### 🔴 **4. PARCELS.PY: ROUTER CRIAR MAS NÃO INTEGRADO**

**Severidade:** 🔴 CRÍTICO  
**Impacto:** Validação avançada de desenhos não disponível

**Problema:**

- Backend tem router `parcels.py` com 3 endpoints novos:
  - `GET /api/parcels/{id}/layers` - retorna 4 layers de validação
  - `POST /api/parcels/{id}/validate-topography` - valida topografia
  - `GET /api/parcels/{id}/overlaps` - detalhes de overlaps
- Frontend **NUNCA FOI INTEGRADO** com esses endpoints
- Componentes que deveriam usar (ex: ValidarDesenhos) não existem

**Detalhes:**

```
Backend parcels.py:
  GET /{id}/layers ✅ (retorna cliente, oficial, sobreposições, limites)
  POST /{id}/validate-topography ✅ (marca como SKETCH_APPROVED)
  GET /{id}/overlaps ✅ (lista overlaps detalhados)

Frontend: ❌ NUNCA CHAMADO
  Nenhuma página chama GET /api/parcels/{id}/layers
  Nenhuma página chama POST /api/parcels/{id}/validate-topography
```

**Recomendação:** Integrar parcels.py com novo componente ValidarDesenhos

---

### 🟡 **5. SAFE CALLS EM DESPESAS/PAGAMENTOS: FALHA SILENCIOSA**

**Severidade:** 🟡 ALTO  
**Impacto:** Erros silenciosos ao atualizar/deletar despesas

**Problema:**

- Financeiro.tsx usa safe call operator `?.` com métodos que podem falhar

**Detalhes:**

```typescript
// Financeiro.tsx linha 220
await apiClient.updateDespesa?.(despesaEditando.id, { ... })
// Se updateDespesa não existir, falha silenciosamente!

// Linha 228
await apiClient.createDespesa?.({...})
// Pode falhar sem erro visível

// Linha 251
await apiClient.deleteDespesa?.(id)
// Erro não é mostrado ao usuário
```

**Problema real:**

- Se função não existir, `?.` retorna `undefined` silenciosamente
- Usuário pensa que operação foi feita, mas não foi
- Dados inconsistentes entre frontend e backend

**Recomendação:** Remover safe call `?.` ou validar retorno

---

### 🟡 **6. GETPROJECT() NUNCA USADO - CÓDIGO MORTO**

**Severidade:** 🟡 MÉDIO  
**Impacto:** Confusão de manutenção

**Problema:**

- Frontend implementa `getProject(id)` em api.ts
- Backend aceita `GET /api/projetos/{id}`
- Mas **NUNCA É CHAMADO** em nenhum lugar

**Detalhes:**

```
Backend: GET /api/projetos/{id} ✅ (funciona)
Frontend: apiClient.getProject(id) ✅ (existe)
Uso: ❌ NUNCA ENCONTRADO EM NENHUM PÁGINA

Alternativa usada: apiClient.getProjects() e depois filtro
```

**Recomendação:** Remover função morta ou começar a usar

---

### 🟡 **7. GETSOBREPOSICOESLOTE() NUNCA CHAMADA**

**Severidade:** 🟡 MÉDIO  
**Impacto:** Dashboard não mostra overlaps por lote

**Problema:**

- Backend: `GET /api/lotes/{id}/sobreposicoes` ✅ implementado
- Frontend: `getSobreposicoesLote()` ✅ existe
- Mas **NUNCA É CHAMADA** no frontend

**Uso trocado:**

```
Usado: apiClient.getOverlaps() → getSobreposicoesProjeto()
       (mostra overlaps de TODO o projeto)

Não usado: apiClient.getSobreposicoesLote()
           (mostra overlaps de UM lote específico)
```

**Recomendação:** Usar getSobreposicoesLote() na seção de detalhe do lote

---

### 🟡 **8. INCONSISTÊNCIA DE URL BASE (VITE_API_URL)**

**Severidade:** 🟡 MÉDIO  
**Impacto:** Pode quebrar em deploy

**Problema:**

- api.ts usa: `const API_URL = import.meta.env.VITE_API_URL ?? '';`
- Se VITE_API_URL não set, será string vazia
- Base URL pode estar hardcoded em alguns lugares

**Detalhes:**

```typescript
// api.ts linha 11-14
const API_URL = import.meta.env.VITE_API_URL ?? '';
if (!API_URL && import.meta.env.DEV) {
  console.error('VITE_API_URL é obrigatório...');
}

// Possível problema se VITE_API_URL = "http://localhost:8000"
// Chamada: GET http://localhost:8000/api/projetos ✅
// Chamada: GET /api/projetos (sem base!) ❌
```

**Recomendação:** Validar VITE_API_URL em todas as builds

---

### 🟡 **9. ALIAS DE PARCEL (LEGACY API)**

**Severidade:** 🟡 BAIXO  
**Impacto:** Confusão de código

**Problema:**

- api.ts tem aliases antigos para compatibilidade:
  - `getParcels()` → `getLotes()`
  - `getParcel()` → `getLote()`
  - `createParcel()` → `createLote()`
  - Etc.

**Detalhes:**

- Alguns componentes ainda usam `getParcels()`
- Outros usam `getLotes()`
- Dificulta manutenção

**Recomendação:** Padronizar para `getLotes()` e remover aliases

---

### 🟡 **10. GETORCAMENTO() NUNCA USADO - CÓDIGO MORTO**

**Severidade:** 🟡 BAIXO  
**Impacto:** Acúmulo de código desnecessário

**Problema:**

- Frontend implementa `getOrcamento(id)`
- Backend aceita `GET /api/orcamentos/{id}`
- Mas **NUNCA É CHAMADO** no Orcamentos.tsx

**Uso trocado:**

```
Usado: apiClient.getOrcamentos() → lista todos
Não usado: apiClient.getOrcamento(id) → busca 1 específico
```

**Recomendação:** Remover ou usar em modal de detalhes

---

## 5. FLUXOS CRÍTICOS COM PROBLEMAS

### **FLUXO 1: LOGIN E PRIMEIRA AUTENTICAÇÃO**

```
Sequência:
1. Usuário faz login (Supabase auth) ✅
2. JWT token recebido ✅
3. Frontend chama: apiClient.setToken(token) ✅
4. Frontend chama: apiClient.getPerfilMe() ✅
5. Se primeira vez, chama: apiClient.setPerfilRole('proprietario') ✅
6. Redirect para /cliente ou /topografo ✅

Status: ✅ FUNCIONANDO
Problemas: Nenhum identificado
```

---

### **FLUXO 2: DESENHO E VALIDAÇÃO DE GEOMETRIA**

```
Sequência:
1. Cliente recebe magic link com token ✅
2. Chama: apiClient.getLotePorToken(token) ✅
3. Exibe mapa pronto para desenho ✅
4. Cliente desenha polígono ✅
5. Chama: apiClient.updateLoteGeometria(loteId, wkt) ✅
6. Lote status → DESENHO ✅

FALTA: 7. Deveria chamar: apiClient.validarTopologia() ❌
8. Cliente deveria ver validação ❌
9. Deveria indicar erros ao cliente ❌

Status: 🔴 CRÍTICO - GEOMETRIA NÃO É VALIDADA
Recomendação: Adicionar validação em DesenharArea.tsx
```

---

### **FLUXO 3: CRUD DE PROJETOS (TOPOGRAFO)**

```
Sequência:
1. Topografo vai para MeusProjetos.tsx ✅
2. Chama: apiClient.getProjects() ✅
   - Filtra por tenant_id ✅
   - Mostra projetos do topografo ✅
3. Pode criar novo projeto ✅
   - Chama: apiClient.createProject() ✅
4. Pode editar projeto ✅
   - Chama: apiClient.updateProject(id, data) ✅
5. Pode deletar projeto ✅
   - Chama: apiClient.deleteProject(id) ✅

Status: ✅ FUNCIONANDO
Problemas: Nenhum crítico
```

---

### **FLUXO 4: GERAÇÃO DE CONTRATO** 🔴 **QUEBRADO**

```
Sequência:
1. Topografo abre Orcamentos.tsx ✅
2. Clica em orçamento existente ✅
3. Deveria haver botão "Gerar Contrato" ❌
4. Deveria chamar: apiClient.??? ❌ (NÃO EXISTE NO FRONTEND)
   Backend espera: POST /api/contracts/generate

Status: 🔴 CRÍTICO - NÃO IMPLEMENTADO NO FRONTEND

Falta implementar:
  - Botão "Gerar Contrato"
  - Função frontend: generateContract(orcamentoId)
  - Modal com preview do contrato
  - Botão "Assinar Contrato"
  - Função frontend: signContract(contractId, signatureHash)
```

---

### **FLUXO 5: ORÇAMENTOS E FINANCEIRO** (PARCIALMENTE OK)

```
Sequência:
1. Topografo vai para Orcamentos.tsx ✅
2. Chama: apiClient.getOrcamentos() ✅
3. Filtra por projeto/lote ✅
4. Pode criar novo orçamento ✅
   - Chama: apiClient.createOrcamento() ✅
5. Pode editar orçamento ✅
   - Chama: apiClient.updateOrcamento() ✅
6. Pode deletar orçamento ✅
   - Chama: apiClient.deleteOrcamento() ✅

7. Vai para Financeiro.tsx ✅
8. Vê despesas ✅
   - Chama: apiClient.getDespesas() ✅
9. Pode criar despesa ⚠️ SAFE CALL
   - Chama: apiClient.createDespesa?.() ⚠️
10. Pode editar despesa ⚠️ SAFE CALL
    - Chama: apiClient.updateDespesa?.() ⚠️
11. Vê pagamentos ⚠️ SAFE CALL
    - Chama: apiClient.getPagamentos?.() ⚠️
    - SEM como registrar novos pagamentos ❌

Status: 🟡 FUNCIONA MAS COM PROBLEMAS DE SAFE CALL E SEM CRUD DE PAGAMENTOS
```

---

### **FLUXO 6: VIZINHOS DO CLIENTE** ✅ **OK**

```
Sequência:
1. Cliente recebe magic link ✅
2. Vai para MeusVizinhos.tsx ✅
3. Chama: apiClient.getLotePorToken(token) ✅
4. Chama: apiClient.getVizinhos(loteId) ✅
5. Pode adicionar vizinho ✅
   - Chama: apiClient.addVizinho(loteId, nome, lado) ✅
6. Pode remover vizinho ✅
   - Chama: apiClient.removeVizinho(vizinhoId) ✅

Status: ✅ FUNCIONANDO CORRETAMENTE
Problemas: Nenhum
```

---

### **FLUXO 7: DASHBOARD DE SOBREPOSIÇÕES** (INCOMPLETO)

```
Sequência:
1. Topografo abre DashboardConfluencia ✅
2. Chama: apiClient.getProjects() ✅
3. Chama: apiClient.getParcels(projectId) ✅ 
   - Alias para getLotes()
4. Chama: apiClient.getOverlaps(projectId) ✅
   - Mostra sobreposições do projeto inteiro

FALTA:
5. Ao clicar em lote específico, deveria chamar:
   apiClient.getSobreposicoesLote(loteId) ❌
6. Deveria mostrar 4 layers de validação ❌
   (GET /api/parcels/{id}/layers não está integrado)

Status: 🟡 PARCIAL - FALTA DETALHE POR LOTE
```

---

## 📊 SUMÁRIO DE SEVERIDADE

| Severidade | Quantidade | Exemplos |
|---|---|---|
| 🔴 **CRÍTICO** | 4 | Contratos, Validação, Pagamentos, Parcels |
| 🟡 **ALTO** | 3 | Safe calls, Código morto (getProject), getSobreposicoesLote |
| 🟢 **MÉDIO** | 3 | URL base, Aliases legacy, getOrcamento morto |

**Total de problemas encontrados: 10**
