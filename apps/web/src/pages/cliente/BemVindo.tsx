import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import ProgressTracker from '../../components/ProgressTracker';

interface ProgressData {
  steps: { id: string; label: string; completed: boolean }[];
  completed: number;
  total: number;
  percentage: number;
  status: string;
}

export default function BemVindo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [lote, setLote] = useState<Record<string, unknown> | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Link de acesso nao encontrado. Use o link enviado pelo topografo.');
      setLoading(false);
      return;
    }

    Promise.all([
      apiClient.getLotePorToken(token),
      apiClient.getProgressoPorToken(token),
    ]).then(([loteRes, progressRes]) => {
      if (loteRes.data && typeof loteRes.data === 'object') {
        setLote(loteRes.data as Record<string, unknown>);
      } else {
        setError('Link invalido ou expirado.');
      }
      if (progressRes.data) {
        setProgress(progressRes.data);
      }
      setLoading(false);
    });
  }, [token]);

  const qs = token ? `?token=${token}` : '';

  const nextStep = progress?.steps.find((s) => !s.completed);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        color: '#e5e7eb',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>
            <span role="img" aria-label="Carregando">&#x23F3;</span>
          </div>
          <p>Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        color: '#e5e7eb',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '2rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>
            Link Invalido
          </p>
          <p style={{ color: '#94a3b8' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
      color: '#e5e7eb',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Welcome header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          color: '#ffffff',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Bem-vindo ao AtivoReal
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            Regularizacao fundiaria digital
          </p>
        </div>

        {/* Area info */}
        {lote && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
              Sua Propriedade
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              {lote.nome_cliente && (
                <div><strong>Proprietario:</strong> {String(lote.nome_cliente)}</div>
              )}
              {lote.status && (
                <div><strong>Status:</strong> {String(lote.status)}</div>
              )}
            </div>
          </div>
        )}

        {/* Progress tracker */}
        {progress && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
              Progresso do Cadastro
            </h2>
            <ProgressTracker
              steps={progress.steps}
              currentStep={nextStep?.id}
              percentage={progress.percentage}
            />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {nextStep && (
            <button
              onClick={() => {
                const routes: Record<string, string> = {
                  dados_pessoais: `/cliente/dados${qs}`,
                  desenho_area: `/cliente/desenhar${qs}`,
                  vizinhos: `/cliente/vizinhos${qs}`,
                  documentos: `/cliente/documentos${qs}`,
                };
                navigate(routes[nextStep.id] || `/cliente/dados${qs}`);
              }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continuar: {nextStep.label}
            </button>
          )}

          <button
            onClick={() => navigate(`/cliente/desenhar${qs}`)}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#e5e7eb',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ver Minha Area no Mapa
          </button>

          <button
            onClick={() => navigate(`/cliente/vizinhos${qs}`)}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#e5e7eb',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ver Vizinhos
          </button>
        </div>
      </div>
    </div>
  );
}
