import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import apiClient from '../../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || 'cliente';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'cliente' | 'topografo'>(roleParam as any);
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

      // Verificar se usuário já tem perfil definido
      const perfilResponse = await apiClient.getPerfilMe();

      if (perfilResponse.error || !perfilResponse.data) {
        // Primeiro acesso: definir role no backend
        const roleApi = role === 'topografo' ? 'topografo' : 'proprietario';
        await apiClient.setPerfilRole(roleApi);

        // Redirecionar baseado no role selecionado
        if (role === 'cliente') {
          navigate('/cliente');
        } else {
          navigate('/topografo');
        }
      } else {
        // Usuário já tem perfil: redirecionar baseado no perfil existente
        const perfilExistente = perfilResponse.data.role;
        if (perfilExistente === 'topografo') {
          navigate('/topografo');
        } else {
          navigate('/cliente');
        }
      }
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
      background: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
          {role === 'cliente' ? (
            <>
              <span role="img" aria-label="Portal do Proprietário">📱</span> Portal do Proprietário
            </>
          ) : (
            <>
              <span role="img" aria-label="Portal do Topógrafo">🗺️</span> Portal do Topógrafo
            </>
          )}
        </h2>

        {erro && (
          <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '6px', fontSize: '0.9rem' }}>
            {erro}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
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
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
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
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Tipo de Acesso
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="cliente">Proprietário</option>
              <option value="topografo">Topógrafo</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              padding: '1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
          <a href="/forgot-password" style={{ color: '#667eea', textDecoration: 'none', marginRight: '1rem' }}>
            Esqueci a Senha
          </a>
          |
          <a href="/signup" style={{ color: '#667eea', textDecoration: 'none', marginLeft: '1rem' }}>
            Criar Conta
          </a>
        </p>

        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
          <a href="/" style={{ color: '#667eea', textDecoration: 'none' }}>
            ← Voltar para Home
          </a>
        </p>
      </div >
    </div >
  );
}
