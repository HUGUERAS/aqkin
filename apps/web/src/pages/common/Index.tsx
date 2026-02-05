import { Link } from 'react-router-dom';
import '../../styles/HomePage.css';

export default function Index() {
  return (
    <div className="home-shell">
      <div className="hero">
        <div className="map-card">
          <div className="map-badge">🌐 Visual do mapa</div>
          <div className="map-preview">
            <div className="map-grid" />
            <div className="map-overlay">
              <h2>Mapa pronto para desenhar</h2>
              <p>
                Veja a área, desenhe e valide sem misturar com outras telas. Tudo começa aqui:
                escolha seu perfil e continue para o fluxo correto.
              </p>
              <div className="map-tags">
                <span>Desenho</span>
                <span>Validação</span>
                <span>Upload</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <span className="card-kicker">Acesso rápido</span>
          <h1 className="hero-title">Ativo Real</h1>
          <p className="hero-sub">
            Plataforma de regularização fundiária. Escolha como quer entrar:
            login dedicado para cada perfil.
          </p>

          <div className="card-actions">
            <Link to="/login?role=cliente" className="option urbano">
              <div>
                <div className="label">Sou Proprietário</div>
                <div className="desc">Desenhar área, vizinhos, documentos</div>
              </div>
            </Link>
            <Link to="/login?role=topografo" className="option rural">
              <div>
                <div className="label">Sou Topógrafo</div>
                <div className="desc">Validar desenhos, peças, orçamentos</div>
              </div>
            </Link>
          </div>

          <div className="card-divider">ou</div>

          <div className="card-links">
            <Link to="/suporte">Precisa de ajuda?</Link>
            <Link to="/sobre">Saiba mais</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
