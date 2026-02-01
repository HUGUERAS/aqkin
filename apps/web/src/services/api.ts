// Azure Functions Backend URL
// Substituir com a URL real após deploy
const AZURE_BACKEND_URL = process.env['VITE_AZURE_BACKEND_URL'] || 'https://func-ativo-real.azurewebsites.net/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Recuperar token do localStorage se existir
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || data.error || 'Erro na requisição',
        };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Erro de conexão',
      };
    }
  }

  // ==================== AUTH ====================

  async login(email: string, password: string) {
    const response = await this.request<{
      access_token: string;
      user: any;
    }>('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'topographer' | 'client';
  }) {
    return this.request('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  logout() {
    this.clearToken();
  }

  // ==================== PROJECTS ====================

  async getProjects() {
    return this.request('projects', { method: 'GET' });
  }

  async getProject(id: string) {
    return this.request(`projects/${id}`, { method: 'GET' });
  }

  async createProject(projectData: any) {
    return this.request('projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request(`projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request(`projects/${id}`, { method: 'DELETE' });
  }

  // ==================== PARCELS (LOTES) ====================

  async getParcels(projectId: string) {
    return this.request(`projects/${projectId}/parcels`, { method: 'GET' });
  }

  async getParcel(id: string) {
    return this.request(`parcels/${id}`, { method: 'GET' });
  }

  async createParcel(projectId: string, parcelData: {
    owner_name: string;
    owner_cpf: string;
    geometry_wkt: string;
  }) {
    return this.request(`projects/${projectId}/parcels`, {
      method: 'POST',
      body: JSON.stringify(parcelData),
    });
  }

  async updateParcel(id: string, parcelData: any) {
    return this.request(`parcels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(parcelData),
    });
  }

  // ==================== TOPOLOGY CHECKS ====================

  async validateGeometry(parcelId: string, geometryWkt: string) {
    return this.request(`parcels/${parcelId}/validate-geometry`, {
      method: 'POST',
      body: JSON.stringify({ geometry_wkt: geometryWkt }),
    });
  }

  async getNeighbors(parcelId: string) {
    return this.request(`parcels/${parcelId}/neighbors`, { method: 'GET' });
  }

  async getOverlaps(projectId: string) {
    return this.request(`projects/${projectId}/overlaps`, { method: 'GET' });
  }

  // ==================== CONFRONTANTES ====================

  async addNeighbor(parcelId: string, neighborData: {
    name: string;
    side: 'norte' | 'sul' | 'leste' | 'oeste';
  }) {
    return this.request(`parcels/${parcelId}/neighbors`, {
      method: 'POST',
      body: JSON.stringify(neighborData),
    });
  }

  async linkNeighborParcel(parcelId: string, neighborParcelId: string) {
    return this.request(`parcels/${parcelId}/link-neighbor`, {
      method: 'POST',
      body: JSON.stringify({ neighbor_parcel_id: neighborParcelId }),
    });
  }

  // ==================== DOCUMENTS ====================

  async uploadDocument(parcelId: string, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const url = `${this.baseUrl}/parcels/${parcelId}/documents`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Erro no upload' };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro no upload',
      };
    }
  }

  async getDocuments(parcelId: string) {
    return this.request(`parcels/${parcelId}/documents`, { method: 'GET' });
  }

  // ==================== TECHNICAL DOCUMENTS ====================

  async generateMemorial(parcelId: string) {
    return this.request(`parcels/${parcelId}/memorial`, { method: 'POST' });
  }

  async generatePlanta(parcelId: string) {
    return this.request(`parcels/${parcelId}/planta`, { method: 'POST' });
  }
}

// Instância singleton
export const apiClient = new ApiClient(AZURE_BACKEND_URL);

export default apiClient;
