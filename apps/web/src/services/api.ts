// FastAPI Backend URL (Ativo Real) - OBRIGATÓRIO, nunca localhost
const API_URL = import.meta.env.VITE_API_URL ?? '';
if (!API_URL && import.meta.env.DEV) {
  console.error('VITE_API_URL é obrigatório. Configure em .env (URL do deploy da API).');
}

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        return { error: (data as { detail?: string }).detail || 'Erro na requisição' };
      }
      return { data: data as T };
    } catch (error) {
      console.error('API Error:', error);
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
    return this.request<unknown[]>('/api/projetos', { method: 'GET' });
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
    return this.request<unknown[]>(`/api/lotes?projeto_id=${projetoId}`, { method: 'GET' });
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

  // ==================== ORÇAMENTOS ====================
  async getOrcamentos(projetoId?: number | string, loteId?: number | string) {
    const params = new URLSearchParams();
    if (projetoId) params.append('projeto_id', String(projetoId));
    if (loteId) params.append('lote_id', String(loteId));
    const query = params.toString();
    return this.request<unknown[]>(`/api/orcamentos${query ? `?${query}` : ''}`, { method: 'GET' });
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
    return this.request<unknown[]>(`/api/despesas${query}`, { method: 'GET' });
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
    return this.request<unknown[]>(`/api/pagamentos${query ? `?${query}` : ''}`, { method: 'GET' });
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
