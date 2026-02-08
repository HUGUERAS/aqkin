import { useState, useEffect, useCallback } from 'react';
import ViewMapEsri from '../../components/maps/ViewMapEsri';
import apiClient from '../../services/api';

interface Parcel {
  id: number;
  geom?: { type: string; coordinates: number[][][] };
  geometry_wkt?: string;
  status: string;
  nome_cliente?: string;
  token_acesso?: string;
}

interface GeometryItem {
  id: string;
  geojson?: Parcel['geom'];
  wkt?: string;
  type: 'oficial' | 'rascunho';
  label?: string;
}

export default function DashboardConfluencia() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<{ id: number; nome: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [overlaps, setOverlaps] = useState<unknown[]>([]);
  const [geometries, setGeometries] = useState<GeometryItem[]>([]);
  const [novoProjeto, setNovoProjeto] = useState('');
  const [novoLote, setNovoLote] = useState({ nome: '', email: '' });
  const [criando, setCriando] = useState(false);

  const loadProjectData = useCallback(async (projectId: number) => {
    try {
      const parcelsResponse = await apiClient.getParcels(String(projectId));
      if (Array.isArray(parcelsResponse.data)) {
        const parcelData = parcelsResponse.data as unknown as Parcel[];
        setParcels(parcelData);
        const geomsFromParcels = parcelData
          .filter((p) => p.geom || p.geometry_wkt)
          .map((p) => {
            const geomType: 'oficial' | 'rascunho' = (p.status === 'VALIDACAO_SIGEF' || p.status === 'FINALIZADO') ? 'oficial' : 'rascunho';
            return {
              id: String(p.id),
              geojson: p.geom,
              wkt: p.geometry_wkt,
              type: geomType,
              label: p.nome_cliente,
            };
          });
        setGeometries(geomsFromParcels);
      } else {
        setParcels([]);
      }
      const overlapsResponse = await apiClient.getOverlaps(String(projectId));
      if (overlapsResponse.data) setOverlaps(overlapsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
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
  }, [loadProjectData, selectedProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);


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

  const surface = 'rgba(15, 23, 42, 0.92)';
  const border = 'rgba(59, 130, 246, 0.25)';
  const text = '#e5e7eb';
  const muted = '#94a3b8';
  const gradient = 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)';

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)', color: text }}>
      <h1 style={{ marginBottom: '2rem', color: '#f8fafc' }}>
        <span role="img" aria-label="Dashboard">📊</span> Dashboard de Confluência
        {loading && (
          <span style={{ fontSize: '0.8rem', marginLeft: '1rem' }}>
            <span role="img" aria-label="Carregando">⏳</span> Carregando...
          </span>
        )}
      </h1>

      {/* Resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: gradient,
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 14px 30px rgba(16,185,129,0.25)'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalParcels}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Imóveis Totais</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 14px 30px rgba(239,68,68,0.25)'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalOverlaps}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Sobreposições</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 14px 30px rgba(34,197,94,0.25)'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{validatedParcels}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Validados</p>
        </div>
      </div>

      {/* Mapa de Confluência */}
      <div style={{
        background: surface,
        borderRadius: '14px',
        padding: '2rem',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        marginBottom: '2rem',
        border: `1px solid ${border}`
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#f8fafc' }}>
          <span role="img" aria-label="Mapa">🗺️</span> Mapa de Confluência
        </h2>
        <p style={{ color: muted, marginBottom: '1rem' }}>
          Dados em tempo real do Supabase + PostGIS
        </p>

        {/* Mapa ArcGIS com dados reais */}
        {!loading && geometries.length > 0 ? (
          <ViewMapEsri geometries={geometries} />
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: muted }}>
            <p style={{ fontSize: '2rem' }}><span role="img" aria-label="Carregando">⏳</span></p>
            <p>Carregando dados...</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: muted }}>
            <p style={{ fontSize: '2rem' }}><span role="img" aria-label="Sem dados">📭</span></p>
            <p>Nenhuma parcela cadastrada ainda</p>
          </div>
        )}
      </div>

      {/* Criar Projeto / Lote */}
      <div style={{ background: surface, borderRadius: '14px', padding: '2rem', boxShadow: '0 18px 50px rgba(0,0,0,0.35)', marginBottom: '2rem', border: `1px solid ${border}` }}>
        <h2 style={{ marginBottom: '1rem' }}>
          <span role="img" aria-label="Adicionar">➕</span> Criar
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Novo Projeto</label>
            <input
              type="text"
              placeholder="Nome do projeto"
              value={novoProjeto}
              onChange={(e) => setNovoProjeto(e.target.value)}
              style={{ padding: '0.5rem 1rem', border: `1px solid ${border}`, borderRadius: '8px', marginRight: '0.5rem', background: '#0b1220', color: text }}
            />
            <button onClick={handleCriarProjeto} disabled={criando} style={{ padding: '0.5rem 1rem', background: criando ? '#1f2937' : gradient, color: 'white', border: 'none', borderRadius: '10px', cursor: criando ? 'wait' : 'pointer', boxShadow: '0 10px 24px rgba(59,130,246,0.3)' }}>
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
                  style={{ padding: '0.5rem 1rem', border: `1px solid ${border}`, borderRadius: '8px', marginRight: '0.5rem', background: '#0b1220', color: text }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={novoLote.email}
                  onChange={(e) => setNovoLote((p) => ({ ...p, email: e.target.value }))}
                  style={{ padding: '0.5rem 1rem', border: `1px solid ${border}`, borderRadius: '8px', marginRight: '0.5rem', background: '#0b1220', color: text }}
                />
              </div>
              <button onClick={handleCriarLote} disabled={criando} style={{ padding: '0.5rem 1rem', background: criando ? '#1f2937' : 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: criando ? 'wait' : 'pointer', boxShadow: '0 10px 24px rgba(34,197,94,0.25)' }}>
                Criar Lote
              </button>
            </div>
          )}
        </div>
        {projects.length > 1 && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ marginRight: '0.5rem' }}>Projeto:</label>
            <select value={selectedProjectId ?? ''} onChange={(e) => { const id = Number(e.target.value); setSelectedProjectId(id); loadProjectData(id); }} style={{ padding: '0.5rem', borderRadius: '8px', border: `1px solid ${border}`, background: '#0b1220', color: text }}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lista de Imóveis */}
      <div style={{
        background: surface,
        borderRadius: '14px',
        padding: '2rem',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        border: `1px solid ${border}`
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#f8fafc' }}>
          <span role="img" aria-label="Lista">📋</span> Imóveis do Projeto
        </h2>

        {parcels.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0b1220' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1' }}>Proprietário</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1' }}>Link Cliente</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel) => (
                <tr key={parcel.id} style={{ borderBottom: `1px solid ${border}` }}>
                  <td style={{ padding: '1rem', color: text }}>#{parcel.id}</td>
                  <td style={{ padding: '1rem', color: text }}>{parcel.nome_cliente || '-'}</td>
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
                    <button onClick={() => copiarLink(parcel)} style={{ padding: '0.5rem 1rem', background: gradient, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 8px 18px rgba(59,130,246,0.28)' }}>
                      <span role="img" aria-label="Copiar">📋</span> Copiar link
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <a href={`/topografo/validar?lote=${parcel.id}`} style={{
                      padding: '0.5rem 1rem',
                      background: gradient,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                      textDecoration: 'none',
                      display: 'inline-block',
                      boxShadow: '0 8px 18px rgba(59,130,246,0.28)'
                    }}>
                      Ver
                    </a>
                    <button
                      onClick={() => handleAprovar(parcel.id)}
                      disabled={parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO'}
                      style={{
                        padding: '0.5rem 1rem',
                        background: parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO' ? '#1f2937' : 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
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
          <div style={{ textAlign: 'center', padding: '2rem', color: muted }}>
            Nenhuma parcela cadastrada
          </div>
        )}
      </div>
    </div>
  );
}
