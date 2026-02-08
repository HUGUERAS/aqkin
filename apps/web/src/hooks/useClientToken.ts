import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';

interface LoteData {
  id: number;
  nome_cliente?: string;
  email_cliente?: string;
  telefone_cliente?: string;
  cpf_cnpj_cliente?: string;
  status?: string;
  projeto_id?: number;
  [key: string]: unknown;
}

export function useClientToken() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const loteIdParam = searchParams.get('lote');

  const [loteId, setLoteId] = useState<number | null>(null);
  const [loteData, setLoteData] = useState<LoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      apiClient.getLotePorToken(token).then((r) => {
        if (r.data && typeof r.data === 'object' && 'id' in r.data) {
          const data = r.data as LoteData;
          setLoteId(data.id);
          setLoteData(data);
          setError('');
        } else {
          setError('Link invalido ou expirado.');
        }
        setLoading(false);
      });
    } else if (loteIdParam) {
      const id = parseInt(loteIdParam, 10);
      if (!isNaN(id)) {
        setLoteId(id);
      } else {
        setError('ID de lote invalido.');
      }
      setLoading(false);
    } else {
      setError('Acesso via link do topografo ou ?lote=ID');
      setLoading(false);
    }
  }, [token, loteIdParam]);

  return { token, loteId, loteData, loading, error };
}
