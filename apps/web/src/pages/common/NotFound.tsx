import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-shell">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-text">Página não encontrada</p>
      <Link to="/" className="notfound-link">
        Voltar para Home
      </Link>
    </div>
  );
}
