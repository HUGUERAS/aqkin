import { reportError } from '../utils/telemetry';
import {
  DespesasSchema,
  LotesSchema,
  OrcamentosSchema,
  PagamentosSchema,
  ProjectsSchema,
} from './schemas';
import type { ZodType } from 'zod';

// FastAPI Backend URL (Ativo Real) - OBRIGATÓRIO, nunca localhost
const API_URL = import.meta.env.VITE_API_URL ?? '';
if (!API_URL && import.meta.env.DEV) {
  console.error('VITE_API_URL é obrigatório. Configure em .env (URL do deploy da API).');
}

type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryOnStatuses?: number[];
};

type RequestOptions = RequestInit & {
  timeoutMs?: number;
  retry?: RetryOptions;
};

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY: Required<RetryOptions> = {
  retries: 2,
  baseDelayMs: 300,
  maxDelayMs: 2000,
  retryOnStatuses: [408, 429, 500, 502, 503, 504],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeHeaders = (headers?: HeadersInit): Record<string, string> => {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }
  return { ...headers };
};

const parseJsonSafe = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const extractErrorMessage = (payload: unknown): string => {
  if (!payload) return 'Erro na requisição';
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    const record = payload as { detail?: string; message?: string; error?: string };
    return record.detail || record.message || record.error || 'Erro na requisição';
  }
  return 'Erro na requisição';
};

const isIdempotent = (method: string) => method === 'GET' || method === 'HEAD';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

type ZodSchema<T> = ZodType<T>;

const validateResponse = <T>(schema: ZodSchema<T>, response: ApiResponse<unknown>, context: string): ApiResponse<T> => {
  if (response.error) return { error: response.error };
  const parsed = schema.safeParse(response.data);
  if (!parsed.success) {
    reportError(parsed.error, { context });
    return { error: 'Resposta invalida do servidor' };
  }
  return { data: parsed.data };
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...normalizeHeaders(options.headers),
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const { timeoutMs = DEFAULT_TIMEOUT_MS, retry, ...fetchOptions } = options;
    const method = (fetchOptions.method || 'GET').toUpperCase();
    const retryConfig = { ...DEFAULT_RETRY, ...(retry ?? {}) };
    const shouldRetry = isIdempotent(method);
    let attempt = 0;

    try {
      while (true) {
        attempt += 1;
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return { error: 'Sem conexão com a internet' };
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(url, { ...fetchOptions, headers, signal: controller.signal });
          const payload = await parseJsonSafe(response);

          if (!response.ok) {
            if (response.status === 401) this.clearToken();
            const errorMessage = extractErrorMessage(payload);

            if (shouldRetry && attempt <= retryConfig.retries && retryConfig.retryOnStatuses.includes(response.status)) {
              const delay = Math.min(retryConfig.baseDelayMs * 2 ** (attempt - 1), retryConfig.maxDelayMs);
              await sleep(delay + Math.floor(Math.random() * 100));
              continue;
            }

            return { error: errorMessage };
          }

          return { data: payload as T };
        } catch (error) {
          const isTimeout = error instanceof DOMException && error.name === 'AbortError';
          const errorMessage = isTimeout
            ? 'Tempo limite excedido'
            : error instanceof Error
              ? error.message
              : 'Erro de conexão';

          if (shouldRetry && attempt <= retryConfig.retries && !isTimeout) {
            const delay = Math.min(retryConfig.baseDelayMs * 2 ** (attempt - 1), retryConfig.maxDelayMs);
            await sleep(delay + Math.floor(Math.random() * 100));
            continue;
          }

          reportError(error, { url, method, attempt });
          return { error: errorMessage };
        } finally {
          window.clearTimeout(timeoutId);
        }
      }
    } catch (error) {
      reportError(error, { url, method, attempt });
      return { error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // ==================== AUTH ====================
  logout() {
    this.clearToken();
  }

  async setPerfilRole(role: 'topografo' | 'proprietario') {
    return this.request('/api/perfis/set-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async getPerfilMe() {
    return this.request<{ user_id: string; email?: string; role: string }>('/api/perfis/me');
  }

  // ==================== PROJETOS ====================
  async getProjects() {
    const response = await this.request<unknown[]>('/api/projetos', { method: 'GET' });
    return validateResponse(ProjectsSchema, response, 'getProjects');
  }

  async getProject(id: number | string) {
    return this.request<unknown>(`/api/projetos/${id}`, { method: 'GET' });
  }

  async createProject(data: { nome: string; descricao?: string; tipo?: string }) {
    return this.request('/api/projetos', {
      method: 'POST',
      body: JSON.stringify({ ...data, tipo: data.tipo || 'INDIVIDUAL' }),
    });
  }

  async updateProject(id: number | string, data: { nome?: string; descricao?: string; tipo?: string; status?: string }) {
    return this.request(`/api/projetos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number | string) {
    return this.request(`/api/projetos/${id}`, { method: 'DELETE' });
  }

  // ==================== LOTES ====================
  async getLotes(projetoId: number | string) {
    const response = await this.request<unknown[]>(`/api/lotes?projeto_id=${projetoId}`, { method: 'GET' });
    return validateResponse(LotesSchema, response, 'getLotes');
  }

  async getLote(id: number | string) {
    return this.request<unknown>(`/api/lotes/${id}`, { method: 'GET' });
  }

  async getLotePorToken(token: string) {
    return this.request<unknown>(`/api/acesso-lote?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  }

  async createLote(data: {
    projeto_id: number;
    nome_cliente: string;
    email_cliente?: string;
    cpf_cnpj_cliente?: string;
    geom_wkt?: string;
  }) {
    return this.request('/api/lotes', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLoteGeometria(loteId: number | string, geom_wkt: string) {
    return this.request(`/api/lotes/${loteId}/geometria`, {
      method: 'PUT',
      body: JSON.stringify({ geom_wkt }),
    });
  }

  async updateLoteStatus(loteId: number | string, status: string) {
    return this.request(`/api/lotes/${loteId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async validarTopologia(loteId: number | string, geom_wkt?: string) {
    return this.request<{ valido: boolean; erros: unknown[]; avisos: unknown[] }>(
      `/api/lotes/${loteId}/validar-topologia`,
      {
        method: 'POST',
        body: JSON.stringify(geom_wkt ? { geom_wkt } : {}),
      }
    );
  }

  // ==================== SOBREPOSIÇÕES ====================
  async getSobreposicoesProjeto(projetoId: number | string) {
    return this.request<unknown[]>(`/api/projetos/${projetoId}/sobreposicoes`, { method: 'GET' });
  }

  async getSobreposicoesLote(loteId: number | string) {
    return this.request<unknown[]>(`/api/lotes/${loteId}/sobreposicoes`, { method: 'GET' });
  }

  // ==================== VIZINHOS ====================
  async getVizinhos(loteId: number | string) {
    return this.request<unknown[]>(`/api/lotes/${loteId}/vizinhos`, { method: 'GET' });
  }

  async addVizinho(loteId: number | string, nome_vizinho: string, lado: string) {
    return this.request('/api/vizinhos', {
      method: 'POST',
      body: JSON.stringify({ lote_id: Number(loteId), nome_vizinho, lado }),
    });
  }

  // Aliases compatíveis com componentes existentes
  getParcels = (projectId: string) => this.getLotes(projectId);
  getParcel = (id: string) => this.getLote(id);

  createParcel = (projectId: string, data: { owner_name: string; owner_cpf?: string; geometry_wkt?: string }) =>
    this.createLote({
      projeto_id: Number(projectId),
      nome_cliente: data.owner_name,
      cpf_cnpj_cliente: data.owner_cpf,
      geom_wkt: data.geometry_wkt,
    });

  async updateParcel(id: string, data: { geometry_wkt?: string; status?: string }) {
    if (data.geometry_wkt) {
      const r = await this.updateLoteGeometria(id, data.geometry_wkt);
      if (r.error) return r;
      if (!data.status) return r;
    }
    if (data.status) return this.updateLoteStatus(id, data.status);
    return { data: null };
  }

  validateGeometry = (parcelId: string, geometryWkt: string) =>
    this.validarTopologia(parcelId, geometryWkt);

  getOverlaps = (projectId: string) => this.getSobreposicoesProjeto(projectId);

  getNeighbors = (parcelId: string) => this.getVizinhos(parcelId);

  addNeighbor = (parcelId: string, data: { name: string; side: string }) =>
    this.addVizinho(parcelId, data.name, data.side.toUpperCase());

  async removeVizinho(vizinhoId: number | string) {
    return this.request(`/api/vizinhos/${vizinhoId}`, { method: 'DELETE' });
  }

  // ==================== ORCAMENTOS ====================
  async getOrcamentos(projetoId?: number | string, loteId?: number | string) {
    const params = new URLSearchParams();
    if (projetoId) params.append('projeto_id', String(projetoId));
    if (loteId) params.append('lote_id', String(loteId));
    const query = params.toString();
    const response = await this.request<unknown[]>(`/api/orcamentos${query ? `?${query}` : ''}`, { method: 'GET' });
    return validateResponse(OrcamentosSchema, response, 'getOrcamentos');
  }

  async getOrcamento(id: number | string) {
    return this.request<unknown>(`/api/orcamentos/${id}`, { method: 'GET' });
  }

  async createOrcamento(data: {
    projeto_id?: number;
    lote_id?: number;
    valor: number;
    status?: string;
    observacoes?: string;
  }) {
    return this.request('/api/orcamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrcamento(id: number | string, data: {
    valor?: number;
    status?: string;
    observacoes?: string;
  }) {
    return this.request(`/api/orcamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrcamento(id: number | string) {
    return this.request(`/api/orcamentos/${id}`, { method: 'DELETE' });
  }

  // ==================== DESPESAS ====================
  async getDespesas(projetoId?: number | string) {
    const query = projetoId ? `?projeto_id=${projetoId}` : '';
    const response = await this.request<unknown[]>(`/api/despesas${query}`, { method: 'GET' });
    return validateResponse(DespesasSchema, response, 'getDespesas');
  }

  async getDespesa(id: number | string) {
    return this.request<unknown>(`/api/despesas/${id}`, { method: 'GET' });
  }

  async createDespesa(data: {
    projeto_id: number;
    descricao: string;
    valor: number;
    data?: string;
    categoria?: string;
    observacoes?: string;
  }) {
    return this.request('/api/despesas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDespesa(id: number | string, data: {
    descricao?: string;
    valor?: number;
    data?: string;
    categoria?: string;
    observacoes?: string;
  }) {
    return this.request(`/api/despesas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDespesa(id: number | string) {
    return this.request(`/api/despesas/${id}`, { method: 'DELETE' });
  }

  // ==================== PAGAMENTOS ====================
  async getPagamentos(projetoId?: number | string, loteId?: number | string) {
    const params = new URLSearchParams();
    if (projetoId) params.append('projeto_id', String(projetoId));
    if (loteId) params.append('lote_id', String(loteId));
    const query = params.toString();
    const response = await this.request<unknown[]>(`/api/pagamentos${query ? `?${query}` : ''}`, { method: 'GET' });
    return validateResponse(PagamentosSchema, response, 'getPagamentos');
  }

  // ==================== AI CHAT ====================
  async sendChatMessage(
    messages: { role: string; content: string }[],
    userRole: string,
  ) {
    return this.request<{ response: string; mood: string; suggested_questions: string[] }>(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify({ messages, user_role: userRole }),
        timeoutMs: 30000,
        retry: { retries: 1, retryOnStatuses: [502, 503] },
      },
    );
  }

  // ==================== DOCUMENTOS ====================
  private async requestMultipart<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });
      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        return { error: extractErrorMessage(payload) };
      }
      return { data: payload as T };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erro de upload' };
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async uploadDocumento(loteId: number | string, tipo: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    return this.requestMultipart(`/api/lotes/${loteId}/documentos`, formData);
  }

  async getDocumentos(loteId: number | string) {
    return this.request<unknown[]>(`/api/lotes/${loteId}/documentos`);
  }

  async deleteDocumento(documentoId: number | string) {
    return this.request(`/api/documentos/${documentoId}`, { method: 'DELETE' });
  }

  // ==================== INTAKE / PROGRESSO ====================
  async saveIntake(loteId: number | string, data: Record<string, unknown>) {
    return this.request(`/api/lotes/${loteId}/intake`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProgresso(loteId: number | string) {
    return this.request<{
      steps: { id: string; label: string; completed: boolean }[];
      completed: number;
      total: number;
      percentage: number;
    }>(`/api/lotes/${loteId}/progresso`);
  }

  async getProgressoPorToken(token: string) {
    return this.request<{
      steps: { id: string; label: string; completed: boolean }[];
      completed: number;
      total: number;
      percentage: number;
    }>(`/api/acesso-lote/progresso?token=${encodeURIComponent(token)}`);
  }
}


export const apiClient = new ApiClient(API_URL);
export default apiClient;
