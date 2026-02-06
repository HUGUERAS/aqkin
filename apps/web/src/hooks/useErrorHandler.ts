import { useState, useCallback } from 'react';
import { reportError } from '../utils/telemetry';

export interface ApiErrorDetails {
  code?: string;
  message: string;
  statusCode?: number;
  details?: unknown;
  timestamp?: string;
}

/**
 * Hook customizado para tratamento centralizado de erros
 */
export const useApiError = () => {
  const [error, setError] = useState<ApiErrorDetails | null>(null);

  const handleError = useCallback((err: unknown, context?: string) => {
    let errorDetails: ApiErrorDetails = {
      message: 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    };

    // Axios error
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as any;
      errorDetails = {
        code: axiosError.response?.data?.code || 'API_ERROR',
        message: axiosError.response?.data?.message || axiosError.message,
        statusCode: axiosError.response?.status,
        details: axiosError.response?.data,
        timestamp: new Date().toISOString(),
      };
    } else if (err instanceof Error) {
      errorDetails = {
        code: 'ERROR',
        message: err.message,
        timestamp: new Date().toISOString(),
      };
    }

    setError(errorDetails);

    // Log estruturado
    reportError({
      type: 'API_ERROR',
      code: errorDetails.code,
      message: errorDetails.message,
      statusCode: errorDetails.statusCode,
      context,
      details: errorDetails.details,
      timestamp: errorDetails.timestamp,
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, handleError, clearError };
};

/**
 * Hook para toast notifications
 */
export const useNotification = () => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  const showSuccess = useCallback((message: string) => {
    setNotification({ type: 'success', message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setNotification({ type: 'error', message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const showInfo = useCallback((message: string) => {
    setNotification({ type: 'info', message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const showWarning = useCallback((message: string) => {
    setNotification({ type: 'warning', message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const clear = useCallback(() => setNotification(null), []);

  return { notification, showSuccess, showError, showInfo, showWarning, clear };
};

/**
 * Helper para extrair mensagem de erro
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return 'Erro desconhecido';

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    const record = error as Record<string, any>;
    return record.message || record.detail || record.error || 'Erro desconhecido';
  }

  return 'Erro desconhecido';
};

/**
 * Helper para determinar status code HTTP
 */
export const getStatusCodeMessage = (statusCode?: number): string => {
  const messages: Record<number, string> = {
    400: 'Requisição inválida',
    401: 'Autenticação necessária',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    408: 'Requisição expirou',
    429: 'Muitas requisições. Tente mais tarde.',
    500: 'Erro no servidor',
    502: 'Serviço indisponível',
    503: 'Serviço em manutenção',
    504: 'Gateway timeout',
  };

  return messages[statusCode || 0] || 'Erro na comunicação';
};
