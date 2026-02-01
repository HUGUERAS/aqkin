export default function Index() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
        🏡 Ativo Real
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '3rem', textAlign: 'center', maxWidth: '600px' }}>
        Plataforma de Coleta Colaborativa de Dados para Regularização Fundiária
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href="/login?role=cliente"
          style={{
            padding: '1rem 2rem',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          📱 Sou Proprietário
        </a>

        <a
          href="/login?role=topografo"
          style={{
            padding: '1rem 2rem',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '2px solid white'
          }}
        >
          🗺️ Sou Topógrafo
        </a>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.8 }}>
        <h3>🎯 Diferencial: Coleta Colaborativa</h3>
        <p>Clientes desenham suas áreas → Topógrafo valida → Sistema detecta sobreposições automaticamente</p>
      </div>
    </div>
  );
}
