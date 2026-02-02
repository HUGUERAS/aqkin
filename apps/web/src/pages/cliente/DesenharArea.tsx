import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DrawMapEsri from '../../components/maps/DrawMapEsri';
import apiClient from '../../services/api';

export default function DesenharArea() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const loteIdParam = searchParams.get('lote');

  const [loteId, setLoteId] = useState<number | null>(null);
  const [geometry, setGeometry] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validacao, setValidacao] = useState<{ valido: boolean; erros: { mensagem: string }[] } | null>(null);
  const [validando, setValidando] = useState(false);

  // Carregar lote por token ou loteId
  useEffect(() => {
    if (tokenParam) {
      apiClient.getLotePorToken(tokenParam).then((r) => {
        if (r.data && typeof r.data === 'object' && 'id' in r.data) {
          setLoteId((r.data as { id: number }).id);
          setError('');
        } else {
          setError('Link inválido ou expirado.');
        }
      });
    } else if (loteIdParam) {
      const id = parseInt(loteIdParam, 10);
      if (!isNaN(id)) setLoteId(id);
      else setError('ID de lote inválido.');
    } else {
      setError('Acesso via link do topógrafo ou ?lote=ID');
    }
  }, [tokenParam, loteIdParam]);

  const handleGeometryChange = (wkt: string) => {
    setGeometry(wkt);
    setSaved(false);
    setError('');
    setValidacao(null);
  };

  // Validação em tempo real (debounce)
  useEffect(() => {
    if (!loteId || !geometry) return;

    const t = setTimeout(() => {
      setValidando(true);
      apiClient
        .validarTopologia(String(loteId), geometry)
        .then((r) => {
          if (r.data) setValidacao({ valido: r.data.valido, erros: r.data.erros || [] });
        })
        .finally(() => setValidando(false));
    }, 500);

    return () => clearTimeout(t);
  }, [loteId, geometry]);

  const handleSave = async () => {
    if (!geometry) {
      alert('Desenhe uma área primeiro!');
      return;
    }
    if (!loteId) {
      alert('Carregue o link do topógrafo primeiro.');
      return;
    }
    if (validacao && !validacao.valido) {
      alert('Corrija os erros antes de salvar:\n' + validacao.erros.map((e) => e.mensagem).join('\n'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.updateLoteGeometria(loteId, geometry);

      if (response.error) {
        setError(response.error);
        alert(`❌ Erro: ${response.error}`);
      } else {
        setSaved(true);
        alert('✅ Desenho salvo! O topógrafo receberá para validação.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(errorMsg);
      alert(`❌ Erro: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ marginBottom: '1rem' }}>✏️ Desenhar Minha Área</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Desenhe o contorno da sua propriedade no mapa. Use o dedo ou mouse para criar os pontos.
        </p>

        {!loteId && !error && <p style={{ color: '#666' }}>⏳ Carregando...</p>}
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

        {loteId && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <DrawMapEsri onGeometryChange={handleGeometryChange} />
            </div>

            {/* Validação em tempo real */}
            {validando && (
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>⏳ Validando topologia...</p>
            )}
            {validacao && !validando && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  borderRadius: '6px',
                  background: validacao.valido ? '#e8f5e9' : '#ffebee',
                  color: validacao.valido ? '#2e7d32' : '#c62828',
                }}
              >
                {validacao.valido ? (
                  '✅ Geometria válida (sem sobreposições críticas)'
                ) : (
                  <div>
                    <strong>❌ Erros:</strong>
                    <ul style={{ margin: '0.5rem 0 0 1rem' }}>
                      {validacao.erros.map((e, i) => (
                        <li key={i}>{e.mensagem}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleSave}
                disabled={!geometry || loading || (validacao && !validacao.valido)}
                style={{
                  padding: '1rem 2rem',
                  background: geometry && !loading && (!validacao || validacao.valido) ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: geometry && !loading && (!validacao || validacao.valido) ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? '⏳ Salvando...' : saved ? '✅ Salvo!' : '💾 Salvar'}
              </button>
            </div>

            {geometry && !error && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f0f4ff',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                }}
              >
                <strong>✓ Geometria capturada!</strong> Valide antes de salvar.
              </div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f0f4ff',
            borderRadius: '6px',
            border: '1px solid #667eea',
          }}
        >
          <h3>💡 Dicas:</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Toque/clique para adicionar pontos</li>
            <li>Feche o polígono tocando no primeiro ponto</li>
            <li>Evite sobreposição com lotes vizinhos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
