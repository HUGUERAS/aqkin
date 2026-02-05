import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'topografo' | 'proprietario';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // --- BYPASS TEMPORÁRIO PARA VISUALIZAÇÃO SEM BACKEND ---
    console.warn('⚠️ MODO DE DESENVOLVIMENTO: Authentication Bypass Ativado');

    // Simula um delay de rede para parecer real
    const timer = setTimeout(() => {
      setIsAuthenticated(true);

      // Todos usuários são proprietario por padrão
      setUserRole('proprietario');

      // TODO: Buscar do backend se usuário tem plano premium
      // Por enquanto, simula que não tem premium
      setHasPremium(false);

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [allowedRole]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            <span role="img" aria-label="Carregando">⏳</span>
          </div>
          <div>Verificando acesso (Modo Dev)...</div>
        </div>
      </div>
    );
  }

  // Usuário não autenticado → redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Se tentar acessar área de topógrafo mas não tem plano premium
  if (allowedRole === 'topografo' && !hasPremium) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          maxWidth: '480px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
          <h2 style={{ marginBottom: '1rem', color: '#1a202c', fontSize: '1.8rem' }}>
            Acesso Premium Necessário
          </h2>
          <p style={{ color: '#718096', marginBottom: '2rem', lineHeight: '1.6' }}>
            As ferramentas profissionais de topografia estão disponíveis apenas para usuários Premium.
            Faça upgrade agora e tenha acesso a:
          </p>
          <ul style={{ textAlign: 'left', color: '#2d3748', marginBottom: '2rem', lineHeight: '1.8' }}>
            <li>✅ Validação de desenhos</li>
            <li>✅ Geração de peças técnicas</li>
            <li>✅ Gerenciamento de projetos</li>
            <li>✅ Orçamentos e financeiro</li>
          </ul>
          <button
            onClick={() => window.location.href = '/cliente'}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            🚀 Fazer Upgrade
          </button>
          <button
            onClick={() => window.location.href = '/cliente'}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Voltar para minha área
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
