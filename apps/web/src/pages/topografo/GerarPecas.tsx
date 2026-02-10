export default function GerarPecas() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)', color: '#e5e7eb' }}>
      <h1 style={{ marginBottom: '2rem', color: '#f8fafc' }}>
        <span role="img" aria-label="Documento">📄</span> Gerar Peças Técnicas
      </h1>

      <div style={{
        background: 'rgba(15, 23, 42, 0.92)',
        borderRadius: '14px',
        padding: '2rem',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        marginBottom: '2rem',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#f8fafc' }}>
          <span role="img" aria-label="Memorial">📋</span> Memorial Descritivo
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          Geração automática com base nos dados dos confrontantes e geometria validada
        </p>

        <div style={{
          padding: '2rem',
          background: '#0b1220',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.8',
          marginBottom: '1rem',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          color: '#e5e7eb'
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
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginRight: '1rem',
          boxShadow: '0 10px 24px rgba(59,130,246,0.28)'
        }}>
          <span role="img" aria-label="Download">📥</span> Baixar Memorial (PDF)
        </button>

        <button style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 10px 24px rgba(99,102,241,0.28)'
        }}>
          <span role="img" aria-label="Enviar">📤</span> Baixar Memorial (DOCX)
        </button>
      </div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.92)',
        borderRadius: '14px',
        padding: '2rem',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        marginBottom: '2rem',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#f8fafc' }}>
          <span role="img" aria-label="Mapa">🗺️</span> Planta de Situação
        </h2>

        <div style={{
          width: '100%',
          height: '400px',
          background: '#0b1220',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          border: '1px solid rgba(59, 130, 246, 0.25)'
        }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontSize: '2rem' }}><span role="img" aria-label="Esquadro">📐</span></p>
            <p>Preview da Planta</p>
            <p style={{ fontSize: '0.9rem' }}>Mapa com coordenadas + legenda + norte</p>
          </div>
        </div>

        <button style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 10px 24px rgba(59,130,246,0.28)'
        }}>
          <span role="img" aria-label="Download">📥</span> Baixar Planta (PDF A3)
        </button>
      </div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.92)',
        borderRadius: '14px',
        padding: '2rem',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#f8fafc' }}>
          <span role="img" aria-label="Grafico">📊</span> Caderneta de Campo
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          Pontos levantados com coordenadas (SIRGAS 2000)
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0b1220' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#cbd5e1' }}>Ponto</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#cbd5e1' }}>Latitude</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#cbd5e1' }}>Longitude</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#cbd5e1' }}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>P1</td>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>-15.7942</td>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>-47.8822</td>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>Vértice Nordeste</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>P2</td>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>-15.7950</td>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>-47.8822</td>
              <td style={{ padding: '0.75rem', color: '#e5e7eb' }}>Vértice Sudeste</td>
            </tr>
          </tbody>
        </table>

        <button style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 10px 24px rgba(59,130,246,0.28)'
        }}>
          <span role="img" aria-label="Download">📥</span> Baixar Caderneta (XLSX)
        </button>
      </div>
    </div>
  );
}
