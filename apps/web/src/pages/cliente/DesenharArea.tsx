import { useState } from 'react';
import DrawMap from '../../components/maps/DrawMap';
import apiClient from '../../services/api';

export default function DesenharArea() {
  const [geometry, setGeometry] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGeometryChange = (wkt: string) => {
    setGeometry(wkt);
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    if (!geometry) {
      alert('Desenhe uma área primeiro!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Enviar para Azure Functions Backend
      // Assumindo parcelId fixo para demo - em produção viria do contexto/rota
      const parcelId = 'demo-parcel-id';
      
      const response = await apiClient.updateParcel(parcelId, {
        geometry_wkt: geometry,
        status: 'rascunho'
      });

      if (response.error) {
        setError(response.error);
        alert(`❌ Erro: ${response.error}`);
      } else {
        setSaved(true);
        alert('✅ Desenho salvo com sucesso! O topógrafo receberá para validação.');
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
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '1rem' }}>✏️ Desenhar Minha Área</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Desenhe o contorno da sua propriedade no mapa abaixo. Use o dedo ou mouse para criar os pontos.
        </p>

        {/* Mapa OpenLayers com Draw Tool */}
        <div style={{ marginBottom: '2rem' }}>
          <DrawMap onGeometryChange={handleGeometryChange} />
        </div>

        {/* Botão Salvar */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={handleSave}
            disabled={!geometry || loading}
            style={{
              padding: '1rem 2rem',
              background: (geometry && !loading) ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: (geometry && !loading) ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? '⏳ Salvando...' : saved ? '✅ Salvo!' : '💾 Salvar no Azure'}
          </button>
        </div>

        {error && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#ffebee', 
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: '#c62828',
            border: '1px solid #ef5350'
          }}>
            <strong>❌ Erro:</strong> {error}
          </div>
        )}

        {geometry && !error && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f0f4ff', 
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            <strong>✓ Geometria capturada!</strong> Clique em "Salvar no Azure" para enviar ao backend.
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0f4ff',
          borderRadius: '6px',
          border: '1px solid #667eea'
        }}>
          <h3>💡 Dicas:</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Toque/clique para adicionar pontos</li>
            <li>Feche o polígono tocando no primeiro ponto novamente</li>
            <li>Não precisa ser perfeito! O topógrafo vai ajustar depois</li>
            <li>Indique os lados onde ficam seus vizinhos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
