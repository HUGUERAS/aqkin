import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/PortalLayout.css';

export default function TopografoLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="inner">
          <div className="portal-brand">🗺️ Dashboard do Topógrafo</div>
          <div className="portal-nav">
            <span className="nav-pill active" style={{ pointerEvents: 'none' }}>Projeto: Loteamento XYZ</span>
            <Link to="/" className="nav-pill">← Sair</Link>
          </div>
        </div>
      </header>

      <div className="portal-content">
        <aside className="portal-sidebar">
          <nav>
            <Link to="/topografo/dashboard" className={`sidebar-link ${isActive('dashboard') ? 'active' : ''}`}>
              📊 Dashboard Confluência
            </Link>
            <Link to="/topografo/projetos" className={`sidebar-link ${isActive('projetos') ? 'active' : ''}`}>
              📁 Meus Projetos
            </Link>
            <Link to="/topografo/validar" className={`sidebar-link ${isActive('validar') ? 'active' : ''}`}>
              ✅ Validar Desenhos
            </Link>
            <Link to="/topografo/pecas" className={`sidebar-link ${isActive('pecas') ? 'active' : ''}`}>
              📄 Gerar Peças Técnicas
            </Link>

            <div className="sidebar-section">
              <h4>FERRAMENTAS</h4>
              <p>🧲 Snap Tool</p>
              <p>✏️ Editar Geometrias</p>
              <p>📏 Medir</p>
              <p>🔍 Topology Check</p>
            </div>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid rgba(15,23,42,0.08)' }} />

            <Link to="/topografo/orcamentos" className={`sidebar-link ${isActive('orcamentos') ? 'active' : ''}`}>
              💰 Orçamentos
            </Link>
            <Link to="/topografo/financeiro" className={`sidebar-link ${isActive('financeiro') ? 'active' : ''}`}>
              💳 Financeiro
            </Link>
          </nav>
        </aside>

        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
