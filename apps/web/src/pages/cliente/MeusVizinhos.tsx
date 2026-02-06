import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Input, Select } from '../../components/UIComponents';
import apiClient from '../../services/api';
import './MeusVizinhos.css';

interface Vizinho {
  id: number;
  nome_vizinho: string;
  lado: string;
}

export default function MeusVizinhos() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const loteIdParam = searchParams.get('lote');

  const [loteId, setLoteId] = useState<number | null>(null);
  const [vizinhos, setVizinhos] = useState<Vizinho[]>([]);
  const [nome, setNome] = useState('');
  const [lado, setLado] = useState('NORTE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (tokenParam) {
      apiClient.getLotePorToken(tokenParam).then((r) => {
        if (r.data && typeof r.data === 'object' && 'id' in r.data) {
          setLoteId((r.data as { id: number }).id);
          setError('');
        } else {
          setError('Link inválido ou expirado.');
          setLoading(false);
        }
      });
    } else if (loteIdParam) {
      const id = parseInt(loteIdParam, 10);
      if (!isNaN(id)) setLoteId(id);
      else {
        setError('ID de lote inválido.');
        setLoading(false);
      }
    } else if (isDevMode) {
      // Em modo dev, usar lote fictício para testes
      console.log('🔓 MODO DEV: Usando lote de teste (ID: 999)');
      setLoteId(999);
      setError('');
    } else {
      setError('Acesso via link do topógrafo ou ?lote=ID');
      setLoading(false);
    }
  }, [tokenParam, loteIdParam]);

  useEffect(() => {
    if (!loteId) return;
    setLoading(true);
    apiClient
      .getVizinhos(loteId)
      .then((r) => {
        if (r.data && Array.isArray(r.data)) setVizinhos(r.data as Vizinho[]);
      })
      .finally(() => setLoading(false));
  }, [loteId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteId) return;
    const r = await apiClient.addVizinho(loteId, nome, lado);
    if (r.error) {
      setError(r.error);
    } else if (r.data && typeof r.data === 'object' && 'id' in r.data) {
      setVizinhos([...vizinhos, r.data as Vizinho]);
      setNome('');
      setError('');
    }
  };

  const handleRemove = async (vizinhoId: number) => {
    const r = await apiClient.removeVizinho(vizinhoId);
    if (!r.error) setVizinhos(vizinhos.filter((v) => v.id !== vizinhoId));
  };

  return (
    <div className="vizinhos-container">
      <Card className="vizinhos-card" hover={false}>
        <div className="vizinhos-header">
          <h1>Quem são seus Vizinhos?</h1>
          <p>Informe o nome dos vizinhos e em qual lado da sua propriedade eles ficam.</p>
        </div>

        {error && (
          <Alert type="error" title="Erro">
            {error}
          </Alert>
        )}

        {!loteId && !error && <p className="vizinhos-muted">Carregando...</p>}

        {loteId && (
          <>
            <form onSubmit={handleAdd} className="vizinhos-form">
              <Input
                label="Nome do vizinho"
                placeholder="Nome do vizinho"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <Select
                label="Lado"
                value={lado}
                onChange={(e) => setLado(e.target.value)}
                options={[
                  { value: 'NORTE', label: 'Norte' },
                  { value: 'SUL', label: 'Sul' },
                  { value: 'LESTE', label: 'Leste' },
                  { value: 'OESTE', label: 'Oeste' },
                ]}
              />

              <div className="vizinhos-form-action">
                <Button type="submit" variant="primary">
                  Adicionar
                </Button>
              </div>
            </form>

            {loading ? (
              <p className="vizinhos-muted">Carregando vizinhos...</p>
            ) : vizinhos.length > 0 ? (
              <div className="vizinhos-list">
                <h3>Vizinhos cadastrados:</h3>
                <div className="vizinhos-items">
                  {vizinhos.map((v) => (
                    <div key={v.id} className="vizinhos-item">
                      <div>
                        <strong>{v.nome_vizinho}</strong>
                        <span className="vizinhos-side">{v.lado}</span>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemove(v.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="vizinhos-empty">
                <p>Nenhum vizinho cadastrado ainda.</p>
                <p>Adicione pelo menos os vizinhos principais.</p>
              </div>
            )}
          </>
        )}

        <Alert type="warning" title="Importante">
          Se o vizinho também estiver cadastrando sua área no sistema, o topógrafo poderá
          <strong> vincular automaticamente</strong> as duas propriedades.
        </Alert>
      </Card>
    </div>
  );
}
