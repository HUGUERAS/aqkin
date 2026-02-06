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
            <div style={{ paddingBottom: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <Link to="/topografo/dashboard" className={`sidebar-link ${isActive('dashboard') ? 'active' : ''}`}>
                <Icon name="chart" size="md" />
                Dashboard
              </Link>
              <Link to="/topografo/projetos" className={`sidebar-link ${isActive('projetos') ? 'active' : ''}`}>
                <Icon name="grid" size="md" />
                Projetos
              </Link>
            </div>

            <div style={{ paddingBottom: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <Link to="/topografo/validar" className={`sidebar-link ${isActive('validar') ? 'active' : ''}`}>
                <Icon name="check" size="md" />
                Validar Desenhos
              </Link>
              <Link to="/topografo/pecas" className={`sidebar-link ${isActive('pecas') ? 'active' : ''}`}>
                <Icon name="download" size="md" />
                Peças Técnicas
              </Link>
            </div>

            <div className="sidebar-section">
              <h4>⚡ Ferramentas Rápidas</h4>
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

            <div className="sidebar-section">
              <h4>💰 Gestão Financeira</h4>
              <Link to="/topografo/orcamentos" className={`sidebar-link ${isActive('orcamentos') ? 'active' : ''}`}>
                <Icon name="dollar" size="md" />
                Orçamentos
              </Link>
              <Link to="/topografo/financeiro" className={`sidebar-link ${isActive('financeiro') ? 'active' : ''}`}>
                <Icon name="chart" size="md" />
                Financeiro
              </Link>
            </div>
          </nav>
        </aside>

        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
