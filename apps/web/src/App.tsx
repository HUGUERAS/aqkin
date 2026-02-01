import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages Common
import Index from './pages/common/Index';
import Login from './pages/common/Login';
import NotFound from './pages/common/NotFound';

// Pages Cliente
import DesenharArea from './pages/cliente/DesenharArea';
import MeusVizinhos from './pages/cliente/MeusVizinhos';
import UploadDocumentos from './pages/cliente/UploadDocumentos';

// Pages Topógrafo
import DashboardConfluencia from './pages/topografo/DashboardConfluencia';
import ValidarDesenhos from './pages/topografo/ValidarDesenhos';
import GerarPecas from './pages/topografo/GerarPecas';

// Layouts
import ClienteLayout from './layouts/ClienteLayout';
import TopografoLayout from './layouts/TopografoLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/* Cliente Routes - Portal Mobile */}
        <Route path="/cliente" element={<ClienteLayout />}>
          <Route index element={<Navigate to="/cliente/desenhar" replace />} />
          <Route path="desenhar" element={<DesenharArea />} />
          <Route path="vizinhos" element={<MeusVizinhos />} />
          <Route path="documentos" element={<UploadDocumentos />} />
        </Route>

        {/* Topógrafo Routes - Dashboard Desktop */}
        <Route path="/topografo" element={<TopografoLayout />}>
          <Route index element={<Navigate to="/topografo/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardConfluencia />} />
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
