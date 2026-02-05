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
  const location = useLocation();

  useEffect(() => {
    // --- BYPASS TEMPORÁRIO PARA VISUALIZAÇÃO SEM BACKEND ---
    console.warn('⚠️ MODO DE DESENVOLVIMENTO: Authentication Bypass Ativado');

    // Simula um delay de rede para parecer real
    const timer = setTimeout(() => {
      setIsAuthenticated(true);
      setUserRole(allowedRole);
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

  // Usuário autenticado mas com perfil diferente do permitido
  if (userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
