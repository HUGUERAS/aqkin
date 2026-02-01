import { useState } from 'react';

export default function MeusVizinhos() {
  const [vizinhos, setVizinhos] = useState<Array<{ nome: string; lado: string }>>([]);
  const [nome, setNome] = useState('');
  const [lado, setLado] = useState('NORTE');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setVizinhos([...vizinhos, { nome, lado }]);
    setNome('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '1rem' }}>👥 Quem são seus Vizinhos?</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Informe o nome dos vizinhos e em qual lado da sua propriedade eles ficam.
          Isso ajuda na geração automática do Memorial Descritivo.
        </p>

        <form onSubmit={handleAdd} style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Nome do vizinho"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              flex: '1 1 200px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
            required
          />

          <select
            value={lado}
            onChange={(e) => setLado(e.target.value)}
            style={{
              flex: '0 1 150px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          >
            <option value="NORTE">Norte</option>
            <option value="SUL">Sul</option>
            <option value="LESTE">Leste</option>
            <option value="OESTE">Oeste</option>
          </select>

          <button type="submit" style={{
            flex: '0 1 auto',
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            ➕ Adicionar
          </button>
        </form>

        {vizinhos.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Vizinhos cadastrados:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {vizinhos.map((v, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f5f5f5',
                  borderRadius: '6px'
                }}>
                  <div>
                    <strong>{v.nome}</strong>
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {v.lado}
                    </span>
                  </div>
                  <button
                    onClick={() => setVizinhos(vizinhos.filter((_, idx) => idx !== i))}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {vizinhos.length === 0 && (
          <div style={{
            padding: '2rem',
            background: '#f5f5f5',
            borderRadius: '6px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>Nenhum vizinho cadastrado ainda.</p>
            <p>Adicione pelo menos os vizinhos principais (lados maiores).</p>
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#fff3cd',
          borderRadius: '6px',
          border: '1px solid #ffc107'
        }}>
          <h3>⚠️ Importante:</h3>
          <p style={{ margin: '0.5rem 0' }}>
            Se o vizinho também estiver cadastrando sua área no sistema, o topógrafo
            poderá <strong>vincular automaticamente</strong> as duas propriedades e
            verificar se os limites batem.
          </p>
        </div>
      </div>
    </div>
  );
}
