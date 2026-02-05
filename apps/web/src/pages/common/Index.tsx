import { Link } from 'react-router-dom';
import '../../styles/HomePage.css';

export default function Index() {
  return (
    <div className="home-shell">
      <div className="hero">
        <div className="texture-panel">
          <div className="eyebrow">🚀 Regularização 100% Digital</div>
          <h1 className="hero-title">Ativo Real</h1>
          <p className="hero-sub">
            Plataforma inovadora para coleta colaborativa de dados e regularização fundiária.
            Conectamos proprietários e profissionais com tecnologia de ponta.
          </p>

          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-icon">🏡</span>
              <div className="stat-text">
                <strong>Proprietários</strong>
                <span>Legalize seu imóvel</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📐</span>
              <div className="stat-text">
                <strong>Topógrafos</strong>
                <span>Gerencie projetos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <span className="card-kicker">Acesso ao Sistema</span>
          <h2 className="card-title">Como deseja continuar?</h2>
          <p className="card-sub">Selecione seu perfil de acesso abaixo:</p>
          
          <div className="card-actions">
            <Link to="/login?role=cliente" className="option urbano">
              <div>
                <div className="label">Sou Proprietário</div>
                <div className="desc">Regularizar meu imóvel</div>
              </div>
            </Link>
            
            <Link to="/login?role=topografo" className="option rural">
              <div>
                <div className="label">Sou Topógrafo</div>
                <div className="desc">Acessar projetos</div>
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
