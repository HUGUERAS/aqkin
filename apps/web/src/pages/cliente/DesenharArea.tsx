import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DrawMapEsri from '../../components/maps/DrawMapEsri';
import apiClient from '../../services/api';
import '../../styles/PortalLayout.css';

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
          if (r.data) setValidacao({ valido: r.data.valido, erros: (r.data.erros as { mensagem: string }[]) || [] });
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
    <div className="map-shell">
      <div className="map-panel">
        <h1>✏️ Desenhar Área</h1>
        <p>Use as ferramentas do mapa para desenhar sua propriedade.</p>

        {!loteId && !error && <p>⏳ Carregando...</p>}
        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#ffebee',
            borderRadius: '6px',
            color: '#c62828',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {loteId && (
          <>
            {validando && <p style={{ color: '#666', marginBottom: '0.5rem' }}>⏳ Validando...</p>}
            {validacao && !validando && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '6px',
                background: validacao.valido ? '#e8f5e9' : '#ffebee',
                color: validacao.valido ? '#2e7d32' : '#c62828',
                fontSize: '0.9rem'
              }}>
                {validacao.valido ? (
                  <strong>✅ Desenho válido!</strong>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {validacao.erros.map((e, i) => (
                      <li key={i}>{e.mensagem}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSave}
                disabled={loading || !geometry || (validacao ? !validacao.valido : false)}
                className="button-primary"
              >
                {loading ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Desenho'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="map-viewport">
        {loteId && <DrawMapEsri onGeometryChange={handleGeometryChange} style={{ height: '100%' }} />}
      </div>
    </div>
  );
}
