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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [drawMode, setDrawMode] = useState<'line' | 'polyline' | 'polygon' | null>(null);

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

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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

  const border = 'rgba(148, 163, 184, 0.2)';
  const text = '#e5e7eb';
  const muted = '#94a3b8';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: isDesktop ? 'row' : 'column', background: '#0f0f0f', overflow: 'hidden' }}>
      {/* Mapa Fullscreen */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!loading && geometries.length > 0 ? (
          <ViewMapEsri geometries={geometries} />
        ) : loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: muted, background: '#0f0f0f' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', margin: 0 }}><span role="img" aria-label="Carregando">⏳</span></p>
              <p style={{ marginTop: '0.5rem' }}>Carregando...</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: muted, background: '#0f0f0f' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', margin: 0 }}><span role="img" aria-label="Sem dados">📭</span></p>
              <p style={{ marginTop: '0.5rem' }}>Nenhuma parcela cadastrada</p>
            </div>
          </div>
        )}

        {/* FAB Hamburger (Mobile Only) */}
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(147,197,253,0.4) 0%, rgba(96,165,250,0.5) 100%)',
              border: '1px solid rgba(147,197,253,0.4)',
              color: '#bfdbfe',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 20
            }}
          >
            {sidebarOpen ? '↓' : '☰'}
          </button>
        )}
      </div>

      {/* Sidebar / Drawer */}
      <div style={{
        width: isDesktop ? '400px' : '100%',
        height: isDesktop ? '100%' : (sidebarOpen ? '70vh' : '0'),
        background: 'rgba(15, 23, 42, 0.98)',
        backdropFilter: 'blur(8px)',
        borderLeft: isDesktop ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
        borderTop: !isDesktop ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
        overflow: 'hidden',
        transition: 'height 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: isDesktop ? 'relative' : 'fixed',
        bottom: isDesktop ? 'auto' : 0,
        left: isDesktop ? 'auto' : 0,
        right: isDesktop ? 'auto' : 0,
        zIndex: 30
      }}>
        {/* Header do Sidebar */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: text }}>
            <span role="img" aria-label="Dashboard">📊</span> Dashboard
          </h2>
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: muted,
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              ↓
            </button>
          )}
        </div>

        {/* Conteúdo do Sidebar - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Cards de Resumo */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              RESUMO DO PROJETO
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(147,197,253,0.25) 0%, rgba(96,165,250,0.3) 100%)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(147,197,253,0.3)',
                boxShadow: '0 2px 8px rgba(147,197,253,0.15)'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#bfdbfe' }}>
                    {totalParcels}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: muted }}>
                    Imóveis
                  </p>
                </div>
                <span role="img" aria-label="Imóveis" style={{ fontSize: '1.75rem' }}>📦</span>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(253,186,116,0.25) 0%, rgba(251,146,60,0.3) 100%)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(253,186,116,0.3)',
                boxShadow: '0 2px 8px rgba(253,186,116,0.15)'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#fed7aa' }}>
                    {totalOverlaps}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: muted }}>
                    Conflitos
                  </p>
                </div>
                <span role="img" aria-label="Conflitos" style={{ fontSize: '1.75rem' }}>⚠️</span>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(134,239,172,0.25) 0%, rgba(74,222,128,0.3) 100%)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(134,239,172,0.3)',
                boxShadow: '0 2px 8px rgba(134,239,172,0.15)'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#bbf7d0' }}>
                    {validatedParcels}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: muted }}>
                    Validados
                  </p>
                </div>
                <span role="img" aria-label="Validados" style={{ fontSize: '1.75rem' }}>✅</span>
              </div>
            </div>
          </div>

          {/* Ferramentas de Desenho */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              <span role="img" aria-label="Ferramentas">✏️</span> FERRAMENTAS DE DESENHO
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                onClick={() => setDrawMode(drawMode === 'line' ? null : 'line')}
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  background: drawMode === 'line' ? 'rgba(147,197,253,0.25)' : 'rgba(30, 41, 59, 0.4)',
                  border: `1px solid ${drawMode === 'line' ? 'rgba(147,197,253,0.5)' : border}`,
                  borderRadius: '8px',
                  color: drawMode === 'line' ? '#bfdbfe' : muted,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  transition: 'all 150ms'
                }}
                title="Linha"
              >
                <span role="img" aria-label="Linha">📏</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Linha</span>
              </button>
              <button
                onClick={() => setDrawMode(drawMode === 'polyline' ? null : 'polyline')}
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  background: drawMode === 'polyline' ? 'rgba(253,186,116,0.25)' : 'rgba(30, 41, 59, 0.4)',
                  border: `1px solid ${drawMode === 'polyline' ? 'rgba(253,186,116,0.5)' : border}`,
                  borderRadius: '8px',
                  color: drawMode === 'polyline' ? '#fed7aa' : muted,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  transition: 'all 150ms'
                }}
                title="Polilinha"
              >
                <span role="img" aria-label="Polilinha">↗️</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Polilinha</span>
              </button>
              <button
                onClick={() => setDrawMode(drawMode === 'polygon' ? null : 'polygon')}
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  background: drawMode === 'polygon' ? 'rgba(134,239,172,0.25)' : 'rgba(30, 41, 59, 0.4)',
                  border: `1px solid ${drawMode === 'polygon' ? 'rgba(134,239,172,0.5)' : border}`,
                  borderRadius: '8px',
                  color: drawMode === 'polygon' ? '#bbf7d0' : muted,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  transition: 'all 150ms'
                }}
                title="Polígono"
              >
                <span role="img" aria-label="Polígono">◼️</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Polígono</span>
              </button>
            </div>
          </div>

          {/* Criar Projeto / Lote */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              <span role="img" aria-label="Criar">➕</span> CRIAR
            </h3>
            
            {/* Criar Projeto */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: muted }}>Novo Projeto</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Nome do projeto"
                  value={novoProjeto}
                  onChange={(e) => setNovoProjeto(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${border}`,
                    borderRadius: '6px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: text,
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  onClick={handleCriarProjeto}
                  disabled={criando}
                  style={{
                    padding: '0.5rem 1rem',
                    background: criando ? '#1f2937' : 'linear-gradient(135deg, rgba(147,197,253,0.4) 0%, rgba(96,165,250,0.5) 100%)',
                    color: '#bfdbfe',
                    border: '1px solid rgba(147,197,253,0.4)',
                    borderRadius: '6px',
                    cursor: criando ? 'wait' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Criar
                </button>
              </div>
            </div>

            {/* Seletor de Projeto */}
            {projects.length > 1 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: muted }}>Projeto Ativo</label>
                <select
                  value={selectedProjectId ?? ''}
                  onChange={(e) => { const id = Number(e.target.value); setSelectedProjectId(id); loadProjectData(id); }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${border}`,
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: text,
                    fontSize: '0.9rem'
                  }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Criar Lote */}
            {selectedProjectId && (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: muted }}>Novo Lote</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={novoLote.nome}
                    onChange={(e) => setNovoLote((p) => ({ ...p, nome: e.target.value }))}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: `1px solid ${border}`,
                      borderRadius: '6px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: text,
                      fontSize: '0.9rem'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={novoLote.email}
                    onChange={(e) => setNovoLote((p) => ({ ...p, email: e.target.value }))}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: `1px solid ${border}`,
                      borderRadius: '6px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: text,
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    onClick={handleCriarLote}
                    disabled={criando}
                    style={{
                      padding: '0.5rem 1rem',
                      background: criando ? '#1f2937' : 'linear-gradient(135deg, rgba(134,239,172,0.4) 0%, rgba(74,222,128,0.5) 100%)',
                      color: '#bbf7d0',
                      border: '1px solid rgba(134,239,172,0.4)',
                      borderRadius: '6px',
                      cursor: criando ? 'wait' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    Criar Lote
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Lista de Lotes */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              <span role="img" aria-label="Lista">📋</span> LOTES ({parcels.length})
            </h3>
            {parcels.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {parcels.map((parcel) => (
                  <div
                    key={parcel.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: `1px solid ${border}`,
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: text }}>#{parcel.id}</span>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        background: parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO' ? 'rgba(134,239,172,0.2)' : 'rgba(253,186,116,0.2)',
                        color: parcel.status === 'VALIDACAO_SIGEF' || parcel.status === 'FINALIZADO' ? '#bbf7d0' : '#fed7aa',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {parcel.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0', color: muted }}>{parcel.nome_cliente || '-'}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => copiarLink(parcel)}
                        style={{
                          flex: 1,
                          padding: '0.4rem 0.75rem',
                          background: 'linear-gradient(135deg, rgba(147,197,253,0.3) 0%, rgba(96,165,250,0.4) 100%)',
                          color: '#bfdbfe',
                          border: '1px solid rgba(147,197,253,0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        <span role="img" aria-label="Copiar">📋</span> Link
                      </button>
                      <a
                        href={`/topografo/validar?lote=${parcel.id}`}
                        style={{
                          flex: 1,
                          padding: '0.4rem 0.75rem',
                          background: 'linear-gradient(135deg, rgba(147,197,253,0.3) 0%, rgba(96,165,250,0.4) 100%)',
                          color: '#bfdbfe',
                          border: '1px solid rgba(147,197,253,0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          textAlign: 'center',
                          display: 'block'
                        }}
                      >
                        Ver
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: muted, fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                Nenhum lote cadastrado
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
