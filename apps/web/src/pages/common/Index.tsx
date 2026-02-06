import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/HomePage.css';

export default function Index() {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleMobileMenu = () => setIsExpanded(!isExpanded);

  return (
    <div className="home-shell">
      {/* MAP - FULL SCREEN */}
      <div className="hero">
        <div className="map-card">
          <div className="map-badge">🌐 Regularização fundiária visual</div>
          <div className="map-preview">
            <div className="map-grid" />
            <div className="map-overlay">
              <h2>Visualize sua propriedade no mapa</h2>
              <p>
                Desenhe sua área, gerencie documentos e regularize sua propriedade de forma simples.
              </p>
              <div className="map-tags">
                <span>📍 Desenhar área</span>
                <span>👥 Vizinhos</span>
                <span>📄 Documentos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE TOGGLE BUTTON */}
      <button
        className={`sidebar-toggle ${isExpanded ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Menu"
      >
        {isExpanded ? '✕' : '☰'}
      </button>

      {/* SIDEBAR - LOGIN */}
      <div className={`hero-card ${isExpanded ? 'expanded' : ''}`}>
        <h1 className="hero-title">Ativo Real</h1>
        <p className="hero-sub">
          Regularize sua propriedade de forma simples e visual
        </p>

        <div className="card-actions">
          <Link to="/login" className="option primary" onClick={() => setIsExpanded(false)}>
            <div>
              <div className="label">🔑 Entrar na plataforma</div>
              <div className="desc">Acesse sua área e documentos</div>
            </div>
          </Link>

          <Link to="/signup" className="option secondary" onClick={() => setIsExpanded(false)}>
            <div>
              <div className="label">➕ Criar conta grátis</div>
              <div className="desc">Comece agora em 2 minutos</div>
            </div>
          </Link>
        </div>

        <div className="resource-entry-banner">
          <div className="resource-header">
            <div className="resource-icon">📋</div>
            <div className="resource-badge">Novo</div>
          </div>
          <h3>Entrada de Recurso</h3>
          <p>
            Tem dúvida sobre sua propriedade? Registre uma entrada de recurso e nossa equipe de especialistas analisará seu caso.
          </p>
          <button className="resource-cta" onClick={() => setIsExpanded(false)}>
            Registrar Agora
          </button>
        </div>

        <div className="premium-banner">
          <div className="premium-icon">⭐</div>
          <div className="premium-text">
            <strong>Acesso Premium</strong>
            <span>Ferramentas profissionais de topografia e validação</span>
          </div>
        </div>

        <div className="card-links">
          <Link to="/suporte" onClick={() => setIsExpanded(false)}>
            ❓ Precisa de ajuda?
          </Link>
          <Link to="/sobre" onClick={() => setIsExpanded(false)}>
            ℹ️ Saiba mais
          </Link>
        </div>
      </div>
    </div>
  );
}
