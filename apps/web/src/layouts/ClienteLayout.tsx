import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import apiClient from '../services/api';

import '../styles/map-focused-layout.css';

export default function ClienteLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const loteParam = searchParams.get('lote');
  const qs = token ? `?token=${token}` : loteParam ? `?lote=${loteParam}` : '';

  const [percentage, setPercentage] = useState(0);

  const isActive = (path: string) => location.pathname.includes(path);

  // Fetch progress on route change
  useEffect(() => {
    if (token) {
      apiClient.getProgressoPorToken(token).then((r) => {
        if (r.data) setPercentage(r.data.percentage);
      });
    }
  }, [token, location.pathname]);

  return (
    <div className="portal-shell">
      {/* Progress bar at very top */}
      {percentage > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(59, 130, 246, 0.15)',
          zIndex: 100,
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: percentage === 100
              ? '#10b981'
              : 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
            transition: 'width 500ms ease',
          }} />
        </div>
      )}

      <header className="portal-header">
        <div className="inner">
          <div className="portal-brand">
            <Logo size="md" variant="icon" />
            <span>AtivoReal</span>
          </div>
          <nav className="portal-nav">
            <Link to={`/cliente/bemvindo${qs}`} className={`nav-pill ${isActive('bemvindo') ? 'active' : ''}`}>
              <Icon name="home" size="sm" />
              Inicio
            </Link>
            <Link to={`/cliente/dados${qs}`} className={`nav-pill ${isActive('dados') ? 'active' : ''}`}>
              <Icon name="user" size="sm" />
              Dados
            </Link>
            <Link to={`/cliente/desenhar${qs}`} className={`nav-pill ${isActive('desenhar') ? 'active' : ''}`}>
              <Icon name="map-pin" size="sm" />
              Mapa
            </Link>
            <Link to={`/cliente/vizinhos${qs}`} className={`nav-pill ${isActive('vizinhos') ? 'active' : ''}`}>
              <Icon name="users" size="sm" />
              Vizinhos
            </Link>
            <Link to={`/cliente/documentos${qs}`} className={`nav-pill ${isActive('documentos') ? 'active' : ''}`}>
              <Icon name="file" size="sm" />
              Docs
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
