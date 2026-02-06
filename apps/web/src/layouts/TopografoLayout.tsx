import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import '../styles/PortalLayout.css';

export default function TopografoLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="portal-shell topografo-pro">
      <header className="portal-header topografo-header">
        <div className="inner">
          <div className="portal-brand">
            <Logo size="md" variant="icon" />
            <div className="brand-text">
              <span className="brand-name">AtivoReal</span>
              <span className="brand-role">Topógrafo</span>
            </div>
          </div>
          <div className="portal-nav">
            <span className="nav-pill project-pill">
              <Icon name="map" size="sm" />
              <span className="project-label">Projeto Ativo:</span>
              <span className="project-name">Loteamento XYZ</span>
            </span>
            <Link to="/" className="nav-pill logout-pill">
              <Icon name="logout" size="sm" />
              Sair
            </Link>
          </div>
        </div>
      </header>

      <div className="portal-content">
        <aside className="portal-sidebar topografo-sidebar">
          <nav>
            {/* Seção: Visão Geral */}
            <div className="sidebar-section-group">
              <div className="section-label">
                <span className="section-icon">📊</span>
                Visão Geral
              </div>
              <Link to="/topografo/dashboard" className={`sidebar-link ${isActive('dashboard') ? 'active' : ''}`}>
                <Icon name="chart" size="md" />
                <span className="link-text">Dashboard</span>
              </Link>
              <Link to="/topografo/projetos" className={`sidebar-link ${isActive('projetos') ? 'active' : ''}`}>
                <Icon name="grid" size="md" />
                <span className="link-text">Meus Projetos</span>
              </Link>
            </div>

            {/* Seção: Trabalho Técnico */}
            <div className="sidebar-section-group">
              <div className="section-label">
                <span className="section-icon">🛠️</span>
                Trabalho Técnico
              </div>
              <Link to="/topografo/validar" className={`sidebar-link ${isActive('validar') ? 'active' : ''}`}>
                <Icon name="check" size="md" />
                <span className="link-text">Validar Geometria</span>
                <span className="link-badge cad">CAD</span>
              </Link>
              <Link to="/topografo/pecas" className={`sidebar-link ${isActive('pecas') ? 'active' : ''}`}>
                <Icon name="download" size="md" />
                <span className="link-text">Peças Técnicas</span>
              </Link>
            </div>

            {/* Seção: Ferramentas CAD Rápidas */}
            <div className="sidebar-section-group tools-group">
              <div className="section-label">
                <span className="section-icon">⚡</span>
                Ferramentas Rápidas
              </div>
              <div className="quick-tools-grid">
                <button className="quick-tool-btn" title="Snap 0.5m">
                  <span className="tool-icon">🧲</span>
                  <span className="tool-name">Snap</span>
                </button>
                <button className="quick-tool-btn" title="Editar Vértices">
                  <span className="tool-icon">✏️</span>
                  <span className="tool-name">Editar</span>
                </button>
                <button className="quick-tool-btn" title="Medir Distância">
                  <span className="tool-icon">📏</span>
                  <span className="tool-name">Medir</span>
                </button>
                <button className="quick-tool-btn" title="Calcular Área">
                  <span className="tool-icon">📐</span>
                  <span className="tool-name">Área</span>
                </button>
                <button className="quick-tool-btn" title="Verificar Topologia">
                  <span className="tool-icon">🔍</span>
                  <span className="tool-name">Topo</span>
                </button>
                <button className="quick-tool-btn" title="Buffer">
                  <span className="tool-icon">◎</span>
                  <span className="tool-name">Buffer</span>
                </button>
              </div>
            </div>

            {/* Seção: Financeiro */}
            <div className="sidebar-section-group">
              <div className="section-label">
                <span className="section-icon">💰</span>
                Gestão Financeira
              </div>
              <Link to="/topografo/orcamentos" className={`sidebar-link ${isActive('orcamentos') ? 'active' : ''}`}>
                <Icon name="dollar" size="md" />
                <span className="link-text">Orçamentos</span>
              </Link>
              <Link to="/topografo/financeiro" className={`sidebar-link ${isActive('financeiro') ? 'active' : ''}`}>
                <Icon name="chart" size="md" />
                <span className="link-text">Financeiro</span>
              </Link>
            </div>
          </nav>

          {/* Status Footer */}
          <div className="sidebar-footer">
            <div className="status-indicator">
              <span className="status-dot online"></span>
              <span className="status-text">Sistema Online</span>
            </div>
            <div className="version-info">v1.2.0</div>
          </div>
        </aside>

        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
