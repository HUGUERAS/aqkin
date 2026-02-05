import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import apiClient from './services/api';
import NetworkBanner from './components/NetworkBanner';

// Pages Common
import Index from './pages/common/Index';
import Login from './pages/common/Login';
import SignUp from './pages/common/SignUp';
import ForgotPassword from './pages/common/ForgotPassword';
import ResetPassword from './pages/common/ResetPassword';
import NotFound from './pages/common/NotFound';

// Pages Cliente
import DesenharArea from './pages/cliente/DesenharArea';
import MeusVizinhos from './pages/cliente/MeusVizinhos';
import UploadDocumentos from './pages/cliente/UploadDocumentos';

// Pages Topógrafo
import DashboardConfluencia from './pages/topografo/DashboardConfluencia';
import ValidarDesenhos from './pages/topografo/ValidarDesenhos';
import GerarPecas from './pages/topografo/GerarPecas';
import MeusProjetos from './pages/topografo/MeusProjetos';
import Orcamentos from './pages/topografo/Orcamentos';
import Financeiro from './pages/topografo/Financeiro';

// Layouts
import ClienteLayout from './layouts/ClienteLayout';
import TopografoLayout from './layouts/TopografoLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) apiClient.setToken(session.access_token);
    });
  }, []);

  return (
    <BrowserRouter>
      <NetworkBanner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Cliente Routes - Portal Mobile - Protegido para Proprietário */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute allowedRole="proprietario">
              <ClienteLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/cliente/desenhar" replace />} />
          <Route path="desenhar" element={<DesenharArea />} />
          <Route path="vizinhos" element={<MeusVizinhos />} />
          <Route path="documentos" element={<UploadDocumentos />} />
        </Route>

        {/* Topógrafo Routes - Dashboard Desktop - Protegido para Topógrafo */}
        <Route
          path="/topografo"
          element={
            <ProtectedRoute allowedRole="topografo">
              <TopografoLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/topografo/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardConfluencia />} />
          <Route path="projetos" element={<MeusProjetos />} />
          <Route path="orcamentos" element={<Orcamentos />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="validar" element={<ValidarDesenhos />} />
          <Route path="pecas" element={<GerarPecas />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
