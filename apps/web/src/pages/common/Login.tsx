import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import apiClient from '../../services/api';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.8rem', color: '#1a202c' }}>
          <span role="img" aria-label="Chave">🔑</span> Entrar
        </h2>
        <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#718096', fontSize: '0.95rem' }}>
          Acesse sua área de regularização
        </p>

        {erro && (
          <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '6px', fontSize: '0.9rem' }}>
            {erro}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d3748' }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d3748' }}>
              Senha
            </label>
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              padding: '1rem',
              background: carregando ? '#3b3b3b' : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: carregando ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            {carregando ? (
              <>
                <span role="img" aria-label="Carregando">⏳</span> Entrando...
              </>
            ) : (
              <>
                <span role="img" aria-label="Foguete">🚀</span> Entrar
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef6e7', border: '1px solid #f6d365', borderRadius: '8px', fontSize: '0.85rem', color: '#744210', textAlign: 'center' }}>
          <span role="img" aria-label="Estrela">⭐</span> <strong>Quer acesso às ferramentas profissionais?</strong><br />
          <span style={{ fontSize: '0.8rem' }}>Upgrade para Premium após login</span>
        </div>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#718096', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a href="/forgot-password" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Esqueci a Senha
          </a>
          <span>•</span>
          <a href="/signup" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Criar Conta
          </a>
        </p>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Voltar para Home
          </a>
        </p>
      </div >
    </div >
  );
}
