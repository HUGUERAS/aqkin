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
          <div className="map-badge">
            <span role="img" aria-label="Globo">🌐</span> Regularização fundiária visual
          </div>
          <div className="map-preview">
            <div className="map-grid" />
            <div className="map-overlay">
              <h2>Visualize sua propriedade no mapa</h2>
              <p>
                Desenhe sua área, gerencie documentos e regularize sua propriedade de forma simples.
              </p>
              <div className="map-tags">
                <span><span role="img" aria-label="Localização">📍</span> Desenhar área</span>
                <span><span role="img" aria-label="Pessoas">👥</span> Vizinhos</span>
                <span><span role="img" aria-label="Documento">📄</span> Documentos</span>
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
        {isExpanded ? (
          <span role="img" aria-label="Fechar">✕</span>
        ) : (
          <span role="img" aria-label="Menu">☰</span>
        )}
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
              <div className="label"><span role="img" aria-label="Chave">🔑</span> Entrar na plataforma</div>
              <div className="desc">Acesse sua área e documentos</div>
            </div>
          </Link>

          <Link to="/signup" className="option secondary" onClick={() => setIsExpanded(false)}>
            <div>
              <div className="label"><span role="img" aria-label="Adicionar">➕</span> Criar conta grátis</div>
              <div className="desc">Comece agora em 2 minutos</div>
            </div>
          </Link>
        </div>

        <div className="premium-banner">
          <div className="premium-icon"><span role="img" aria-label="Estrela">⭐</span></div>
          <div className="premium-text">
            <strong>Acesso Premium</strong>
            <span>Ferramentas profissionais de topografia e validação</span>
          </div>
        </div>

        <div className="card-links">
          <Link to="/suporte" onClick={() => setIsExpanded(false)}>
            <span role="img" aria-label="Ajuda">❓</span> Precisa de ajuda?
          </Link>
          <Link to="/sobre" onClick={() => setIsExpanded(false)}>
            <span role="img" aria-label="Informação">ℹ️</span> Saiba mais
          </Link>
        </div>
      </div>
    </div>
  );
}
