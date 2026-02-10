# CHAMADAS HTTP DO FRONTEND
## Mapeamento de Função → Endpoint → Uso

---

## 2. LISTA COMPLETA DE CHAMADAS FRONTEND

### **AUTH & PERFIL (3 métodos)**

| Função Frontend | Endpoint | Método | Componentes/Páginas | Status |
|---|---|---|---|---|
| `apiClient.getPerfilMe()` | `GET /api/perfis/me` | GET | Login.tsx, SignUp.tsx | ✅ ATIVO |
| `apiClient.setPerfilRole(role)` | `POST /api/perfis/set-role` | POST | Login.tsx, SignUp.tsx | ✅ ATIVO |
| `apiClient.logout()` | Limpa token localmente | - | Geral | ✅ ATIVO |

---

### **PROJETOS (5 métodos)**

| Função | Endpoint | Método | Uso em | Frequência |
|---|---|---|---|---|
| `apiClient.getProjects()` | `GET /api/projetos` | GET | MeusProjetos.tsx, DashboardEnhanced.tsx, DashboardConfluencia.tsx, Orcamentos.tsx, Financeiro.tsx | 🔴 **ALTA** |
| `apiClient.getProject(id)` | `GET /api/projetos/{id}` | GET | (não encontrado no código) | ❓ NUNCA USADO |
| `apiClient.createProject(data)` | `POST /api/projetos` | POST | DashboardConfluencia.tsx, MeusProjetos.tsx | 🟡 MÉDIA |
| `apiClient.updateProject(id, data)` | `PUT /api/projetos/{id}` | PUT | MeusProjetos.tsx | 🟡 MÉDIA |
| `apiClient.deleteProject(id)` | `DELETE /api/projetos/{id}` | DELETE | MeusProjetos.tsx | 🟡 MÉDIA |

---

### **LOTES (6 métodos + 2 aliases)**

| Função | Endpoint | Método | Uso em | Observação |
|---|---|---|---|---|
| `apiClient.getLotes(projetoId)` | `GET /api/lotes?projeto_id={id}` | GET | Orcamentos.tsx, Financeiro.tsx, DashboardConfluencia.tsx, DesenharArea.tsx, MeusVizinhos.tsx | 🔴 **MUITO USADA** |
| `apiClient.getLote(id)` | `GET /api/lotes/{id}` | GET | (não chamada diretamente) | ❓ ALIAS APENAS |
| `apiClient.getLotePorToken(token)` | `GET /api/acesso-lote?token={token}` | GET | DesenharArea.tsx, MeusVizinhos.tsx | 🟡 IMPORTANTE (cliente) |
| `apiClient.createLote(data)` | `POST /api/lotes` | POST | DashboardConfluencia.tsx | 🟡 MÉDIA |
| `apiClient.updateLoteGeometria(loteId, wkt)` | `PUT /api/lotes/{id}/geometria` | PUT | DesenharArea.tsx | 🟡 CRÍTICO |
| `apiClient.updateLoteStatus(loteId, status)` | `PATCH /api/lotes/{id}/status` | PATCH | DashboardConfluencia.tsx | 🟡 MÉDIA |
| **Aliases:** |
| `apiClient.getParcels(projectId)` | → `getLotes(projectId)` | GET | Componentes modernos | ✅ ATOR |
| `apiClient.getParcel(id)` | → `getLote(id)` | GET | Componentes modernos | ✅ ATOR |

---

### **VALIDAÇÃO TOPOLÓGICA (2 métodos)**

| Função | Endpoint | Método | Uso em | Crítico? |
|---|---|---|---|---|
| `apiClient.validarTopologia(loteId, wkt?)` | `POST /api/lotes/{id}/validar-topologia` | POST | (não encontrado) | ⚠️ **NUNCA CHAMADA** |
| `apiClient.validateGeometry(parcelId, wkt)` | → `validarTopologia()` | POST | (alias não usado) | ⚠️ **NUNCA CHAMADA** |

---

### **SOBREPOSIÇÕES (2 métodos)**

| Função | Endpoint | Método | Uso em | Status |
|---|---|---|---|---|
| `apiClient.getSobreposicoesProjeto(projetoId)` | `GET /api/projetos/{id}/sobreposicoes` | GET | DashboardConfluencia.tsx | 🟡 MÉDIA (dashboard) |
| `apiClient.getSobreposicoesLote(loteId)` | `GET /api/lotes/{id}/sobreposicoes` | GET | (não encontrado) | ⚠️ **NUNCA CHAMADA** |
| `apiClient.getOverlaps(projectId)` | → `getSobreposicoesProjeto()` | GET | DashboardConfluencia.tsx | ✅ ALIAS ATIVO |

---

### **VIZINHOS (3 métodos)**

| Função | Endpoint | Método | Uso em | Status |
|---|---|---|---|---|
| `apiClient.getVizinhos(loteId)` | `GET /api/lotes/{id}/vizinhos` | GET | MeusVizinhos.tsx | 🟡 CLIENTE |
| `apiClient.addVizinho(loteId, nome, lado)` | `POST /api/vizinhos` | POST | MeusVizinhos.tsx | 🟡 CLIENTE |
| `apiClient.removeVizinho(vizinhoId)` | `DELETE /api/vizinhos/{id}` | DELETE | MeusVizinhos.tsx | 🟡 CLIENTE |
| `apiClient.getNeighbors(parcelId)` | → `getVizinhos()` | GET | Alias | ✅ ATOR |
| `apiClient.addNeighbor(parcelId, data)` | → `addVizinho()` | POST | Alias | ✅ ATOR |

---

### **ORÇAMENTOS (5 métodos)**

| Função | Endpoint | Método | Uso em | Status |
|---|---|---|---|---|
| `apiClient.getOrcamentos(projetoId?, loteId?)` | `GET /api/orcamentos` | GET | Orcamentos.tsx, Financeiro.tsx | 🔴 **MUITO USADA** |
| `apiClient.getOrcamento(id)` | `GET /api/orcamentos/{id}` | GET | (não encontrado) | ❓ NUNCA USADA |
| `apiClient.createOrcamento(data)` | `POST /api/orcamentos` | POST | Orcamentos.tsx | 🟡 MÉDIA |
| `apiClient.updateOrcamento(id, data)` | `PUT /api/orcamentos/{id}` | PUT | Orcamentos.tsx | 🟡 MÉDIA |
| `apiClient.deleteOrcamento(id)` | `DELETE /api/orcamentos/{id}` | DELETE | Orcamentos.tsx | 🟡 MÉDIA |

---

### **DESPESAS (5 métodos)**

| Função | Endpoint | Método | Uso em | Status |
|---|---|---|---|---|
| `apiClient.getDespesas(projetoId?)` | `GET /api/despesas` | GET | Financeiro.tsx | 🔴 MUITO USADA |
| `apiClient.getDespesa(id)` | `GET /api/despesas/{id}` | GET | (não encontrado) | ❓ NUNCA USADA |
| `apiClient.createDespesa(data)` | `POST /api/despesas` | POST | Financeiro.tsx | 🟡 MÉDIA |
| `apiClient.updateDespesa(id, data)` | `PUT /api/despesas/{id}` | PUT | Financeiro.tsx (com safe call `?`) | 🟡 MÉDIA |
| `apiClient.deleteDespesa(id)` | `DELETE /api/despesas/{id}` | DELETE | Financeiro.tsx (com safe call `?`) | 🟡 MÉDIA |

---

### **PAGAMENTOS (1 método)**

| Função | Endpoint | Método | Uso em | Status |
|---|---|---|---|---|
| `apiClient.getPagamentos(projetoId?, loteId?)` | `GET /api/pagamentos` | GET | Financeiro.tsx (com safe call `?`) | 🟡 PARCIAL |

⚠️ **NÃO EXISTEM:** `createPagamento()`, `updatePagamento()`, `deletePagamento()`

---

### **CONTRATOS (NÃO IMPLEMENTADO)**

| Função | Endpoint | Método | Uso em | Status |
|---|---|---|---|---|
| (Não existe) | `POST /api/contracts/generate` | POST | ❌ **NUNCA CHAMADA** | ❌ FALTANDO |
| (Não existe) | `POST /api/contracts/sign` | POST | ❌ **NUNCA CHAMADA** | ❌ FALTANDO |
| (Não existe) | `GET /api/contracts/{id}` | GET | ❌ **NUNCA CHAMADA** | ❌ FALTANDO |
| (Não existe) | `GET /api/contracts/orcamento/{id}` | GET | ❌ **NUNCA CHAMADA** | ❌ FALTANDO |

---

### **PARCELS (router parcels.py - NÃO INTEGRADO)**

| Função | Endpoint | Método | Status |
|---|---|---|---|
| (Não existe) | `GET /api/parcels/{id}/layers` | GET | ❌ NUNCA CHAMADA |
| (Não existe) | `POST /api/parcels/{id}/validate-topography` | POST | ❌ NUNCA CHAMADA |
| (Não existe) | `GET /api/parcels/{id}/overlaps` | GET | ❌ NUNCA CHAMADA |

---

## 📊 RESUMO DE CHAMADAS

| Categoria | Total | Implementado | Nunca Usado | Parcial |
|---|---|---|---|---|
| **Auth** | 3 | 3 | 0 | 0 |
| **Projetos** | 5 | 4 | 1 | 0 |
| **Lotes** | 6 | 6 | 0 | 0 |
| **Validação** | 2 | 0 | 2 | 0 |
| **Sobreposições** | 2 | 1 | 1 | 0 |
| **Vizinhos** | 3 | 3 | 0 | 0 |
| **Orçamentos** | 5 | 5 | 0 | 0 |
| **Despesas** | 5 | 5 | 0 | 1 (safe call) |
| **Pagamentos** | 1 | 1 | 0 | 1 (safe call) |
| **Contratos** | 4 | 0 | 4 | 0 |
| **Parcels** | 3 | 0 | 3 | 0 |

### **Total:** 39 métodos | 28 funcionando | 11 nunca usados ou ausentes

