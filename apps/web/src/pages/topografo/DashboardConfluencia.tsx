import { useState, useEffect } from 'react';
import ViewMapEsri from '../../components/maps/ViewMapEsri';
import apiClient from '../../services/api';

export default function DashboardConfluencia() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<{ id: number; nome: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [parcels, setParcels] = useState<any[]>([]);
  const [overlaps, setOverlaps] = useState<any[]>([]);
  const [geometries, setGeometries] = useState<any[]>([]);
  const [novoProjeto, setNovoProjeto] = useState('');
  const [novoLote, setNovoLote] = useState({ nome: '', email: '' });
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const projectsResponse = await apiClient.getProjects();

      if (projectsResponse.data && Array.isArray(projectsResponse.data)) {
        const projs = projectsResponse.data as { id: number; nome: string }[];
        setProjects(projs);
        const projectId = selectedProjectId ?? (projs[0]?.id ?? null);
        setSelectedProjectId(projectId);

        if (projectId) await loadProjectData(projectId);
        else {
          setParcels([]);
          setOverlaps([]);
          setGeometries([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (projectId: number) => {
    try {
      const parcelsResponse = await apiClient.getParcels(projectId);
      if (parcelsResponse.data) {
        setParcels(parcelsResponse.data);
        const geomsFromParcels = parcelsResponse.data
          .filter((p: { geom?: unknown; geometry_wkt?: string }) => p.geom || p.geometry_wkt)
          .map((p: { id: number; geom?: { type: string; coordinates: number[][][] }; geometry_wkt?: string; status: string; nome_cliente?: string }) => ({
            id: String(p.id),
            geojson: p.geom,
            wkt: p.geometry_wkt,
            type: (p.status === 'VALIDACAO_SIGEF' || p.status === 'FINALIZADO' ? 'oficial' : 'rascunho') as const,
            label: p.nome_cliente,
          }));
        setGeometries(geomsFromParcels);
      }
      const overlapsResponse = await apiClient.getOverlaps(projectId);
      if (overlapsResponse.data) setOverlaps(overlapsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    }
  };


  const handleCriarProjeto = async () => {
    if (!novoProjeto.trim()) return;
    setCriando(true);
    const r = await apiClient.createProject({ nome: novoProjeto });
    setCriando(false);
    if (!r.error) {
      setNovoProjeto('');
      loadData();
    }
  };

  const handleCriarLote = async () => {
    if (!selectedProjectId || !novoLote.nome.trim()) return;
    setCriando(true);
    const r = await apiClient.createLote({
      projeto_id: selectedProjectId,
      nome_cliente: novoLote.nome,
      email_cliente: novoLote.email || undefined,
    });
    setCriando(false);
    if (!r.error && r.data) {
      setNovoLote({ nome: '', email: '' });
      loadData();
    }
  };

  const getLinkCliente = (parcel: { id: number; token_acesso?: string }) => {
    const base = window.location.origin;
    const token = parcel.token_acesso;
    return token ? `${base}/cliente/desenhar?token=${token}` : `${base}/cliente/desenhar?lote=${parcel.id}`;
  };

  const copiarLink = (parcel: { id: number; token_acesso?: string }) => {
    navigator.clipboard.writeText(getLinkCliente(parcel));
    alert('Link copiado! Envie para o cliente.');
  };

  // Estatísticas
  const totalParcels = parcels.length;
  const totalOverlaps = overlaps.length;
  const validatedParcels = parcels.filter(
    (p: { status: string }) => p.status === 'VALIDACAO_SIGEF' || p.status === 'FINALIZADO'
  ).length;

  const handleAprovar = async (loteId: number) => {
    const r = await apiClient.updateLoteStatus(loteId, 'VALIDACAO_SIGEF');
    if (!r.error) loadData();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>
        📊 Dashboard de Confluência
        {loading && <span style={{ fontSize: '0.8rem', marginLeft: '1rem' }}>⏳ Carregando...</span>}
      </h1>

      {/* Resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#667eea',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalParcels}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Imóveis Totais</p>
        </div>

        <div style={{
          background: '#f44336',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalOverlaps}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Sobreposições</p>
        </div>

        <div style={{
          background: '#4caf50',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{validatedParcels}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Validados</p>
        </div>
      </div>

      {/* Mapa de Confluência */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🗺️ Mapa de Confluência</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Dados em tempo real do Supabase + PostGIS
        </p>

        {/* Mapa ArcGIS com dados reais */}
        {!loading && geometries.length > 0 ? (
          <ViewMapEsri geometries={geometries} />
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '2rem' }}>⏳</p>
            <p>Carregando dados...</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p>Nenhuma parcela cadastrada ainda</p>
          </div>
        )}
      </div>

      {/* Criar Projeto / Lote */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>➕ Criar</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Novo Projeto</label>
            <input
              type="text"
              placeholder="Nome do projeto"
              value={novoProjeto}
              onChange={(e) => setNovoProjeto(e.target.value)}
              style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px', marginRight: '0.5rem' }}
            />
            <button onClick={handleCriarProjeto} disabled={criando} style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: criando ? 'wait' : 'pointer' }}>
              Criar Projeto
            </button>
          </div>
          {selectedProjectId && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Novo Lote</label>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={novoLote.nome}
                  onChange={(e) => setNovoLote((p) => ({ ...p, nome: e.target.value }))}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px', marginRight: '0.5rem' }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={novoLote.email}
                  onChange={(e) => setNovoLote((p) => ({ ...p, email: e.target.value }))}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px', marginRight: '0.5rem' }}
                />
              </div>
              <button onClick={handleCriarLote} disabled={criando} style={{ padding: '0.5rem 1rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: criando ? 'wait' : 'pointer' }}>
                Criar Lote
              </button>
            </div>
          )}
        </div>
        {projects.length > 1 && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ marginRight: '0.5rem' }}>Projeto:</label>
            <select value={selectedProjectId ?? ''} onChange={(e) => { const id = Number(e.target.value); setSelectedProjectId(id); loadProjectData(id); }} style={{ padding: '0.5rem' }}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lista de Imóveis */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>📋 Imóveis do Projeto</h2>

        {parcels.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Proprietário</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Link Cliente</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel: { id: number; nome_cliente?: string; status: string; token_acesso?: string }) => (
                <tr key={parcel.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>#{parcel.id}</td>
                  <td style={{ padding: '1rem' }}>{parcel.nome_cliente || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      background: parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO' ? '#d4edda' : '#fff3cd',
                      color: parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO' ? '#155724' : '#856404',
                      fontSize: '0.9rem'
                    }}>
                      {parcel.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => copiarLink(parcel)} style={{ padding: '0.5rem 1rem', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      📋 Copiar link
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <a href={`/topografo/validar?lote=${parcel.id}`} style={{
                      padding: '0.5rem 1rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}>
                      Ver
                    </a>
                    <button
                      onClick={() => handleAprovar(parcel.id)}
                      disabled={parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO'}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO' ? 'default' : 'pointer',
                        opacity: parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO' ? 0.7 : 1
                      }}
                    >
                      Aprovar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Nenhuma parcela cadastrada
          </div>
        )}
      </div>
    </div>
  );
}
