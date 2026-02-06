# 📋 Implementação do Fluxo de Contrato - Resumo Técnico

## ✅ O que foi criado

### 1️⃣ **Backend (Python/FastAPI)**

#### 📁 Arquivo: `apps/api/routers/contracts.py`

Contém 4 endpoints principais:

```python
# 1. GERAR CONTRATO A PARTIR DE ORÇAMENTO
POST /api/contracts/generate
  Request:
    - orcamento_id: int (ID do orçamento)
    - projeto_id: int (ID do projeto)
    - lote_id: int? (ID do lote, opcional)
    - valor: float? (valor do serviço)
  
  Response:
    - contract_id: UUID
    - html_content: string (contrato HTML renderizado)
    - preview_url: string (data URI para preview)
    - template_version: string
    - created_at: ISO datetime


# 2. ASSINAR CONTRATO (com prova de assinatura)
POST /api/contracts/sign
  Request:
    - contract_id: UUID
    - orcamento_id: int
    - signature_hash: string (SHA-256 proof)
    - ip_address: string? (IP do signatário)
    - user_agent: string? (browser info)
  
  Response:
    - acceptance_id: UUID
    - status: "ASSINADO"
    - accepted_at: ISO datetime
    - contract_hash: string
    - signature_hash: string


# 3. OBTER CONTRATO
GET /api/contracts/{contract_id}
  Response: ContractTemplateResponse (HTML + metadata)


# 4. OBTER CONTRATO POR ORÇAMENTO
GET /api/contracts/orcamento/{orcamento_id}
  Response:
    - contract_id
    - html_content
    - is_signed: bool
    - acceptances: array (histórico de assinaturas)
```

#### 📄 Arquivo: `apps/api/templates/contract_base_pt_BR.html`

Template do contrato em português com **50+ placeholders**:

```markdown
Placeholders disponíveis:
  - {{data_geracao}}, {{data_geracao_extenso}}
  - {{nome_cliente}}, {{cpf_cnpj_cliente}}, {{email_cliente}}, {{telefone_cliente}}
  - {{nome_projeto}}, {{descricao_projeto}}, {{municipio}}, {{estado}}
  - {{nome_lote}}, {{observacoes_orcamento}}
  - {{valor_formatado}}, {{valor_extenso}}, {{status_orcamento}}
  - {{nome_topografo}}, {{email_topografo}}, {{telefone_topografo}}
  - {{template_version}}, {{contract_hash}}
  - {{termos_pagamento}}, {{data_entrega_estimada}}
  - {{signature_hash}}, {{ip_assinatura}}, {{timestamp_assinatura}}
```

#### 🔌 Integração com `main.py`

```python
# Import do router
from routers.contracts import router as contracts_router

# Registro do router (antes de if __name__)
app.include_router(contracts_router)

# Resultado: Todos os endpoints `/api/contracts/*` ficam disponíveis
```

---

### 2️⃣ **Documentação & Planejamento**

#### 📋 Arquivo: `CONTRACT_FLOW.md`

Documento completo com:

- ✅ Fluxo visual (7 passos)
- ✅ Estrutura de arquivos
- ✅ Dados necessários
- ✅ Schemas de request/response
- ✅ Segurança e auditoria
- ✅ Status flow do orçamento

---

## 📦 O que falta para COMPLETAR (Frontend)

### ❌ Ainda precisa ser criado

```
Frontend:
├── services/api.ts
│   ├── generateContract(orcamentoId, projetoId, loteId?, valor?)
│   ├── signContract(contractId, orcamentoId, signatureHash)
│   └── getContractByOrcamento(orcamentoId)
│
├── components/
│   ├── ContractModal.tsx
│   │   ├── Preview do HTML do contrato
│   │   ├── Botões: Download PDF, Editar, Cancelar
│   │   ├── Checkbox: "Confirmo os termos"
│   │   └── Botão: "Assinar e Prosseguir"
│   │
│   └── ContractSignature.tsx
│       ├── Input de assinatura (digitada ou digital)
│       └── Geração do hash SHA-256
│
├── pages/topografo/
│   ├── Orcamentos.tsx (ADICIONAR)
│   │   └── Botão "Gerar Contrato" em cada orçamento
│   │
│   └── ContractPreview.tsx (NOVO - opcional)
│       ├── Página dedicated para preview
│       └── Redirect após assinatura
│
└── styles/
    └── Contract.css (estilos do preview modal)
```

---

## 🔄 Fluxo Prático - Passo a Passo

### **Usuário Topografo:**

```
1. Acessa "Orcamentos" → Vê lista de orçamentos
2. Clica "Gerar Contrato" em um orçamento
3. Frontend faz POST /api/contracts/generate
4. Backend retorna HTML do contrato
5. Frontend abre Modal com preview (HTML renderizado)
6. Topografo pode:
   - Ver contrato completo
   - Baixar como PDF (usando html2pdf library)
   - Editar (volta ao formulário)
   - Cancelar
7. Clica "Aceitar Termos" (checkbox)
8. Clica "Assinar Contrato"
9. Frontend gera signature_hash = SHA-256(contrato + timestamp)
10. Frontend faz POST /api/contracts/sign
11. Backend salva prova em contract_acceptance (com IP, timestamp, hash)
12. Backend retorna sucesso
13. Frontend mostra "Contrato Assinado!" com link para download
14. Status do orçamento muda para: CONTRATO_ASSINADO
```

---

## 🗄️ Banco de Dados - O que JÁ está pronto

### Tabelas (criadas via migration `001_initial_schema.py`)

```sql
-- Tabela 1: Template do Contrato (versionado)
CREATE TABLE contract_template (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant,
  version VARCHAR(50) NOT NULL,
  hash VARCHAR(64) NOT NULL,          -- SHA-256 do conteúdo
  body TEXT NOT NULL,                 -- HTML completo
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, version)
);

-- Tabela 2: Prova de Assinatura (auditoria)
CREATE TABLE contract_acceptance (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES project,
  parcel_id UUID NOT NULL REFERENCES parcel,
  user_id UUID REFERENCES app_user,
  template_version VARCHAR(50) NOT NULL,
  accepted_at TIMESTAMP DEFAULT NOW(),
  ip INET,                            -- IP do signatário
  signature_hash VARCHAR(256)         -- Hash da assinatura
);
```

---

## 📝 Alterações Necessárias no Orcamento

Tabela `orcamentos` precisa de 2 campos novos:

```sql
ALTER TABLE orcamentos ADD COLUMN contract_id UUID REFERENCES contract_template;
ALTER TABLE orcamentos ADD COLUMN contract_status VARCHAR(50);
  -- Valores: NULL, CONTRATO_GERADO, CONTRATO_VISUALIZADO, CONTRATO_ACEITO, CONTRATO_ASSINADO
```

**Ou via Supabase UI:**

- Open `orcamentos` table
- Add column: `contract_id` (UUID, nullable)
- Add column: `contract_status` (Text, nullable)

---

## 🔐 Segurança & Auditoria

### ✅ Implementado

1. **Assinatura com Hash SHA-256**: Não armazena senha ou assinatura digital (MVP seguro)
2. **Rastreamento de IP**: `contract_acceptance.ip` salva IP do signatário
3. **Timestamp**: `contract_acceptance.accepted_at` registra quando foi assinado
4. **Versionamento**: `contract_template.version` permite rastreabilidade
5. **Imutabilidade**: Contrato assinado não pode ser editado (read-only)
6. **User Audit Trail**: `contract_acceptance.user_id` identifica quem assinou

### 🔮 Futuro (Não-MVP)

- Assinatura digital com certificado (ICP-Brasil)
- Timestamp server (RFC 3161)
- Blockchain para prova incontestável
- E-mail com link do contrato + recibo

---

## 🛠️ Dependências Python Necessárias

Já estão instaladas (verificar em `apps/api/requirements.txt`):

- ✅ `fastapi` (routers)
- ✅ `sqlalchemy` (models)
- ✅ `pydantic` (schemas)
- ✅ `python-jose` (JWT)
- ✅ `supabase` (banco de dados)

### Possivelmente faltando

```bash
pip install num2words  # Para extensão númerica (ex: 100 → "cem")
```

---

## 📋 Checklist de Implementação

### Backend ✅ PRONTO

- [x] Criar router `/api/contracts`
- [x] Endpoint `POST /api/contracts/generate`
- [x] Endpoint `POST /api/contracts/sign`
- [x] Endpoint `GET /api/contracts/{id}`
- [x] Endpoint `GET /api/contracts/orcamento/{id}`
- [x] Template base em português
- [x] Função de substituição de placeholders
- [x] Hash SHA-256 da prova
- [x] Integração com Supabase
- [x] Registrar router em main.py

### Frontend ❌ PRECISA FAZER

- [ ] Adicionar métodos em `services/api.ts`
  - [ ] `generateContract(...)`
  - [ ] `signContract(...)`
  - [ ] `getContractByOrcamento(...)`
- [ ] Criar `components/ContractModal.tsx`
- [ ] Criar `components/ContractSignature.tsx`
- [ ] Adicionar botão "Gerar Contrato" em `Orcamentos.tsx`
- [ ] Criar `styles/Contract.css`
- [ ] Testar fluxo completo
- [ ] Adicionar download PDF (html2pdf)
- [ ] Notificação por email (futuro)

### Database ⚠️ VERIFICAR

- [ ] Adicionar coluna `contract_id` em `orcamentos`
- [ ] Adicionar coluna `contract_status` em `orcamentos`
- [ ] Verificar migration

---

## 🎯 Próximas Ações

### Imediato (hoje)

1. ✅ Criar router de contratos → **FEITO**
2. ✅ Criar template do contrato → **FEITO**
3. ✅ Documentar fluxo → **FEITO**
4. ❌ Implementar frontend
5. ❌ Testar integração

### Médio prazo

- [ ] Download PDF do contrato
- [ ] Email com link do contrato
- [ ] Dashboard de contratos assinados
- [ ] Relatório financeiro

### Longo prazo

- [ ] Assinatura digital com certificado
- [ ] Integração com payments (Stripe/PayPal)
- [ ] Workflow de aprovação
- [ ] Templates customizáveis por cliente

---

## 📊 Exemplo de Uso via cURL

```bash
# 1. Gerar contrato
curl -X POST http://localhost:8000/api/contracts/generate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "orcamento_id": 123,
    "projeto_id": 1,
    "lote_id": 456,
    "valor": 50000.00
  }'

# Response:
{
  "contract_id": "550e8400-e29b-41d4-a716-446655440000",
  "html_content": "<html>...</html>",
  "preview_url": "data:text/html;base64,...",
  "template_version": "1.0",
  "created_at": "2025-02-05T10:30:00Z"
}

# 2. Assinar contrato
curl -X POST http://localhost:8000/api/contracts/sign \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "550e8400-e29b-41d4-a716-446655440000",
    "orcamento_id": 123,
    "signature_hash": "abc123def456...",
    "ip_address": "192.168.1.1"
  }'

# Response:
{
  "acceptance_id": "660e8400-e29b-41d4-a716-446655440000",
  "status": "ASSINADO",
  "accepted_at": "2025-02-05T10:35:00Z"
}
```

---

## 📚 Arquivos Criados

```
✅ BACKEND:
  - /apps/api/routers/contracts.py (350+ linhas)
  - /apps/api/routers/__init__.py (init file)
  - /apps/api/templates/contract_base_pt_BR.html (350+ linhas)
  - /apps/api/main.py (ATUALIZADO: import + register router)

✅ DOCUMENTAÇÃO:
  - /CONTRACT_FLOW.md (150+ linhas)
  - /CONTRACT_IMPLEMENTATION.md (este arquivo)

❌ FRONTEND (ainda não criado):
  - /apps/web/services/api.ts (adicionar 3 métodos)
  - /apps/web/components/ContractModal.tsx
  - /apps/web/components/ContractSignature.tsx
  - /apps/web/pages/topografo/Orcamentos.tsx (ATUALIZAR)
  - /apps/web/styles/Contract.css
```

---

## 🚀 Próximo Passo

**Quer que eu crie o frontend agora?**

Preciso implementar:

1. Métodos de API em `services/api.ts`
2. Modal de preview do contrato
3. Componente de assinatura
4. Botão "Gerar Contrato" em Orcamentos
5. Estilos CSS

Quer começar? Comanda: `*faça o frontend do contrato*`

---

**Criado em**: 2025-02-05  
**Status**: Backend ✅ Pronto | Frontend ❌ Aguardando  
**Próximo**: Frontend Implementation
