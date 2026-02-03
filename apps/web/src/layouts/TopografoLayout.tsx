import { Outlet, Link, useLocation } from 'react-router-dom';

export default function TopografoLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: '#667eea',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>🗺️ Dashboard do Topógrafo</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span>Projeto: Loteamento XYZ</span>
            <a href="/" style={{ color: 'white', textDecoration: 'none' }}>
              ← Sair
            </a>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          background: 'white',
          borderRight: '1px solid #ddd',
          padding: '2rem 0'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link
              to="/topografo/dashboard"
              style={{
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('dashboard') ? '#667eea' : '#333',
                background: isActive('dashboard') ? '#f0f4ff' : 'transparent',
                borderLeft: isActive('dashboard') ? '4px solid #667eea' : '4px solid transparent',
                fontWeight: isActive('dashboard') ? 'bold' : 'normal'
              }}
            >
              📊 Dashboard Confluência
            </Link>

            <Link
              to="/topografo/projetos"
              style={{
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('projetos') ? '#667eea' : '#333',
                background: isActive('projetos') ? '#f0f4ff' : 'transparent',
                borderLeft: isActive('projetos') ? '4px solid #667eea' : '4px solid transparent',
                fontWeight: isActive('projetos') ? 'bold' : 'normal'
              }}
            >
              📁 Meus Projetos
            </Link>

            <Link
              to="/topografo/validar"
              style={{
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('validar') ? '#667eea' : '#333',
                background: isActive('validar') ? '#f0f4ff' : 'transparent',
                borderLeft: isActive('validar') ? '4px solid #667eea' : '4px solid transparent',
                fontWeight: isActive('validar') ? 'bold' : 'normal'
              }}
            >
              ✅ Validar Desenhos
            </Link>

            <Link
              to="/topografo/pecas"
              style={{
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('pecas') ? '#667eea' : '#333',
                background: isActive('pecas') ? '#f0f4ff' : 'transparent',
                borderLeft: isActive('pecas') ? '4px solid #667eea' : '4px solid transparent',
                fontWeight: isActive('pecas') ? 'bold' : 'normal'
              }}
            >
              📄 Gerar Peças Técnicas
            </Link>

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <Link
              to="/topografo/orcamentos"
              style={{
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('orcamentos') ? '#667eea' : '#333',
                background: isActive('orcamentos') ? '#f0f4ff' : 'transparent',
                borderLeft: isActive('orcamentos') ? '4px solid #667eea' : '4px solid transparent',
                fontWeight: isActive('orcamentos') ? 'bold' : 'normal'
              }}
            >
              💰 Orçamentos
            </Link>

            <Link
              to="/topografo/financeiro"
              style={{
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: isActive('financeiro') ? '#667eea' : '#333',
                background: isActive('financeiro') ? '#f0f4ff' : 'transparent',
                borderLeft: isActive('financeiro') ? '4px solid #667eea' : '4px solid transparent',
                fontWeight: isActive('financeiro') ? 'bold' : 'normal'
              }}
            >
              💳 Financeiro
            </Link>

            <div style={{ padding: '0 2rem' }}>
              <h4 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                FERRAMENTAS
              </h4>
              <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '2' }}>
                <p>🧲 Snap Tool</p>
                <p>✏️ Editar Geometrias</p>
                <p>📏 Medir</p>
                <p>🔍 Topology Check</p>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, background: '#f5f5f5' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
