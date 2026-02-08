import { useState, useEffect } from 'react';
import DrawMapEsri from '../../components/maps/DrawMapEsri';
import FloatingToolbar from '../../components/FloatingToolbar';
import { useClientToken } from '../../hooks/useClientToken';
import apiClient from '../../services/api';
import '../../styles/map-focused-layout.css';

export default function DesenharArea() {
  const { loteId, error: tokenError } = useClientToken();

  const [geometry, setGeometry] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validacao, setValidacao] = useState<{ valido: boolean; erros: { mensagem: string }[] } | null>(null);
  const [validando, setValidando] = useState(false);
  const [activeMode, setActiveMode] = useState<'draw' | 'measure' | 'validate' | null>(null);

  // Sync token error to local error state
  useEffect(() => {
    if (tokenError) setError(tokenError);
  }, [tokenError]);

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
      <div className="responsive-map-container">
        {loteId ? (
          <DrawMapEsri onGeometryChange={handleGeometryChange} style={{ height: '100%' }} />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: '1rem',
            color: '#b0b0b0',
            textAlign: 'center'
          }}>
            {error ? (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                maxWidth: '400px'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#ef4444' }}>
                  <span role="img" aria-label="Alerta">⚠️</span> Erro
                </p>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  <span role="img" aria-label="Carregando">⏳</span> Carregando mapa...
                </p>
                <p style={{ fontSize: '0.9rem' }}>Aguarde um momento...</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      {loteId && (
        <FloatingToolbar
          activeMode={activeMode}
          onDraw={() => {
            setActiveMode(activeMode === 'draw' ? null : 'draw');
            console.log('Draw mode toggled');
          }}
          onMeasure={() => {
            setActiveMode(activeMode === 'measure' ? null : 'measure');
            console.log('Measure mode toggled');
          }}
          onValidate={() => {
            handleSave();
          }}
          onSnapTool={() => {
            console.log('Snap Tool toggled');
          }}
          onEditGeometry={() => {
            console.log('Edit Geometry toggled');
          }}
        />
      )}

      {/* Info Panel - Bottom Left */}
      {loteId && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          background: 'rgba(15, 15, 15, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '1rem',
          maxWidth: '320px',
          zIndex: 20,
          color: '#b0b0b0',
          fontSize: '0.85rem'
        }}>
          <p style={{ margin: '0 0 0.75rem 0', fontWeight: 600, color: '#ffffff' }}>
            <span role="img" aria-label="Localização">📍</span> Desenho
          </p>

          {validando && (
            <p style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>
              <span role="img" aria-label="Validando">⏳</span> Validando...
            </p>
          )}

          {validacao && !validando && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '6px',
              background: validacao.valido ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: validacao.valido ? '#10b981' : '#ef4444',
              marginBottom: '0.75rem',
              fontSize: '0.8rem'
            }}>
              {validacao.valido ? (
                <strong><span role="img" aria-label="Sucesso">✅</span> Válido!</strong>
              ) : (
                <>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                    <span role="img" aria-label="Erro">❌</span> Erros:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {validacao.erros.map((e, i) => (
                      <li key={i} style={{ fontSize: '0.75rem' }}>{e.mensagem}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {geometry && (
            <button
              onClick={handleSave}
              disabled={loading || (validacao ? !validacao.valido : false)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                background: loading || (validacao ? !validacao.valido : false) ? '#3a3a3a' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || (validacao ? !validacao.valido : false) ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'background 150ms'
              }}
            >
              {loading ? (
                <>
                  <span role="img" aria-label="Salvando">💾</span> Salvando...
                </>
              ) : saved ? (
                <>
                  <span role="img" aria-label="Salvo">✅</span> Salvo!
                </>
              ) : (
                <>
                  <span role="img" aria-label="Salvar">💾</span> Salvar
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
