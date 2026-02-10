import { useEffect, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';

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
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    // Se tem token de acesso (magic link), permite acesso como proprietario
    if (allowedRole === 'proprietario' && token) {
      apiClient
        .getLotePorToken(token)
        .then((r) => {
          if (r.data && typeof r.data === 'object') {
            setIsAuthenticated(true);
            setUserRole('proprietario');
          } else {
            setIsAuthenticated(false);
          }
        })
        .catch((error) => {
          // Garante que falhas de rede/servidor nao deixem a rota presa em loading
          console.error('Erro ao buscar lote pelo token de acesso:', error);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    // --- BYPASS TEMPORARIO PARA VISUALIZACAO SEM BACKEND ---
    console.warn('MODO DE DESENVOLVIMENTO: Authentication Bypass Ativado');

    const timer = setTimeout(() => {
      setIsAuthenticated(true);

      if (allowedRole === 'topografo') {
        setUserRole('topografo');
        setHasPremium(true);
      } else {
        setUserRole('proprietario');
        setHasPremium(false);
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [allowedRole, searchParams]);

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
            <span role="img" aria-label="Carregando">&#x23F3;</span>
          </div>
          <div style={{ color: '#e5e7eb' }}>Verificando acesso...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

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
          <h2 style={{ marginBottom: '1rem', color: '#f8fafc', fontSize: '1.8rem' }}>
            Acesso Premium Necessario
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6' }}>
            As ferramentas profissionais de topografia estao disponiveis apenas para usuarios Premium.
          </p>
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
            Fazer Upgrade
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
            Voltar para minha area
          </button>
        </div>
      </div>
    );
  }

  return children;
}
