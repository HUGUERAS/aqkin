import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/PortalLayout.css';

export default function ClienteLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="inner">
          <div className="portal-brand">📱 Portal do Proprietário</div>
          <nav className="portal-nav">
            <Link to="/cliente/desenhar" className={`nav-pill ${isActive('desenhar') ? 'active' : ''}`}>
              ✏️ Desenhar
            </Link>
            <Link to="/cliente/vizinhos" className={`nav-pill ${isActive('vizinhos') ? 'active' : ''}`}>
              👥 Vizinhos
            </Link>
            <Link to="/cliente/documentos" className={`nav-pill ${isActive('documentos') ? 'active' : ''}`}>
              📄 Documentos
            </Link>
          </nav>
          <Link to="/" className="nav-pill">← Sair</Link>
        </div>
      </header>

      <div className="portal-content">
        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
