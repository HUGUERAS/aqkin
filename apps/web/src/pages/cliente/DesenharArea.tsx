import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DrawMapEsri from '../../components/maps/DrawMapEsri';
import { Alert, Button } from '../../components/UIComponents';
import apiClient from '../../services/api';
import '../../styles/PortalLayout.css';
import './DesenharArea.css';

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
    const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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
    } else if (isDevMode) {
      // Em modo dev, usar lote fictício para testes
      console.log('🔓 MODO DEV: Usando lote de teste (ID: 999)');
      setLoteId(999);
      setError('');
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
          <Alert type="error" title="Erro">
            {error}
          </Alert>
        )}

        {loteId && (
          <>
            {validando && <p className="draw-area-status">Validando...</p>}
            {validacao && !validando && (
              <Alert type={validacao.valido ? 'success' : 'error'} title={validacao.valido ? 'Desenho válido' : 'Erros encontrados'}>
                {validacao.valido ? (
                  <p>Pronto para salvar a geometria.</p>
                ) : (
                  <ul className="draw-area-error-list">
                    {validacao.erros.map((e, i) => (
                      <li key={i}>{e.mensagem}</li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}

            <div className="draw-area-actions">
              <Button
                onClick={handleSave}
                disabled={loading || !geometry || (validacao ? !validacao.valido : false)}
                isLoading={loading}
              >
                {saved ? 'Salvo!' : 'Salvar Desenho'}
              </Button>
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
