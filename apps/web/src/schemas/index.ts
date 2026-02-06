import { z } from 'zod';

// ========== PROJECT SCHEMAS ==========
export const ProjectStatusSchema = z.enum([
    'RASCUNHO',
    'EM_ANDAMENTO',
    'CONCLUIDO',
    'ARQUIVADO',
]);

export const ProjectTypeSchema = z.enum([
    'INDIVIDUAL',
    'DESMEMBRAMENTO',
    'LOTEAMENTO',
    'RETIFICACAO',
]);

export const ProjetoSchema = z.object({
    id: z.number(),
    nome: z.string().min(3, 'Nome deve ter 3+ caracteres'),
    descricao: z.string().optional().nullable(),
    tipo: ProjectTypeSchema,
    status: ProjectStatusSchema,
    criado_em: z.string().datetime().optional().nullable(),
    atualizado_em: z.string().datetime().optional().nullable(),
});

export const ProjetoCreateSchema = ProjetoSchema.pick({
    nome: true,
    descricao: true,
    tipo: true,
}).extend({
    descricao: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export const ProjetoUpdateSchema = ProjetoCreateSchema.partial();

export type Projeto = z.infer<typeof ProjetoSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

// ========== ORCAMENTO SCHEMAS ==========
export const OrcamentoStatusSchema = z.enum([
    'RASCUNHO',
    'ENVIADO',
    'APROVADO',
    'REJEITADO',
    'CANCELADO',
]);

export const OrcamentoSchema = z.object({
    id: z.number(),
    projeto_id: z.number().optional().nullable(),
    lote_id: z.number().optional().nullable(),
    valor: z.number().positive('Valor deve ser positivo').max(9999999, 'Valor muito alto'),
    status: OrcamentoStatusSchema,
    observacoes: z.string().optional().nullable(),
    criado_em: z.string().datetime().optional(),
    atualizado_em: z.string().datetime().optional(),
});

export const OrcamentoCreateSchema = z.object({
    projeto_id: z.number().optional().nullable(),
    lote_id: z.number().optional().nullable(),
    valor: z.number().positive('Valor deve ser positivo').max(9999999),
    status: OrcamentoStatusSchema.default('RASCUNHO'),
    observacoes: z.string().max(500).optional(),
});

export const OrcamentoUpdateSchema = OrcamentoCreateSchema.partial();

export type Orcamento = z.infer<typeof OrcamentoSchema>;
export type OrcamentoStatus = z.infer<typeof OrcamentoStatusSchema>;

// ========== API RESPONSE SCHEMAS ==========
export const ApiResponseSchema = z.object({
    data: z.unknown().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
    data: z.array(z.unknown()),
    pagination: z.object({
        skip: z.number(),
        limit: z.number(),
        total: z.number(),
        hasMore: z.boolean(),
    }),
});

// ========== VALIDATION HELPERS ==========
export const validateProjectResponse = (data: unknown) => {
    return ProjetoSchema.safeParse(data);
};

export const validateProjectsResponse = (data: unknown) => {
    return z.array(ProjetoSchema).safeParse(data);
};

export const validateOrcamentoResponse = (data: unknown) => {
    return OrcamentoSchema.safeParse(data);
};

export const validateOrcamentosResponse = (data: unknown) => {
    return z.array(OrcamentoSchema).safeParse(data);
};

// ========== DESPESA SCHEMAS ==========
export const DespesaCategorySchema = z.enum([
    'MATERIAL',
    'SERVICO',
    'TRANSPORTE',
    'OUTROS',
]);

export const DespesaSchema = z.object({
    id: z.number(),
    projeto_id: z.number(),
    descricao: z.string().min(3, 'Descrição deve ter 3+ caracteres'),
    valor: z.number().positive('Valor deve ser positivo').max(9999999),
    data: z.string().date(),
    categoria: DespesaCategorySchema.default('OUTROS'),
    observacoes: z.string().optional().nullable(),
    criado_em: z.string().datetime().optional(),
    atualizado_em: z.string().datetime().optional(),
});

export const DespesaCreateSchema = z.object({
    projeto_id: z.number(),
    descricao: z.string().min(3, 'Descrição obrigatória (3+ chars)'),
    valor: z.number().positive('Valor deve ser > 0').max(9999999),
    data: z.string().date(),
    categoria: DespesaCategorySchema.default('OUTROS'),
    observacoes: z.string().max(500).optional(),
});

export const DespesaUpdateSchema = DespesaCreateSchema.partial();

export type Despesa = z.infer<typeof DespesaSchema>;
export type DespesaCategory = z.infer<typeof DespesaCategorySchema>;

// ========== PAGAMENTO SCHEMAS ==========
export const PagamentoStatusSchema = z.enum([
    'PAGO',
    'PROCESSANDO',
    'PENDENTE',
    'FALHA',
]);

export const PagamentoSchema = z.object({
    id: z.number(),
    lote_id: z.number(),
    valor_total: z.number().positive(),
    valor_pago: z.number().nonnegative(),
    status: PagamentoStatusSchema,
    gateway_id: z.string().optional().nullable(),
    data_pagamento: z.string().datetime().optional().nullable(),
    criado_em: z.string().datetime().optional(),
});

export type Pagamento = z.infer<typeof PagamentoSchema>;
export type PagamentoStatus = z.infer<typeof PagamentoStatusSchema>;

// ========== DESPESA VALIDATION HELPERS ==========
export const validateDespesaResponse = (data: unknown) => {
    return DespesaSchema.safeParse(data);
};

export const validateDespesasResponse = (data: unknown) => {
    return z.array(DespesaSchema).safeParse(data);
};

export const validatePagamentosResponse = (data: unknown) => {
    return z.array(PagamentoSchema).safeParse(data);
};
