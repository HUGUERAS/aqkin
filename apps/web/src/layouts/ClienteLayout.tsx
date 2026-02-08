import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import Icon from '../components/Icon';

import '../styles/map-focused-layout.css';

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
          <nav className="portal-nav">
            <Link to="/cliente/desenhar" className={`nav-pill ${isActive('desenhar') ? 'active' : ''}`}>
              <Icon name="map-pin" size="sm" />
              Desenhar
            </Link>
            <Link to="/cliente/vizinhos" className={`nav-pill ${isActive('vizinhos') ? 'active' : ''}`}>
              <Icon name="users" size="sm" />
              Vizinhos
            </Link>
            <Link to="/cliente/documentos" className={`nav-pill ${isActive('documentos') ? 'active' : ''}`}>
              <Icon name="file" size="sm" />
              Documentos
            </Link>
          </nav>
          <Link to="/" className="nav-pill">
            <Icon name="logout" size="sm" />
            Sair
          </Link>
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
