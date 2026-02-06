import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Alert, Button, Input } from '../../components/UIComponents';
import { supabase } from '../../lib/supabase';
import apiClient from '../../services/api';
import './AuthPages.css';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const token = data.session?.access_token;
      if (!token) throw new Error('Sessão inválida');

      apiClient.setToken(token);

      // Verificar/criar perfil como proprietário
      const perfilResponse = await apiClient.getPerfilMe();

      if (perfilResponse.error || !perfilResponse.data) {
        // Primeiro acesso: definir como proprietário
        await apiClient.setPerfilRole('proprietario');
      }

      // Sempre redirecionar para área do cliente
      navigate('/cliente');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-content">
        <div className="auth-card">
          <h2 className="auth-title">Entrar</h2>
          <p className="auth-subtitle">Acesse sua área de regularização</p>

          {erro && (
            <Alert type="error" title="Erro">
              {erro}
            </Alert>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <Input
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              required
            />

            <Input
              id="password"
              name="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Senha"
              required
            />

            <Button
              type="submit"
              disabled={carregando}
              isLoading={carregando}
              className="auth-button"
            >
              Entrar
            </Button>
          </form>

          <div className="auth-banner">
            <strong>Quer acesso às ferramentas profissionais?</strong>
            <div>Upgrade para Premium após login</div>
          </div>

          <div className="auth-links">
            <Link to="/forgot-password">Esqueci a Senha</Link>
            <span>•</span>
            <Link to="/signup">Criar Conta</Link>
          </div>

          <div className="auth-backlink">
            <Link to="/">Voltar para Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
