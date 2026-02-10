export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        color: '#e5e7eb',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          padding: '36px',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
          maxWidth: '520px',
          width: '100%',
        }}
      >
        <p style={{ margin: 0, letterSpacing: '4px', color: '#94a3b8' }}>Erro</p>
        <h1 style={{ fontSize: '5rem', margin: '8px 0 0', fontWeight: 800, color: '#f8fafc' }}>404</h1>
        <p style={{ fontSize: '1.25rem', margin: '12px 0 20px', color: '#cbd5e1' }}>
          Página não encontrada. O mapa que você procura não existe.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              padding: '0.9rem 1.4rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 10px 30px rgba(59,130,246,0.35)',
            }}
          >
            Voltar para Home
          </a>
          <a
            href="/cliente"
            style={{
              padding: '0.9rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.4)',
              color: '#60a5fa',
              textDecoration: 'none',
              fontWeight: 600,
              background: 'rgba(15, 23, 42, 0.6)',
            }}
          >
            Ir para painel
          </a>
        </div>
      </div>
    </div>
  );
}
