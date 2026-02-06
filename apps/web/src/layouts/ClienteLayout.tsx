import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { Button } from '../components/UIComponents';
import '../styles/PortalLayout.css';

export default function ClienteLayout() {
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
              <Icon name="home" size="sm" />
              Minha Propriedade
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
            {/* Seção principal */}
            <div style={{ paddingBottom: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <Link to="/cliente/desenhar" className={`sidebar-link ${isActive('desenhar') ? 'active' : ''}`}>
                <Icon name="map-pin" size="md" />
                Desenhar Área
              </Link>
              <Link to="/cliente/vizinhos" className={`sidebar-link ${isActive('vizinhos') ? 'active' : ''}`}>
                <Icon name="users" size="md" />
                Meus Vizinhos
              </Link>
              <Link to="/cliente/documentos" className={`sidebar-link ${isActive('documentos') ? 'active' : ''}`}>
                <Icon name="file" size="md" />
                Documentos
              </Link>
            </div>

            {/* Informações da propriedade */}
            <div className="sidebar-section">
              <h4>📍 Sua Propriedade</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0' }}>
                <strong>Lote ID:</strong> 999
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0' }}>
                <strong>Status:</strong> <span style={{ color: '#f59e0b' }}>Pendente</span>
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0' }}>
                <strong>Topógrafo:</strong> João Silva
              </p>
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
