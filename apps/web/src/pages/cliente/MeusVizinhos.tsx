import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/api';

interface Vizinho {
  id: number;
  nome_vizinho: string;
  lado: string;
}

export default function MeusVizinhos() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const loteIdParam = searchParams.get('lote');

  const [loteId, setLoteId] = useState<number | null>(null);
  const [vizinhos, setVizinhos] = useState<Vizinho[]>([]);
  const [nome, setNome] = useState('');
  const [lado, setLado] = useState('NORTE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tokenParam) {
      apiClient.getLotePorToken(tokenParam).then((r) => {
        if (r.data && typeof r.data === 'object' && 'id' in r.data) {
          setLoteId((r.data as { id: number }).id);
          setError('');
        } else {
          setError('Link inválido ou expirado.');
          setLoading(false);
        }
      });
    } else if (loteIdParam) {
      const id = parseInt(loteIdParam, 10);
      if (!isNaN(id)) setLoteId(id);
      else {
        setError('ID de lote inválido.');
        setLoading(false);
      }
    } else {
      setError('Acesso via link do topógrafo ou ?lote=ID');
      setLoading(false);
    }
  }, [tokenParam, loteIdParam]);

  useEffect(() => {
    if (!loteId) return;
    setLoading(true);
    apiClient
      .getVizinhos(loteId)
      .then((r) => {
        if (r.data && Array.isArray(r.data)) setVizinhos(r.data as Vizinho[]);
      })
      .finally(() => setLoading(false));
  }, [loteId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteId) return;
    const r = await apiClient.addVizinho(loteId, nome, lado);
    if (r.error) {
      setError(r.error);
    } else if (r.data && typeof r.data === 'object' && 'id' in r.data) {
      setVizinhos([...vizinhos, r.data as Vizinho]);
      setNome('');
      setError('');
    }
  };

  const handleRemove = async (vizinhoId: number) => {
    const r = await apiClient.removeVizinho(vizinhoId);
    if (!r.error) setVizinhos(vizinhos.filter((v) => v.id !== vizinhoId));
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)', color: '#e5e7eb' }}>
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.92)',
          borderRadius: '14px',
          padding: '2rem',
          boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
        }}
      >
        <h1 style={{ marginBottom: '1rem', color: '#f8fafc' }}>
          <span role="img" aria-label="Pessoas">👥</span> Quem são seus Vizinhos?
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Informe o nome dos vizinhos e em qual lado da sua propriedade eles ficam.
        </p>

        {error && (
          <div
            style={{
              padding: '1rem',
              background: '#ffebee',
              borderRadius: '6px',
              color: '#c62828',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {!loteId && !error && (
          <p style={{ color: '#666' }}><span role="img" aria-label="Carregando">⏳</span> Carregando...</p>
        )}

        {loteId && (
          <>
            <form
              onSubmit={handleAdd}
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="text"
                placeholder="Nome do vizinho"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  padding: '0.75rem',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: '#0b1220',
                  color: '#e5e7eb',
                }}
                required
              />

              <select
                value={lado}
                onChange={(e) => setLado(e.target.value)}
                style={{
                  flex: '0 1 150px',
                  padding: '0.75rem',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: '#0b1220',
                  color: '#e5e7eb',
                }}
              >
                <option value="NORTE">Norte</option>
                <option value="SUL">Sul</option>
                <option value="LESTE">Leste</option>
                <option value="OESTE">Oeste</option>
              </select>

              <button
                type="submit"
                style={{
                  flex: '0 1 auto',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(59,130,246,0.28)'
                }}
              >
                <span role="img" aria-label="Adicionar">➕</span> Adicionar
              </button>
            </form>

            {loading ? (
              <p><span role="img" aria-label="Carregando">⏳</span> Carregando vizinhos...</p>
            ) : vizinhos.length > 0 ? (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#f8fafc' }}>Vizinhos cadastrados:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {vizinhos.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: '#0b1220',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#e5e7eb' }}>{v.nome_vizinho}</strong>
                        <span style={{ marginLeft: '1rem', color: '#94a3b8' }}>{v.lado}</span>
                      </div>
                      <button
                        onClick={() => handleRemove(v.id)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                        }}
                      >
                        <span role="img" aria-label="Remover">🗑️</span> Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '2rem',
                  background: '#0b1220',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                }}
              >
                <p>Nenhum vizinho cadastrado ainda.</p>
                <p>Adicione pelo menos os vizinhos principais.</p>
              </div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#fff3cd',
            borderRadius: '6px',
            border: '1px solid #ffc107',
          }}
        >
          <h3><span role="img" aria-label="Alerta">⚠️</span> Importante:</h3>
          <p style={{ margin: '0.5rem 0' }}>
            Se o vizinho também estiver cadastrando sua área no sistema, o topógrafo
            poderá <strong>vincular automaticamente</strong> as duas propriedades.
          </p>
        </div>
      </div>
    </div>
  );
}
