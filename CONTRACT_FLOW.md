# 📝 Fluxo de Contrato - AtivoReal

## 📋 Visão Geral

O contrato será preenchido com dados do **orçamento** e **projeto** e armazenado em dois locais:

1. **Banco de Dados** - `contract_template` (template versionado)
2. **Storage** - Supabase Storage ou arquivo local (contrato gerado em PDF)

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. TOPOGRAFO preenche ORÇAMENTO (Orcamentos.tsx)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Form Data:                                                    │
│   - projeto_id: número                                          │
│   - lote_id: número (opcional)                                  │
│   - valor: float (valor do serviço)                             │
│   - status: RASCUNHO | ENVIADO | APROVADO                       │
│   - observacoes: texto                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. TOPOGRAFO clica "Gerar Contrato" (Action) em Orcamentos      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Dados enviados ao Backend:                                    │
│   POST /api/contracts/generate                                  │
│   {                                                             │
│     orcamento_id: número,                                       │
│     projeto_id: número,                                         │
│     lote_id: número,                                            │
│     valor: float                                                │
│   }                                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKEND processa:                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   a) Busca dados do projeto + lote + cliente                    │
│   b) Carrega TEMPLATE DE CONTRATO base                          │
│   c) Substitui placeholders: {{nome_cliente}}, {{valor}}, etc.  │
│   d) Gera versão HTML/MD do contrato                            │
│   e) Salva no BD: contract_template                             │
│   f) Retorna URL do contrato para preview                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND exibe PREVIEW do Contrato (Modal/Nova Página)       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   - Mostra HTML rendido do contrato                             │
│   - Opções: Download PDF, Editar, Cancelar, Prosseguir          │
│   - Checkbox: "Confirmo os termos do contrato"                  │
│   - Botão: "Assinar e Prosseguir"                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. TOPOGRAFO firma assinatura digital                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   POST /api/contracts/sign                                      │
│   {                                                             │
│     contract_id: uuid,                                          │
│     orcamento_id: número,                                       │
│     signature_hash: string (hash da assinatura)                 │
│     ip_address: string,                                         │
│     user_agent: string                                          │
│   }                                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND salva EVIDÊNCIA de assinatura                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Salva em: contract_acceptance                                 │
│   {                                                             │
│     project_id: uuid,                                           │
│     parcel_id: uuid,        (lote_id convertido)                │
│     user_id: uuid,          (topografo logado)                  │
│     template_version: "1.0",                                    │
│     accepted_at: datetime,                                      │
│     ip: ip_address,                                             │
│     signature_hash: hash                                        │
│   }                                                             │
│                                                                  │
│   Retorna: sucesso + URL para download PDF                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. FRONTEND mostra CONCLUSÃO                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   - "Contrato assinado com sucesso!"                            │
│   - Links: Download PDF, Voltar, Próximo Passo                  │
│   - Atualiza status do orçamento para: ACEITO_CONTRATO          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Arquivos

```
├── Backend
│   ├── main.py                          (adicionar endpoints de contrato)
│   ├── models.py                        (✓ ContractTemplate, ContractAcceptance)
│   ├── schemas.py                       (✓ ContractAcceptRequest, etc.)
│   ├── routers/
│   │   └── contracts.py                 (NOVO - endpoints de contrato)
│   └── templates/
│       └── contract_base_pt_BR.md       (NOVO - template base do contrato)
│
├── Frontend
│   ├── services/api.ts                  (adicionar métodos de contrato)
│   ├── pages/topografo/
│   │   ├── Orcamentos.tsx               (adicionar botão "Gerar Contrato")
│   │   └── ContractPreview.tsx          (NOVO - página de preview)
│   ├── components/
│   │   └── ContractModal.tsx            (NOVO - modal de preview)
│   └── styles/
│       └── Contract.css                 (NOVO - estilos do contrato)
│
└── Database
    └── Supabase Storage
        └── contratos/
            ├── templates/               (templates versionados)
            ├── signed/                  (PDFs assinados)
            └── evidence/                (provas de assinatura)
```

## 🗄️ Armazenamento

### 1. Database (PostgreSQL)

- **contract_template**: Contrato gerado (versionado)
- **contract_acceptance**: Prova de assinatura (IP, timestamp, hash)

### 2. Supabase Storage

- **Path**: `contratos/templates/{tenant_id}/{contract_id}.md` (markdown)
- **Path**: `contratos/signed/{tenant_id}/{contract_id}.pdf` (PDF gerado)
- **Path**: `contratos/evidence/{tenant_id}/{acceptance_id}.json` (prova de assinatura)

### 3. Arquivo de Referência (Template Base)

- **Path**: `apps/api/templates/contract_base_pt_BR.md`
- **Conteúdo**: Template markdown com placeholders para substituição

## 🔑 Placeholders do Contrato

```markdown
# CONTRATO DE SERVIÇOS DE TOPOGRAFIA

**Data**: {{data}}
**Contratante**: {{nome_cliente}}
**CPF/CNPJ**: {{cpf_cnpj}}
**Email**: {{email_cliente}}
**Telefone**: {{telefone_cliente}}

**Projeto**: {{nome_projeto}}
**Valor Total**: {{valor_formatado}}
**Status**: {{status_orcamento}}

**Descrição dos Serviços**:
{{observacoes_orcamento}}

**Termos e Condições**:
1. O serviço será executado conforme as especificações acima
2. O pagamento será feito em [X] parcelas
3. Validade: 30 dias
4. [... mais termos...]

**Data de Geração**: {{data_geracao}}
**Versão do Template**: {{template_version}}
```

## 📦 Request/Response Schemas

### POST /api/contracts/generate

```json
{
  "orcamento_id": 123,
  "projeto_id": 1,
  "lote_id": 456,
  "valor": 50000.00
}
```

**Response**:

```json
{
  "contract_id": "uuid-here",
  "orcamento_id": 123,
  "html_content": "<html>...</html>",
  "preview_url": "data:text/html;base64,...",
  "template_version": "1.0",
  "created_at": "2025-02-05T10:30:00Z"
}
```

### POST /api/contracts/sign

```json
{
  "contract_id": "uuid-here",
  "orcamento_id": 123,
  "signature_hash": "sha256_hash_of_signature",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Response**:

```json
{
  "acceptance_id": "uuid-here",
  "status": "ASSINADO",
  "accepted_at": "2025-02-05T10:35:00Z",
  "pdf_url": "https://storage.supabase.co/...",
  "signature_hash": "sha256_hash"
}
```

## 📋 Dados Necessários do Formulário

### Orçamento (Fonte: Orcamentos.tsx)

- projeto_id ✓
- lote_id (opcional) ✓
- valor ✓
- status ✓
- observacoes ✓

### Projeto (Buscar do BD)

- nome_projeto ✓
- descricao ✓

### Cliente/Lote (Buscar do BD)

- nome_cliente
- cpf_cnpj_cliente
- email_cliente
- telefone_cliente

## 🛠️ Implementação Passo a Passo

### PASSO 1: Backend

[ ] Criar `routers/contracts.py` com 2 endpoints
    [ ] `POST /api/contracts/generate` - Gerar contrato a partir de orçamento
    [ ] `POST /api/contracts/sign` - Salvar assinatura
[ ] Criar template base: `templates/contract_base_pt_BR.md`
[ ] Implementar função de substituição de placeholders

### PASSO 2: Frontend

[ ] Adicionar botão "Gerar Contrato" em `Orcamentos.tsx`
[ ] Criar `ContractModal.tsx` - Modal de preview do contrato
[ ] Criar `ContractPreview.tsx` - Página navegável (opcional)
[ ] Adicionar métodos em `services/api.ts`
[ ] Adicionar CSS para estilo do contrato

### PASSO 3: Integração

[ ] Testar fluxo completo: Orçamento → Contrato → Assinatura
[ ] Implementar download PDF (usando library como `html2pdf`)
[ ] Adicionar validações

### PASSO 4: Storage

[ ] Configurar pasta em Supabase Storage
[ ] Implementar upload de contrato gerado
[ ] Implementar upload de prova de assinatura

## 🔐 Segurança

1. **Assinatura**: Hash SHA-256 de prova, não assinatura digital (para MVP)
2. **Auditoria**: IP + timestamp + user_agent salvos em `contract_acceptance`
3. **Versionamento**: Template versionado permite rastreabilidade
4. **Imutabilidade**: Contrato assinado não pode ser editado (read-only após assinatura)

## 📊 Status Flow

```
Orçamento
  RASCUNHO
    ↓ [Gerar Contrato]
  CONTRATO_GERADO
    ↓ [Preview]
  CONTRATO_VISUALIZADO
    ↓ [Aceitar Termos]
  CONTRATO_ACEITO
    ↓ [Assinar]
  CONTRATO_ASSINADO
    ↓ [Próximo Passo = Pagamento]
  PAGAMENTO_PENDENTE
```

## 🎯 Próximas Integrações

- [ ] Pagamento (após assinatura do contrato)
- [ ] Notificação por email com link do contrato
- [ ] Dashboard de contratos assinados
- [ ] Relatório financeiro com contratos
- [ ] Assinatura digital com certificado digital (futuro)

---

**Criado em**: 2025-02-05
**Versão**: 1.0
**Status**: Planejamento
