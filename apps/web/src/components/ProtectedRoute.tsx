import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import apiClient from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'topografo' | 'proprietario';
}

// Cache do perfil para evitar requisições repetidas
let cachedPerfil: { role: string; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      // Se já verificamos recentemente e estamos na mesma área protegida, usar cache
      if (hasCheckedRef.current && cachedPerfil && Date.now() - cachedPerfil.timestamp < CACHE_DURATION) {
        setIsAuthenticated(true);
        setUserRole(cachedPerfil.role);
        setIsLoading(false);
        return;
      }

      try {
        // 1. Verificar autenticação via Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          cachedPerfil = null;
          hasCheckedRef.current = false;
          return;
        }

        // 2. Configurar token no apiClient
        apiClient.setToken(session.access_token);

        // 3. Buscar perfil via API
        const perfilResponse = await apiClient.getPerfilMe();

        if (perfilResponse.error || !perfilResponse.data) {
          setIsAuthenticated(false);
          setIsLoading(false);
          cachedPerfil = null;
          hasCheckedRef.current = false;
          return;
        }

        const role = perfilResponse.data.role;

        // Cachear perfil
        cachedPerfil = { role, timestamp: Date.now() };
        hasCheckedRef.current = true;

        setIsAuthenticated(true);
        setUserRole(role);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        cachedPerfil = null;
        hasCheckedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRole();

    // Limpar cache se mudar de área protegida (ex: de /topografo para /cliente)
    const isTopografoArea = location.pathname.startsWith('/topografo');
    const isClienteArea = location.pathname.startsWith('/cliente');

    if ((isTopografoArea && cachedPerfil?.role === 'proprietario') ||
      (isClienteArea && cachedPerfil?.role === 'topografo')) {
      cachedPerfil = null;
      hasCheckedRef.current = false;
    }
  }, [location.pathname]);

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
          <div>Verificando acesso...</div>
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
    // Proprietário tentando acessar área de topógrafo → redirecionar para /cliente
    if (userRole === 'proprietario' && allowedRole === 'topografo') {
      return <Navigate to="/cliente" replace />;
    }

    // Topógrafo tentando acessar área de proprietário → redirecionar para /topografo
    if (userRole === 'topografo' && allowedRole === 'proprietario') {
      return <Navigate to="/topografo" replace />;
    }

    // Fallback: redirecionar para login se role não reconhecido
    return <Navigate to="/login" replace />;
  }

  // Usuário autenticado e com perfil correto → renderizar children
  return children;
}
