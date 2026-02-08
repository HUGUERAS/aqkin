import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'topografo' | 'proprietario';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setUserRole] = useState<string | null>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // --- BYPASS TEMPORÁRIO PARA VISUALIZAÇÃO SEM BACKEND ---
    console.warn('⚠️ MODO DE DESENVOLVIMENTO: Authentication Bypass Ativado');

    // Simula um delay de rede para parecer real
    const timer = setTimeout(() => {
      setIsAuthenticated(true);

      // MODO DEV: Define role baseado na URL acessada
      if (allowedRole === 'topografo') {
        setUserRole('topografo');
        setHasPremium(true); // Topógrafo sempre tem premium em dev
      } else {
        setUserRole('proprietario');
        setHasPremium(false);
      }

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
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)'
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
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
          maxWidth: '480px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            <span role="img" aria-label="Estrela">⭐</span>
          </div>
          <h2 style={{ marginBottom: '1rem', color: '#f8fafc', fontSize: '1.8rem' }}>
            Acesso Premium Necessário
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6' }}>
            As ferramentas profissionais de topografia estão disponíveis apenas para usuários Premium.
            Faça upgrade agora e tenha acesso a:
          </p>
          <ul style={{ textAlign: 'left', color: '#e5e7eb', marginBottom: '2rem', lineHeight: '1.8' }}>
            <li><span role="img" aria-label="Sucesso">✅</span> Validação de desenhos</li>
            <li><span role="img" aria-label="Sucesso">✅</span> Geração de peças técnicas</li>
            <li><span role="img" aria-label="Sucesso">✅</span> Gerenciamento de projetos</li>
            <li><span role="img" aria-label="Sucesso">✅</span> Orçamentos e financeiro</li>
          </ul>
          <button
            onClick={() => window.location.href = '/cliente'}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            <span role="img" aria-label="Foguete">🚀</span> Fazer Upgrade
          </button>
          <button
            onClick={() => window.location.href = '/cliente'}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              color: '#93c5fd',
              border: '2px solid rgba(59, 130, 246, 0.7)',
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

  return children;
}
