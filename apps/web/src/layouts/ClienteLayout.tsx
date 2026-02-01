import { Outlet, Link, useLocation } from 'react-router-dom';

export default function ClienteLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header Simples */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #ddd',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#667eea' }}>📱 Portal do Proprietário</h2>

          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link
              to="/cliente/desenhar"
              style={{
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                background: isActive('desenhar') ? '#667eea' : 'transparent',
                color: isActive('desenhar') ? 'white' : '#667eea'
              }}
            >
              ✏️ Desenhar
            </Link>

            <Link
              to="/cliente/vizinhos"
              style={{
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                background: isActive('vizinhos') ? '#667eea' : 'transparent',
                color: isActive('vizinhos') ? 'white' : '#667eea'
              }}
            >
              👥 Vizinhos
            </Link>

            <Link
              to="/cliente/documentos"
              style={{
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                background: isActive('documentos') ? '#667eea' : 'transparent',
                color: isActive('documentos') ? 'white' : '#667eea'
              }}
            >
              📄 Documentos
            </Link>
          </nav>

          <a href="/" style={{ color: '#667eea', textDecoration: 'none' }}>
            ← Sair
          </a>
        </div>
      </header>

      {/* Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
