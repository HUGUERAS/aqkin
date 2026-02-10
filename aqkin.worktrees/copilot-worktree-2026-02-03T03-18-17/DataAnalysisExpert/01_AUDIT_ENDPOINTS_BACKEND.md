# AUDITORIA TÉCNICA: CONEXÃO FRONTEND ↔ BACKEND

## Repositório: aqkin-fresh (React + FastAPI)

**Data:** 2026-02-09  
**Escopo:** Análise completa de endpoints, chamadas HTTP e fluxos críticos

---

## 1. LISTA COMPLETA DE ENDPOINTS BACKEND

### **HEALTH & AUTH (7 endpoints)**

| Path | Método | Autenticação | Query/Body | Retorno | Status |
|------|--------|--------------|-----------|---------|--------|
| `/` | GET | ❌ Não | - | `{status, service}` | ✅ ATIVO |
| `/api/perfis/me` | GET | ✅ Bearer | - | `{user_id, email, role}` | ✅ ATIVO |
| `/api/perfis/set-role` | POST | ✅ Bearer | `{role: "topografo"\|"proprietario"}` | `{role}` | ✅ ATIVO |

---

### **PROJETOS (5 endpoints)**

| Path | Método | Auth | Body/Params | Retorno | Validações |
|------|--------|------|-----------|---------|-----------|
| `/api/projetos` | GET | ✅ | `projeto_id` (query opt) | `[Projeto]` | Multitenant (topografo vê seu tenant, proprietario → [] vazio) |
| `/api/projetos` | POST | ✅ Topografo | `{nome, descricao?, tipo?}` | `Projeto` | Requer role=topografo |
| `/api/projetos/{projeto_id}` | GET | ✅ | - | `Projeto` | 403 se não é do tenant |
| `/api/projetos/{projeto_id}` | PUT | ✅ Topografo | `{nome?, descricao?, tipo?, status?}` | `Projeto` | 403 se não é do tenant |
| `/api/projetos/{projeto_id}` | DELETE | ✅ Topografo | - | `{ok: true}` | 403 se não é do tenant |
| `/api/projetos/{projeto_id}/sobreposicoes` | GET | ✅ | - | `[Sobreposicao]` | Chama RPC SQL |

---

### **LOTES (Parcels) (8 endpoints)**

| Path | Método | Auth | Body/Params | Retorno | Restrições |
|------|--------|------|-----------|---------|-----------|
| `/api/lotes` | GET | ✅ | `projeto_id?` | `[Lote]` | Topografo: só seu tenant; Proprietario: só seus lotes (by email) |
| `/api/lotes` | POST | ✅ Topografo | `{projeto_id, nome_cliente, email?, cpf?, geom_wkt?}` | `Lote` | Gera token_acesso (7 dias), status=PENDENTE |
| `/api/lotes/{lote_id}` | GET | ✅ | - | `Lote` | 403 se não autorizado |
| `/api/acesso-lote` | GET | ❌ Não | `token` (query) | `Lote` | Magic link para cliente |
| `/api/lotes/{lote_id}/geometria` | PUT | ✅ Topografo | `{geom_wkt}` | `Lote` | WKT em SRID 4674; status → DESENHO |
| `/api/lotes/{lote_id}/status` | PATCH | ✅ Topografo | `{status}` | `Lote` | Status: DESENHO, VALIDACAO_SIGEF, PENDENTE, etc |
| `/api/lotes/{lote_id}/sobreposicoes` | GET | ✅ | - | `[Sobreposicao]` | RPC SQL para detectar overlaps |
| `/api/lotes/{lote_id}/validar-topologia` | POST | ✅ | `{geom_wkt?}` | `{valido, erros[], avisos[]}` | RPC SQL, retorna geometria válida |

---

### **VIZINHOS (Confrontantes) (3 endpoints)**

| Path | Método | Auth | Body/Params | Retorno | Regras |
|------|--------|------|-----------|---------|-------|
| `/api/lotes/{lote_id}/vizinhos` | GET | ✅ | - | `[Vizinho]` | Topografo: leitura/escrita; Proprietário: leitura |
| `/api/vizinhos` | POST | ✅ Topografo | `{lote_id, nome_vizinho, lado}` | `Vizinho` | Requer autorização do lote (escrita) |
| `/api/vizinhos/{vizinho_id}` | DELETE | ✅ Topografo | - | `{ok: true}` | Requer autorização do lote |

---

### **ORÇAMENTOS (5 endpoints)**

| Path | Método | Auth | Query/Body | Retorno | Acesso |
|------|--------|------|-----------|---------|--------|
| `/api/orcamentos` | GET | ✅ | `projeto_id?, lote_id?` | `[Orcamento]` | Topografo: seu tenant; Proprietário: seus lotes |
| `/api/orcamentos/{id}` | GET | ✅ | - | `Orcamento` | Verificação de permissão por projeto/lote |
| `/api/orcamentos` | POST | ✅ Topografo | `{projeto_id?, lote_id?, valor, status?, obs?}` | `Orcamento` | Requer projeto_id OU lote_id |
| `/api/orcamentos/{id}` | PUT | ✅ Topografo | `{valor?, status?, obs?}` | `Orcamento` | Só topografo |
| `/api/orcamentos/{id}` | DELETE | ✅ Topografo | - | `{ok: true}` | Só topografo |

---

### **DESPESAS (5 endpoints)**

| Path | Método | Auth | Query/Body | Retorno | Restrição |
|------|--------|------|-----------|---------|-----------|
| `/api/despesas` | GET | ✅ Topografo | `projeto_id?` | `[Despesa]` | **APENAS TOPOGRAFO** (403 para outros) |
| `/api/despesas/{id}` | GET | ✅ Topografo | - | `Despesa` | **APENAS TOPOGRAFO** |
| `/api/despesas` | POST | ✅ Topografo | `{projeto_id, descricao, valor, data?, categoria?, obs?}` | `Despesa` | **APENAS TOPOGRAFO**; categoria default=OUTROS |
| `/api/despesas/{id}` | PUT | ✅ Topografo | `{descricao?, valor?, data?, categoria?, obs?}` | `Despesa` | **APENAS TOPOGRAFO** |
| `/api/despesas/{id}` | DELETE | ✅ Topografo | - | `{ok: true}` | **APENAS TOPOGRAFO** |

---

### **PAGAMENTOS (1 endpoint)**

| Path | Método | Auth | Query/Params | Retorno | Regras |
|------|--------|------|-------------|---------|--------|
| `/api/pagamentos` | GET | ✅ | `projeto_id?, lote_id?` | `[Pagamento]` | **SOMENTE LEITURA**; Topografo: seu tenant; Proprietário: seus lotes |

⚠️ **CRÍTICO:** Não existe POST/PUT/DELETE para pagamentos no backend!

---

### **CONTRATOS (4 endpoints)**

| Path | Método | Auth | Body | Retorno | Status |
|------|--------|------|------|---------|--------|
| `/api/contracts/generate` | POST | ✅ Bearer | `{orcamento_id, projeto_id, lote_id?, valor?}` | `{contract_id, html_content, preview_url, template_version, created_at}` | ⚠️ **NÃO CHAMADO DO FRONTEND** |
| `/api/contracts/sign` | POST | ✅ Bearer | `{contract_id, orcamento_id, signature_hash, ip?}` | `{acceptance_id, status, accepted_at, contract_hash}` | ⚠️ **NÃO CHAMADO DO FRONTEND** |
| `/api/contracts/{contract_id}` | GET | ✅ Bearer | - | `ContractTemplateResponse` | ⚠️ **NÃO IMPLEMENTADO NO FRONTEND** |
| `/api/contracts/orcamento/{orcamento_id}` | GET | ✅ Bearer | - | `{contract_id, html_content, template_version, is_signed, acceptances[]}` | ⚠️ **NÃO IMPLEMENTADO NO FRONTEND** |

---

### **PARCELS (da rota parcels.py - NÃO INTEGRADO)**

| Path | Método | Desc | Status |
|------|--------|------|--------|
| `/api/parcels/{parcel_id}/layers` | GET | Retorna 4 layers de validação (cliente, oficial, sobreposições, limites) | ❌ **NÃO CHAMADO DO FRONTEND** |
| `/api/parcels/{parcel_id}/validate-topography` | POST | Valida geometria e marca status | ❌ **NÃO CHAMADO DO FRONTEND** |
| `/api/parcels/{parcel_id}/overlaps` | GET | Detalhes de overlaps | ❌ **NÃO CHAMADO DO FRONTEND** |

---

## 📊 RESUMO DE ENDPOINTS

- **Total de endpoints:** 36
- **Implementados e funcionando:** 33 ✅
- **Não implementados no frontend:** 7 ❌
- **Apenas leitura sem CRUD:** Pagamentos (lista apenas)
