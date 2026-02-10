# RECOMENDAÇÕES DE FIX POR ORDEM DE CRITICIDADE

---

## 6. PLANO DE AÇÃO (ROADMAP DE CORREÇÕES)

### **PRIORIDADE 1: AÇÕES CRÍTICAS (BLOQUEADORES) - Semana 1**

---

#### **1.1 🔴 IMPLEMENTAR FLUXO DE CONTRATOS COMPLETO**

**Por que:** Impossível gerar/assinar contratos com clientes. Fluxo de vendas quebrado.

**Arquivo(s) afetado(s):**

- Criar: `apps/web/src/pages/topografo/Contratos.tsx` (nova página)
- Criar: `apps/web/src/components/ContractPreview.tsx` (visualizador)
- Criar: `apps/web/src/components/ContractSignature.tsx` (assinatura)
- Atualizar: `apps/web/src/services/api.ts` (adicionar métodos)
- Atualizar: `apps/web/src/pages/topografo/Orcamentos.tsx` (adicionar botão)

**O que fazer:**

Backend (FastAPI Main) - Verificar se está OK:

```python
# main.py - Verificar imports
from routers.contracts import router as contracts_router
app.include_router(contracts_router)  # Deve estar aqui
```

Frontend - Adicionar ao `api.ts`:

```typescript
async generateContract(orcamentoId: number, projetoId: number, loteId?: number) {
    return this.request('/api/contracts/generate', {
        method: 'POST',
        body: JSON.stringify({ orcamento_id: orcamentoId, projeto_id: projetoId, lote_id: loteId })
    });
}

async signContract(contractId: string, orcamentoId: number, signatureHash: string, ipAddress?: string) {
    return this.request('/api/contracts/sign', {
        method: 'POST',
        body: JSON.stringify({ contract_id: contractId, orcamento_id: orcamentoId, signature_hash: signatureHash, ip_address: ipAddress })
    });
}

async getContract(contractId: string) {
    return this.request(`/api/contracts/${contractId}`, { method: 'GET' });
}

async getContractByOrcamento(orcamentoId: number) {
    return this.request(`/api/contracts/orcamento/${orcamentoId}`, { method: 'GET' });
}
```

Frontend - Componentes novos necessários:

1. **Orcamentos.tsx** - Adicionar coluna/botão "Ação":

   ```tsx
   <button onClick={() => gerarContrato(orcamento.id)}>
     {orcamento.status === 'RASCUNHO' ? 'Gerar Contrato' : 'Ver Contrato'}
   </button>
   ```

2. **Contratos.tsx** (nova página) - Lista de contratos:
   - Listar contratos por projeto
   - Mostrar status (GERADO, ASSINADO)
   - Preview e download

3. **ContractPreview.tsx** - Modal com:
   - Print do HTML do contrato
   - Botão "Assinar Contrato"
   - Confirmação de assinatura

**Esforço:** 2-3 dias  
**Risco:** Médio (nova integração com Supabase para salvar contratos)

---

#### **1.2 🔴 IMPLEMENTAR VALIDAÇÃO TOPOLÓGICA NA GEOMETRIA DO CLIENTE**

**Por que:** Cliente desenha geometria sem saber se é válida. Pode desenhar polígonos inválidos.

**Arquivo(s) afetado(s):**

- Atualizar: [DesenharArea.tsx](../apps/web/src/pages/cliente/DesenharArea.tsx)

**O que fazer:**

```typescript
// DesenharArea.tsx - após updateLoteGeometria

const response = await apiClient.updateLoteGeometria(loteId, geometry);
if (response.error) {
  setError('Erro ao salvar geometria');
  return;
}

// ADICIONAR: Validar topologia
const validationResult = await apiClient.validarTopologia(loteId, geometry);
if (validationResult.error) {
  setError('Erro ao validar geometria');
  return;
}

// Verificar erros
const validation = validationResult.data as { valido: boolean; erros: string[] };
if (!validation.valido) {
  setError(`Geometria inválida: ${validation.erros.join(', ')}`);
  return;
}

// Se válido, mostrar sucesso
setSuccess('Geometria salva e validada com sucesso');
```

**Alternativa:** Validar em tempo real enquanto desenha (webhook/socket)

**Esforço:** 1 dia  
**Risco:** Baixo

---

#### **1.3 🔴 IMPLEMENTAR CRUD COMPLETO DE PAGAMENTOS**

**Por que:** Topografo não consegue registrar pagamentos recebidos. Financeiro não fecha.

**Arquivo(s) afetado(s):**

- Atualizar: `apps/api/main.py` (adicionar POST/PUT/DELETE para pagamentos)
- Atualizar: `apps/web/src/services/api.ts` (adicionar métodos)
- Atualizar: `apps/web/src/pages/topografo/Financeiro.tsx` (remover safe call)

**O que fazer:**

Backend (main.py) - Copiar padrão de orcamentos:

```python
@app.post("/api/pagamentos")
def criar_pagamento(
    data: {
        'lote_id': int,
        'valor': float,
        'data_pagamento': str,
        'metodo': str,  # PIX, BOLETO, DINHEIRO, etc
        'observacoes': str
    },
    perfil: dict = Depends(require_topografo)
):
    # Validar lote pertence ao tenant
    # Inserir em Supabase
    # Retornar pagamento criado

@app.put("/api/pagamentos/{pagamento_id}")
def atualizar_pagamento(...):
    # Implementar atualização

@app.delete("/api/pagamentos/{pagamento_id}")
def deletar_pagamento(...):
    # Implementar deleção
```

Frontend (api.ts):

```typescript
async createPagamento(data: { lote_id: number; valor: number; data_pagamento: string; ... }) {
    return this.request('/api/pagamentos', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async updatePagamento(id: number, data: { valor?: number; ... }) {
    return this.request(`/api/pagamentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async deletePagamento(id: number) {
    return this.request(`/api/pagamentos/${id}`, { method: 'DELETE' });
}
```

Frontend (Financeiro.tsx) - Remover safe call:

```typescript
// Antes:
await apiClient.createPagamento?.({ ... })

// Depois:
if (!apiClient.createPagamento) {
    setError('Função não disponível');
    return;
}
const result = await apiClient.createPagamento({ ... });
if (result.error) {
    setError(result.error);
    return;
}
```

**Esforço:** 2 dias  
**Risco:** Médio (novo CRU no backend)

---

### **PRIORIDADE 2: AÇÕES ALTAS (FALHAS FUNCIONAIS) - Semana 2**

---

#### **2.1 🟡 INTEGRAR ROUTER PARCELS.PY COM FRONTEND**

**Por que:** Router foi criado mas nunca integrado. Validação avançada não está disponível.

**Arquivo(s) afetado(s):**

- Criar: `apps/web/src/pages/topografo/ValidarDesenhos.tsx` (nova página)
- Atualizar: `apps/web/src/services/api.ts`

**O que fazer:**

Adicionar ao `api.ts`:

```typescript
async getParcelLayers(parcelId: string) {
    return this.request(`/api/parcels/${parcelId}/layers`, { method: 'GET' });
}

async validateTopographyAdvanced(parcelId: string, notes?: string) {
    return this.request(`/api/parcels/${parcelId}/validate-topography`, {
        method: 'POST',
        body: JSON.stringify({ notes })
    });
}

async getParcelOverlaps(parcelId: string) {
    return this.request(`/api/parcels/${parcelId}/overlaps`, { method: 'GET' });
}
```

Criar `ValidarDesenhos.tsx`:

```tsx
// Página que o topografo usa para validar desenhos dos clientes
// Mostra 4 layers: cliente, oficial, sobreposições, limites
// Permite aprovar ou rejeitar desenho
```

Fluxo:

1. Topografo vai para ValidarDesenhos.tsx
2. Seleciona projeto/lote
3. Carrega layers via `getParcelLayers()` e mapbox
4. Clica "Validar Desenho"
5. Chama `validateTopographyAdvanced()` → status SKETCH_APPROVED
6. Detects overlaps automaticamente

**Esforço:** 2 dias  
**Risco:** Médio (integração com layers geométricos)

---

#### **2.2 🟡 REMOVER SAFE CALLS PERIGOSAS**

**Por que:** Erros silenciosos causam inconsistência de dados.

**Arquivo(s) afetado(s):**

- [Financeiro.tsx](../apps/web/src/pages/topografo/Financeiro.tsx) - Linhas ~220, 228, 251

**O que fazer:**

```typescript
// Antes (PERIGOSO):
await apiClient.updateDespesa?.(id, data);

// Depois (SEGURO):
if (!apiClient.updateDespesa) {
    setError('Função não disponível');
    return;
}
const result = await apiClient.updateDespesa(id, data);
if (result.error) {
    setError(`Erro ao atualizar despesa: ${result.error}`);
    return;
}
setSuccess('Despesa atualizada');
carregarDespesas();
```

Aplicar em:

- `apiClient.updateDespesa?.()`
- `apiClient.createDespesa?.()`
- `apiClient.deleteDespesa?.()`
- `apiClient.getPagamentos?.()`

**Esforço:** 0.5 dias  
**Risco:** Muito baixo

---

#### **2.3 🟡 CHAMAR getSobreposicoesLote() QUANDO LOTE SELECIONADO**

**Por que:** Dashboard não mostra overlaps por lote específico.

**Arquivo(s) afetado(s):**

- Atualizar: [DashboardConfluencia.tsx](../apps/web/src/pages/topografo/DashboardConfluencia.tsx)

**O que fazer:**

```typescript
// Quando usuário clica em um lote da tabela:
const handleSelecionarLote = async (loteId: number) => {
    setLoteSelecionado(loteId);
    
    // ADICIONAR:
    const overlaps = await apiClient.getSobreposicoesLote(String(loteId));
    if (!overlaps.error) {
        setSobreposicoesLote(overlaps.data);
    }
};
```

**Esforço:** 0.5 dia  
**Risco:** Muito baixo

---

### **PRIORIDADE 3: AÇÕES MÉDIAS (LIMPEZA DE CÓDIGO) - Semana 3**

---

#### **3.1 REMOVER FUNÇÕES MORTAS DO API.TS**

**Funções que existem mas nunca são usadas:**

- `getProject(id)` - Use `getProjects()` em vez disso
- `getOrcamento(id)` - Use `getOrcamentos()` em vez disso
- `getDespesa(id)`
- `getLote(id)` - Use `getLotes()` em vez disso

**Alternativa:** Se precisar, começar a usar em modal de detalhes

---

#### **3.2 PADRONIZAR NOMES: PARCELS vs LOTES**

**Problema:** Alguns métodos usam "Parcel", outros usam "Lote"

**Solução:** Manter aliases, mas preferir "Lotes" internamente

```typescript
// Manter como alias:
getParcels = (projectId: string) => this.getLotes(projectId);
getParcel = (id: string) => this.getLote(id);
createParcel = (...) => this.createLote(...);

// Documentar: "Use getLotes() na verdade"
```

---

#### **3.3 VALIDAR VITE_API_URL EM TODAS AS BUILDS**

**Arquivo(s) afetado(s):**

- [api.ts](../apps/web/src/services/api.ts) - Linha 11-14

**O que fazer:**

```typescript
// Adicionar validação mais rigorosa
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    const message = 'VITE_API_URL não configurada';
    console.error(message);
    
    if (import.meta.env.DEV) {
        throw new Error(message);  // Dev: erro imediato
    } else {
        // Prod: redirecionar para página de erro
        window.location.href = '/error?code=CONFIG_ERROR';
    }
}

const client = new ApiClient(API_URL);
```

---

## 📋 SUMÁRIO DE AÇÕES

| Prioridade | Ação | Severidade | Esforço | Dias | Risco |
|---|---|---|---|---|---|
| **P1.1** | Contratos completo | 🔴 CRÍTICO | Alto | 2-3 | Médio |
| **P1.2** | Validação topologia | 🔴 CRÍTICO | Médio | 1 | Baixo |
| **P1.3** | CRUD Pagamentos | 🔴 CRÍTICO | Médio | 2 | Médio |
| **P2.1** | Integrar parcels.py | 🟡 ALTO | Médio | 2 | Médio |
| **P2.2** | Remover safe calls | 🟡 ALTO | Baixo | 0.5 | Muito baixo |
| **P2.3** | getSobreposicoesLote | 🟡 ALTO | Muito baixo | 0.5 | Muito baixo |
| **P3.1** | Remover funções mortas | 🟢 MÉDIO | Baixo | 0.5 | Muito baixo |
| **P3.2** | Padronizar nomes | 🟢 MÉDIO | Baixo | 0.5 | Muito baixo |
| **P3.3** | Validar URL | 🟢 MÉDIO | Muito baixo | 0.25 | Muito baixo |

**Total estimado: 4-5 dias de desenvolvimento**

---

## 🚀 ROADMAP RECOMENDADO

### **Semana 1 (5 dias):**

- ✅ P1.1: Fluxo de contratos (2-3 dias)
- ✅ P1.2: Validação topologia (1 dia)
- ✅ P2.2: Remover safe calls (0.5 dia)
- ✅ P3.3: Validar URL (0.25 dia)

### **Semana 2 (5 dias):**

- ✅ P1.3: CRUD Pagamentos (2 dias)
- ✅ P2.1: Integrar parcels.py (2 dias)
- ✅ P2.3: getSobreposicoesLote (0.5 dia)
- ✅ P3.1: Funções mortas (0.5 dia)
- ✅ P3.2: Nomes padronizados (0.5 dia)

### **Total: 2 sprints (10 dias de dev)**

---

## ✋ RISCOS E MITIGAÇÕES

### **Risco 1: Quebrar fluxos existentes ao adicionar validação**

**Mitigação:**

- Adicionar feature flag para validação topologia
- Fazer em branch separado
- Testar com dados de staging

### **Risco 2: Supabase storage de contratos pode não estar configurado**

**Mitigação:**

- Verificar permissões de escrita em `contract_template` table
- Testar POST /contracts/generate no Postman antes

### **Risco 3: Assinatura digital tem requisitos legais**

**Mitigação:**

- Usar biblioteca standard (ex: OpenPGP.js)
- Documentar hash gerado
- Usar timestamp de servidor

---

## 📞 PRÓXIMAS ETAPAS

1. **Priorizar:** Qual é mais importante para o negócio? (Contratos vs Pagamentos)
2. **Planning:** Reunião com tech lead para validar estimativas
3. **Testing:** Preparar testes automatizados e casos de teste manual
4. **Deploy:** Strategy de rollout (feature flags, canary, etc)
