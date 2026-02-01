export default function GerarPecas() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>📄 Gerar Peças Técnicas</h1>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>📋 Memorial Descritivo</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Geração automática com base nos dados dos confrontantes e geometria validada
        </p>

        <div style={{
          padding: '2rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.8',
          marginBottom: '1rem'
        }}>
          <p><strong>MEMORIAL DESCRITIVO</strong></p>
          <p>Imóvel: #001</p>
          <p>Proprietário: João Silva</p>
          <p>Área: 5.240,00 m²</p>
          <br />
          <p><strong>CONFRONTAÇÕES:</strong></p>
          <p>NORTE: Maria Santos (Imóvel #002) - 52,00m</p>
          <p>SUL: Pedro Costa (Imóvel #003) - 52,00m</p>
          <p>LESTE: Rua Principal - 100,00m</p>
          <p>OESTE: Ana Oliveira - 100,00m</p>
          <br />
          <p><em>Dados preenchidos automaticamente pelo sistema</em></p>
        </div>

        <button style={{
          padding: '0.75rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginRight: '1rem'
        }}>
          📥 Baixar Memorial (PDF)
        </button>

        <button style={{
          padding: '0.75rem 1.5rem',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          📤 Baixar Memorial (DOCX)
        </button>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🗺️ Planta de Situação</h2>

        <div style={{
          width: '100%',
          height: '400px',
          background: '#e0e0e0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '2rem' }}>📐</p>
            <p>Preview da Planta</p>
            <p style={{ fontSize: '0.9rem' }}>Mapa com coordenadas + legenda + norte</p>
          </div>
        </div>

        <button style={{
          padding: '0.75rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          📥 Baixar Planta (PDF A3)
        </button>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>📊 Caderneta de Campo</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Pontos levantados com coordenadas (SIRGAS 2000)
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Ponto</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Latitude</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Longitude</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.75rem' }}>P1</td>
              <td style={{ padding: '0.75rem' }}>-15.7942</td>
              <td style={{ padding: '0.75rem' }}>-47.8822</td>
              <td style={{ padding: '0.75rem' }}>Vértice Nordeste</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.75rem' }}>P2</td>
              <td style={{ padding: '0.75rem' }}>-15.7950</td>
              <td style={{ padding: '0.75rem' }}>-47.8822</td>
              <td style={{ padding: '0.75rem' }}>Vértice Sudeste</td>
            </tr>
          </tbody>
        </table>

        <button style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          📥 Baixar Caderneta (XLSX)
        </button>
      </div>
    </div>
  );
}
