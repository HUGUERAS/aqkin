// ========== PROJECT STATUSES ==========
export const PROJECT_STATUSES = {
  RASCUNHO: {
    label: 'Rascunho',
    icon: '📝',
    color: '#f5c842',
    backgroundColor: '#fffbea',
    textColor: '#5d4e00',
  },
  EM_ANDAMENTO: {
    label: 'Em Andamento',
    icon: '🚀',
    color: '#2196f3',
    backgroundColor: '#e3f2fd',
    textColor: '#0d47a1',
  },
  CONCLUIDO: {
    label: 'Concluído',
    icon: '✅',
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
    textColor: '#1b5e20',
  },
  ARQUIVADO: {
    label: 'Arquivado',
    icon: '📦',
    color: '#9e9e9e',
    backgroundColor: '#f5f5f5',
    textColor: '#424242',
  },
} as const;

export type ProjectStatusKey = keyof typeof PROJECT_STATUSES;

// ========== ORCAMENTO STATUSES ==========
export const ORCAMENTO_STATUSES = {
  RASCUNHO: {
    label: 'Rascunho',
    icon: '📝',
    color: '#f5c842',
    backgroundColor: '#fffbea',
    textColor: '#5d4e00',
  },
  ENVIADO: {
    label: 'Enviado',
    icon: '📤',
    color: '#2196f3',
    backgroundColor: '#e3f2fd',
    textColor: '#0d47a1',
  },
  APROVADO: {
    label: 'Aprovado',
    icon: '✅',
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
    textColor: '#1b5e20',
  },
  REJEITADO: {
    label: 'Rejeitado',
    icon: '❌',
    color: '#f44336',
    backgroundColor: '#ffebee',
    textColor: '#b71c1c',
  },
  CANCELADO: {
    label: 'Cancelado',
    icon: '🚫',
    color: '#9e9e9e',
    backgroundColor: '#f5f5f5',
    textColor: '#424242',
  },
} as const;

export type OrcamentoStatusKey = keyof typeof ORCAMENTO_STATUSES;

// ========== PROJECT TYPES ==========
export const PROJECT_TYPES = {
  INDIVIDUAL: { label: 'Individual', description: 'Projeto para imóvel individual' },
  DESMEMBRAMENTO: { label: 'Desmembramento', description: 'Divisão de propriedade' },
  LOTEAMENTO: { label: 'Loteamento', description: 'Divisão em múltiplos lotes' },
  RETIFICACAO: { label: 'Retificação', description: 'Correção de limites' },
} as const;

export type ProjectTypeKey = keyof typeof PROJECT_TYPES;

// ========== VALIDATION RULES ==========
export const VALIDATION_RULES = {
  PROJECT_NAME_MIN: 3,
  PROJECT_NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  VALOR_MIN: 0.01,
  VALOR_MAX: 9999999.99,
  PHONE_PATTERN: /^\d{10,11}$/,
  CPF_CNPJ_PATTERN: /^\d{11,14}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// ========== API CONFIG ==========
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '',
  TIMEOUT_MS: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 300,
  MAX_RETRY_DELAY_MS: 2000,
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;

// ========== UI CONFIG ==========
export const UI_CONFIG = {
  TOAST_DURATION_MS: 3000,
  MODAL_ANIMATION_MS: 300,
  PAGINATION_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
} as const;

// ========== ERROR MESSAGES ==========
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field: string) => `${field} é obrigatório`,
  MIN_LENGTH: (field: string, min: number) => `${field} deve ter ${min}+ caracteres`,
  MAX_LENGTH: (field: string, max: number) => `${field} deve ter no máximo ${max} caracteres`,
  INVALID_FORMAT: (field: string) => `${field} tem formato inválido`,
  POSITIVE_VALUE: 'Valor deve ser positivo',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente.',
  UNAUTHORIZED: 'Você não tem permissão para acessar isso.',
  NOT_FOUND: 'Recurso não encontrado.',
  ALREADY_EXISTS: 'Este recurso já existe.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
} as const;

// ========== SUCCESS MESSAGES ==========
export const SUCCESS_MESSAGES = {
  CREATED: (entity: string) => `${entity} criado com sucesso!`,
  UPDATED: (entity: string) => `${entity} atualizado com sucesso!`,
  DELETED: (entity: string) => `${entity} deletado com sucesso!`,
  OPERATION_COMPLETED: 'Operação concluída com sucesso!',
} as const;
