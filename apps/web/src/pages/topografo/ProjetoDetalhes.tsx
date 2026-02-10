import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface ProjectStats {
  imoveis: number;
  conflitos: number;
  validados: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VALIDACAO_SIGEF':
    case 'FINALIZADO':
      return { bg: '#d4edda', text: '#155724' };
    case 'AGUARDANDO_DESENHO':
      return { bg: '#fff3cd', text: '#856404' };
    default:
      return { bg: '#e2e8f0', text: '#334155' };
  }
};

export default function ProjetoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projeto, setProjeto] = useState<{ id: number; nome: string } | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [geometries, setGeometries] = useState<GeometryItem[]>([]);
  const [novoLote, setNovoLote] = useState({ nome: '', email: '' });
  const [criando, setCriando] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  const surface = 'rgba(15, 23, 42, 0.92)';
  const border = 'rgba(59, 130, 246, 0.25)';
  const text = '#e5e7eb';
  const muted = '#94a3b8';
  const gradient = 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)';

  const loadProjectData = useCallback(async (projectId: number) => {
    setLoading(true);
    try {
      const projetosResponse = await apiClient.getProjects();
      if (projetosResponse.data) {
        const projs = projetosResponse.data as { id: number; nome: string }[];
        const proj = projs.find((p) => p.id === projectId);
        if (proj) setProjeto(proj);
        else {
          navigate('/topografo/dashboard');
          return;
        }
      }

      const parcelsResponse = await apiClient.getParcels(String(projectId));
      if (Array.isArray(parcelsResponse.data)) {
        const parcelData = parcelsResponse.data as unknown as Parcel[];
        setParcels(parcelData);

        const geomsFromParcels = parcelData
          .filter((p) => p.geom || p.geometry_wkt)
          .map((p) => {
            const geomType: 'oficial' | 'rascunho' =
              (p.status === 'VALIDACAO_SIGEF' || p.status === 'FINALIZADO') ? 'oficial' : 'rascunho';
            return {
              id: String(p.id),
              geojson: p.geom,
              wkt: p.geometry_wkt,
              type: geomType,
              label: p.nome_cliente,
            };
          });
        setGeometries(geomsFromParcels);
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) loadProjectData(Number(id));
  }, [id, loadProjectData]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCriarLote = async () => {
    if (!id || !novoLote.nome.trim()) return;
    setCriando(true);
    const r = await apiClient.createLote({
      projeto_id: Number(id),
      nome_cliente: novoLote.nome,
      email_cliente: novoLote.email || undefined,
    });
    setCriando(false);
    if (!r.error && r.data) {
      setNovoLote({ nome: '', email: '' });
      loadProjectData(Number(id));
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

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 60px)',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        position: 'relative',
      }}
    >
      {/* Mapa Fullscreen */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          borderRadius: sidebarOpen && isDesktop ? '0 14px 14px 0' : '0',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: surface,
              color: muted,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', margin: 0, marginBottom: '0.5rem' }}>
                <span role="img" aria-label="Carregando">
                  ⏳
                </span>
              </p>
              <p>Carregando projeto...</p>
            </div>
          </div>
        ) : geometries.length > 0 ? (
          <ViewMapEsri geometries={geometries} />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: surface,
              color: muted,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', margin: 0, marginBottom: '0.5rem' }}>
                <span role="img" aria-label="Sem dados">
                  📭
                </span>
              </p>
              <p>Nenhuma parcela cadastrada ainda</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', margin: 0 }}>
                Use o formulário ao lado para adicionar lotes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar / Drawer - Mobile First */}
      <>
        {/* Overlay (Mobile Only) */}
        {!isDesktop && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 30,
            }}
          />
        )}

        {/* Sidebar / Drawer */}
        <div
          style={{
            position: isDesktop ? 'relative' : 'fixed',
            right: 0,
            bottom: isDesktop ? 'auto' : sidebarOpen ? 0 : '-70vh',
            width: isDesktop ? '400px' : '100%',
            maxHeight: isDesktop ? 'calc(100vh - 60px)' : '70vh',
            background: surface,
            border: `1px solid ${border}`,
            borderTopLeftRadius: isDesktop ? '14px' : '14px',
            borderTopRightRadius: isDesktop ? '0' : '14px',
            borderBottomLeftRadius: isDesktop ? '14px' : '0',
            borderBottomRightRadius: '0',
            overflowY: 'auto',
            transition: isDesktop ? 'none' : 'bottom 0.3s ease',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2 style={{ color: text, marginBottom: '0.5rem', fontSize: '1.1rem', margin: 0 }}>
                  <span role="img" aria-label="Projeto">
                    📁
                  </span>{' '}
                  {projeto?.nome || 'Projeto'}
                </h2>
                <p style={{ color: muted, fontSize: '0.85rem', margin: 0 }}>
                  {parcels.length} {parcels.length === 1 ? 'lote' : 'lotes'} cadastrado
                  {parcels.length !== 1 ? 's' : ''}
                </p>
              </div>
              {!isDesktop && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: muted,
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ↓
                </button>
              )}
            </div>

            {/* Voltar (Mobile Only) ou Desktop Inside Drawer */}
            {!isDesktop ? (
              <button
                onClick={() => navigate('/topografo/dashboard')}
                style={{
                  padding: '0.7rem 1rem',
                  background: 'transparent',
                  color: muted,
                  border: `1px solid ${border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                ← Voltar
              </button>
            ) : null}

            {/* Formulário Novo Lote */}
            <div
              style={{
                background: '#0b1220',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.5rem',
                border: `1px solid ${border}`,
              }}
            >
              <h3 style={{ color: text, marginBottom: '1rem', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
                <span role="img" aria-label="Adicionar">
                  ➕
                </span>{' '}
                Novo Lote
              </h3>
              <input
                type="text"
                placeholder="Nome do cliente"
                value={novoLote.nome}
                onChange={(e) => setNovoLote((p) => ({ ...p, nome: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  border: `1px solid ${border}`,
                  borderRadius: '8px',
                  marginBottom: '0.7rem',
                  background: surface,
                  color: text,
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={novoLote.email}
                onChange={(e) => setNovoLote((p) => ({ ...p, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  border: `1px solid ${border}`,
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  background: surface,
                  color: text,
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleCriarLote}
                disabled={criando || !novoLote.nome.trim()}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  background:
                    criando || !novoLote.nome.trim() ? '#1f2937' : 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: criando || !novoLote.nome.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                }}
              >
                {criando ? 'Criando...' : 'Criar Lote'}
              </button>
            </div>

            {/* Lista de Lotes */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <h3 style={{ color: text, marginBottom: '1rem', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
                <span role="img" aria-label="Lista">
                  📋
                </span>{' '}
                Lotes
              </h3>
              {parcels.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {parcels.map((parcel) => {
                    const statusColor = getStatusColor(parcel.status);
                    return (
                      <div
                        key={parcel.id}
                        style={{
                          background: '#0b1220',
                          border: `1px solid ${border}`,
                          borderRadius: '10px',
                          padding: '1rem',
                        }}
                      >
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: text, fontSize: '0.95rem' }}>
                            {parcel.nome_cliente || `Lote #${parcel.id}`}
                          </strong>
                          <span
                            style={{
                              display: 'inline-block',
                              marginLeft: '0.5rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '8px',
                              background: statusColor.bg,
                              color: statusColor.text,
                              fontSize: '0.75rem',
                              fontWeight: '500',
                            }}
                          >
                            {parcel.status}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            marginTop: '0.7rem',
                          }}
                        >
                          <button
                            onClick={() => copiarLink(parcel)}
                            style={{
                              padding: '0.6rem',
                              background: gradient,
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                            }}
                          >
                            <span role="img" aria-label="Copiar">
                              📋
                            </span>{' '}
                            Link
                          </button>
                          <button
                            onClick={() => navigate(`/topografo/validar?lote=${parcel.id}`)}
                            style={{
                              padding: '0.6rem',
                              background: gradient,
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                            }}
                          >
                            <span role="img" aria-label="Ver">
                              👁️
                            </span>{' '}
                            Ver
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem 1rem',
                    color: muted,
                    border: `1px dashed ${border}`,
                    borderRadius: '10px',
                  }}
                >
                  <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                    <span role="img" aria-label="Vazio">
                      📭
                    </span>
                  </p>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>Nenhum lote cadastrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hamburger Toggle (Mobile Only) */}
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: gradient,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              boxShadow: '0 10px 30px rgba(59,130,246,0.4)',
            }}
          >
            {sidebarOpen ? '↓' : '☰'}
          </button>
        )}

        {/* Voltar Button (Desktop) */}
        {isDesktop && (
          <button
            onClick={() => navigate('/topografo/dashboard')}
            style={{
              position: 'absolute',
              top: '20px',
              right: `${400 + 20}px`,
              padding: '0.5rem 1rem',
              background: surface,
              color: muted,
              border: `1px solid ${border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              zIndex: 25,
            }}
          >
            ← Dashboard
          </button>
        )}
      </>
    </div>
  );
}
