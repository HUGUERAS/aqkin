export default function ValidarDesenhos() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>
        <span role="img" aria-label="Validar Desenhos">✅</span> Validar Desenhos
      </h1>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>
          <span role="img" aria-label="Ferramentas de Ajuste">🔧</span> Ferramentas de Ajuste
        </h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            <span role="img" aria-label="Snap Tool">🧲</span> Snap Tool (0.5m)
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
            <span role="img" aria-label="Editar Vértices">✏️</span> Editar Vértices
          </button>

          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            <span role="img" aria-label="Medir Distância">📏</span> Medir Distância
          </button>

          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            <span role="img" aria-label="Calcular Área">📐</span> Calcular Área
          </button>
        </div>

        {/* Mapa com Layers */}
        <div style={{
          width: '100%',
          height: '600px',
          background: '#e0e0e0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '3rem' }}>
              <span role="img" aria-label="Mapa">🗺️</span>
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Mapa de Validação</p>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Layers Ativas:</strong></p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ opacity: 0.5 }}>▢ Desenho Cliente (rascunho)</li>
                <li style={{ color: '#667eea' }}>▢ Geometria Oficial (ajustada)</li>
                <li style={{ color: '#f44336' }}>▢ Sobreposições</li>
                <li style={{ color: '#4caf50' }}>▢ Limites Compartilhados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de Validação */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>📋 Checklist de Validação</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { text: 'Geometria válida (sem auto-interseções)', checked: true },
            { text: 'Snap aplicado nos vértices', checked: true },
            { text: 'Sem sobreposições com vizinhos', checked: false },
            { text: 'Área calculada correta', checked: true },
            { text: 'CRS SIRGAS 2000 (EPSG:4674)', checked: true },
            { text: 'Confrontantes identificados', checked: false },
          ].map((item, i) => (
            <label key={i} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={item.checked}
                style={{ marginRight: '1rem', transform: 'scale(1.5)' }}
              />
              <span style={{
                color: item.checked ? '#4caf50' : '#666',
                textDecoration: item.checked ? 'line-through' : 'none'
              }}>
                {item.text}
              </span>
            </label>
          ))}
        </div>

        <button style={{
          marginTop: '2rem',
          width: '100%',
          padding: '1rem',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          ✅ Aprovar Geometria Oficial
        </button>
      </div>
    </div>
  );
}
