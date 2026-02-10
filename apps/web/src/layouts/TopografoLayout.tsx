import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import Icon from '../components/Icon';

import '../styles/map-focused-layout.css';

export default function TopografoLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="inner">
          <div className="portal-brand">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Icon name="menu" size="md" />
            </button>
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

      {/* Overlay para fechar sidebar em mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="portal-content">
        <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav>
            <Link
              to="/topografo/dashboard"
              className={`sidebar-link ${isActive('dashboard') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name="chart" size="md" />
              Dashboard
            </Link>
            <Link
              to="/topografo/projetos"
              className={`sidebar-link ${isActive('projetos') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name="grid" size="md" />
              Projetos
            </Link>
            <Link
              to="/topografo/validar"
              className={`sidebar-link ${isActive('validar') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name="check" size="md" />
              Validar
            </Link>
            <Link
              to="/topografo/pecas"
              className={`sidebar-link ${isActive('pecas') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
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

            <Link
              to="/topografo/orcamentos"
              className={`sidebar-link ${isActive('orcamentos') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name="dollar" size="md" />
              Orçamentos
            </Link>
            <Link
              to="/topografo/financeiro"
              className={`sidebar-link ${isActive('financeiro') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
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
