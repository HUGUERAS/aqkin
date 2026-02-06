import '../../styles/TopografoPro.css';

const cadernetaRows = [
  { ponto: 'P1', latitude: '-15.7942', longitude: '-47.8822', descricao: 'Vértice Nordeste' },
  { ponto: 'P2', latitude: '-15.7950', longitude: '-47.8822', descricao: 'Vértice Sudeste' },
];

export default function GerarPecas() {
  return (
    <div className="topografo-page">
      {/* Page Header */}
      <div className="topografo-page-header">
        <div className="topografo-page-header-left">
          <span className="topografo-page-icon">📄</span>
          <div className="topografo-page-title">
            <h1>Gerar Peças Técnicas</h1>
            <p>Baixe documentos técnicos a partir da geometria validada</p>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="pro-grid-3">
        {/* Memorial Descritivo */}
        <div className="pro-card">
          <div className="pro-card-header">
            <h2><span className="icon">📋</span> Memorial Descritivo</h2>
            <span className="pro-badge pro-badge-info">PDF / DOCX</span>
          </div>
          <div className="pro-card-body">
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              fontSize: '0.875rem',
              lineHeight: '1.8'
            }}>
              <p style={{ fontWeight: 600, color: '#a5b4fc', marginBottom: '12px' }}>MEMORIAL DESCRITIVO</p>
              <p style={{ color: '#94a3b8' }}>Imóvel: <span style={{ color: '#e2e8f0' }}>#001</span></p>
              <p style={{ color: '#94a3b8' }}>Proprietário: <span style={{ color: '#e2e8f0' }}>João Silva</span></p>
              <p style={{ color: '#94a3b8' }}>Área: <span style={{ color: '#e2e8f0' }}>5.240,00 m²</span></p>
              <div style={{ margin: '16px 0', borderTop: '1px dashed rgba(255,255,255,0.15)' }} />
              <p style={{ fontWeight: 600, color: '#a5b4fc', marginBottom: '8px' }}>CONFRONTAÇÕES:</p>
              <p style={{ color: '#94a3b8' }}>NORTE: <span style={{ color: '#e2e8f0' }}>Maria Santos - 52,00m</span></p>
              <p style={{ color: '#94a3b8' }}>SUL: <span style={{ color: '#e2e8f0' }}>Pedro Costa - 52,00m</span></p>
              <p style={{ color: '#94a3b8' }}>LESTE: <span style={{ color: '#e2e8f0' }}>Rua Principal - 100,00m</span></p>
              <p style={{ color: '#94a3b8' }}>OESTE: <span style={{ color: '#e2e8f0' }}>Ana Oliveira - 100,00m</span></p>
              <div style={{ margin: '16px 0', borderTop: '1px dashed rgba(255,255,255,0.15)' }} />
              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.8rem' }}>Dados preenchidos automaticamente</p>
            </div>
          </div>
          <div className="pro-card-footer" style={{ display: 'flex', gap: '12px' }}>
            <button className="pro-btn pro-btn-primary" style={{ flex: 1 }}>
              📥 PDF
            </button>
            <button className="pro-btn pro-btn-secondary" style={{ flex: 1 }}>
              📥 DOCX
            </button>
          </div>
        </div>

        {/* Planta de Situação */}
        <div className="pro-card">
          <div className="pro-card-header">
            <h2><span className="icon">🗺️</span> Planta de Situação</h2>
            <span className="pro-badge pro-badge-success">PDF A3</span>
          </div>
          <div className="pro-card-body">
            <div style={{
              height: '280px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <span style={{ fontSize: '64px' }}>📐</span>
              <p style={{ color: '#e2e8f0', fontWeight: 500 }}>Preview da Planta</p>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Mapa + Legenda + Norte</p>
            </div>
          </div>
          <div className="pro-card-footer">
            <button className="pro-btn pro-btn-success" style={{ width: '100%' }}>
              📥 Baixar Planta (PDF A3)
            </button>
          </div>
        </div>

        {/* Caderneta de Campo */}
        <div className="pro-card">
          <div className="pro-card-header">
            <h2><span className="icon">📊</span> Caderneta de Campo</h2>
            <span className="pro-badge pro-badge-warning">XLSX</span>
          </div>
          <div className="pro-card-body" style={{ padding: 0 }}>
            <div className="pro-table-container">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Ponto</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {cadernetaRows.map((row) => (
                    <tr key={row.ponto}>
                      <td style={{ fontWeight: 600, color: '#a5b4fc' }}>{row.ponto}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.latitude}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.longitude}</td>
                      <td>{row.descricao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pro-card-footer">
            <button className="pro-btn pro-btn-warning" style={{ width: '100%' }}>
              📥 Baixar Caderneta (XLSX)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
