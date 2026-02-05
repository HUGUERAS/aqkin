import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import '../styles/PortalLayout.css';

export default function TopografoLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="inner">
          <div className="portal-brand">
            <Logo size="md" variant="icon" />
            <span>AtivoReal</span>
          </div>
          <div className="portal-nav">
            <span className="nav-pill active" style={{ pointerEvents: 'none' }}>
              <Icon name="map" size="sm" />
              Projeto: Loteamento XYZ
            </span>
            <Link to="/" className="nav-pill">
              <Icon name="logout" size="sm" />
              Sair
            </Link>
          </div>
        </div>
      </header>

      <div className="portal-content">
        <aside className="portal-sidebar">
          <nav>
            <Link to="/topografo/dashboard" className={`sidebar-link ${isActive('dashboard') ? 'active' : ''}`}>
              <Icon name="chart" size="md" />
              Dashboard
            </Link>
            <Link to="/topografo/projetos" className={`sidebar-link ${isActive('projetos') ? 'active' : ''}`}>
              <Icon name="grid" size="md" />
              Projetos
            </Link>
            <Link to="/topografo/validar" className={`sidebar-link ${isActive('validar') ? 'active' : ''}`}>
              <Icon name="check" size="md" />
              Validar
            </Link>
            <Link to="/topografo/pecas" className={`sidebar-link ${isActive('pecas') ? 'active' : ''}`}>
              <Icon name="download" size="md" />
              Peças Técnicas
            </Link>

            <div className="sidebar-section">
              <h4>FERRAMENTAS</h4>
              <p className="flex items-center gap-2">
                <Icon name="map-pin" size="sm" />
                Snap Tool
              </p>
              <p className="flex items-center gap-2">
                <Icon name="edit" size="sm" />
                Editar Geometrias
              </p>
              <p className="flex items-center gap-2">
                <Icon name="search" size="sm" />
                Topology Check
              </p>
            </div>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid rgba(15,23,42,0.08)' }} />

            <Link to="/topografo/orcamentos" className={`sidebar-link ${isActive('orcamentos') ? 'active' : ''}`}>
              <Icon name="dollar" size="md" />
              Orçamentos
            </Link>
            <Link to="/topografo/financeiro" className={`sidebar-link ${isActive('financeiro') ? 'active' : ''}`}>
              <Icon name="chart" size="md" />
              Financeiro
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
