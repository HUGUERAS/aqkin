import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/api';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

interface Orcamento {
  id: number;
  projeto_id?: number;
  lote_id?: number;
  valor: number;
  status: 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

interface Projeto {
  id: number;
  nome: string;
}

interface Lote {
  id: number;
  nome_cliente: string;
  projeto_id: number;
}

type StatusFiltro = 'TODOS' | 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';

export default function Orcamentos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projetoIdParam = searchParams.get('projeto_id');
  const loteIdParam = searchParams.get('lote_id');

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('TODOS');
  const [filtroProjeto, setFiltroProjeto] = useState<number | null>(
    projetoIdParam ? Number(projetoIdParam) : null
  );
  const [filtroLote, setFiltroLote] = useState<number | null>(
    loteIdParam ? Number(loteIdParam) : null
  );
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [orcamentoEditando, setOrcamentoEditando] = useState<Orcamento | null>(null);
  const [formData, setFormData] = useState({
    projeto_id: '',
    lote_id: '',
    valor: '',
    status: 'RASCUNHO' as Orcamento['status'],
    observacoes: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  useEffect(() => {
    carregarProjetos();
    carregarLotes();
    carregarOrcamentos();
  }, [filtroProjeto, filtroLote]);

  const carregarProjetos = async () => {
    try {
      const response = await apiClient.getProjects();
      if (response.data) {
        setProjetos(response.data as Projeto[]);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const carregarLotes = async () => {
    try {
      if (filtroProjeto) {
        const response = await apiClient.getLotes(filtroProjeto);
        if (response.data) {
          setLotes(response.data as Lote[]);
        }
      } else {
        setLotes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    }
  };

  const carregarOrcamentos = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getOrcamentos(
        filtroProjeto || undefined,
        filtroLote || undefined
      );
      if (response.data) {
        setOrcamentos(response.data as Orcamento[]);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const orcamentosFiltrados = orcamentos.filter((o) =>
    filtroStatus === 'TODOS' ? true : o.status === filtroStatus
  );

  const getStatusBadgeStyle = (status: Orcamento['status']) => {
    const styles = {
      RASCUNHO: { background: '#fff3cd', color: '#856404', icon: '📝' },
      ENVIADO: { background: '#cfe2ff', color: '#084298', icon: '📤' },
      APROVADO: { background: '#d1e7dd', color: '#0f5132', icon: '✅' },
      REJEITADO: { background: '#f8d7da', color: '#842029', icon: '❌' },
      CANCELADO: { background: '#e2e3e5', color: '#41464b', icon: '🚫' },
    };
    return styles[status] || styles.RASCUNHO;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data?: string) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const abrirFormularioCriar = async () => {
    setOrcamentoEditando(null);
    const projetoId = filtroProjeto?.toString() || '';
    setFormData({
      projeto_id: projetoId,
      lote_id: filtroLote?.toString() || '',
      valor: '',
      status: 'RASCUNHO',
      observacoes: '',
    });
    // Carregar lotes se houver projeto selecionado
    if (projetoId) {
      try {
        const response = await apiClient.getLotes(Number(projetoId));
        if (response.data) {
          setLotes(response.data as Lote[]);
        }
      } catch (error) {
        console.error('Erro ao carregar lotes:', error);
      }
    }
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = async (orcamento: Orcamento) => {
    setOrcamentoEditando(orcamento);
    const projetoId = orcamento.projeto_id?.toString() || '';
    setFormData({
      projeto_id: projetoId,
      lote_id: orcamento.lote_id?.toString() || '',
      valor: orcamento.valor.toString(),
      status: orcamento.status,
      observacoes: orcamento.observacoes || '',
    });
    // Carregar lotes se houver projeto
    if (projetoId) {
      try {
        const response = await apiClient.getLotes(Number(projetoId));
        if (response.data) {
          setLotes(response.data as Lote[]);
        }
      } catch (error) {
        console.error('Erro ao carregar lotes:', error);
      }
    }
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setOrcamentoEditando(null);
    setFormData({
      projeto_id: filtroProjeto?.toString() || '',
      lote_id: filtroLote?.toString() || '',
      valor: '',
      status: 'RASCUNHO',
      observacoes: '',
    });
  };

  const salvarOrcamento = async () => {
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      alert('Valor é obrigatório e deve ser maior que zero');
      return;
    }
    if (!formData.projeto_id && !formData.lote_id) {
      alert('Projeto ou Lote é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      const data = {
        projeto_id: formData.projeto_id ? Number(formData.projeto_id) : undefined,
        lote_id: formData.lote_id ? Number(formData.lote_id) : undefined,
        valor: parseFloat(formData.valor),
        status: formData.status,
        observacoes: formData.observacoes || undefined,
      };

      if (orcamentoEditando) {
        const response = await apiClient.updateOrcamento(orcamentoEditando.id, {
          valor: data.valor,
          status: data.status,
          observacoes: data.observacoes,
        });
        if (response.error) {
          alert(`Erro ao atualizar orçamento: ${response.error}`);
          return;
        }
      } else {
        const response = await apiClient.createOrcamento(data);
        if (response.error) {
          alert(`Erro ao criar orçamento: ${response.error}`);
          return;
        }
      }
      fecharFormulario();
      carregarOrcamentos();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento');
    } finally {
      setSalvando(false);
    }
  };

  const excluirOrcamento = async (id: number) => {
    setSalvando(true);
    try {
      const response = await apiClient.deleteOrcamento(id);
      if (response.error) {
        alert(`Erro ao excluir orçamento: ${response.error}`);
        return;
      }
      setConfirmarExclusao(null);
      carregarOrcamentos();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Erro ao excluir orçamento');
    } finally {
      setSalvando(false);
    }
  };

  const obterNomeProjeto = (projetoId?: number) => {
    if (!projetoId) return '-';
    const projeto = projetos.find((p) => p.id === projetoId);
    return projeto?.nome || `Projeto #${projetoId}`;
  };

  const obterNomeLote = (loteId?: number) => {
    if (!loteId) return '-';
    const lote = lotes.find((l) => l.id === loteId);
    return lote?.nome_cliente || `Lote #${loteId}`;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>💰 Orçamentos</h1>
        <button
          onClick={abrirFormularioCriar}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          ➕ Novo Orçamento
        </button>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Projeto
          </label>
          <select
            value={filtroProjeto || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setFiltroProjeto(val);
              setFiltroLote(null);
              setSearchParams(val ? { projeto_id: String(val) } : {});
            }}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem',
              minWidth: '200px',
            }}
          >
            <option value="">Todos os projetos</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {filtroProjeto && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Lote
            </label>
            <select
              value={filtroLote || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setFiltroLote(val);
                setSearchParams(
                  filtroProjeto
                    ? { projeto_id: String(filtroProjeto), ...(val ? { lote_id: String(val) } : {}) }
                    : {}
                );
              }}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
                minWidth: '200px',
              }}
            >
              <option value="">Todos os lotes</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome_cliente}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['TODOS', 'RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'CANCELADO'] as StatusFiltro[]).map(
              (status) => {
                const count =
                  status === 'TODOS'
                    ? orcamentos.length
                    : orcamentos.filter((o) => o.status === status).length;
                const style = getStatusBadgeStyle(status === 'TODOS' ? 'RASCUNHO' : status);
                return (
                  <button
                    key={status}
                    onClick={() => setFiltroStatus(status)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: filtroStatus === status ? '#667eea' : 'white',
                      color: filtroStatus === status ? 'white' : '#333',
                      border: `1px solid ${filtroStatus === status ? '#667eea' : '#ddd'}`,
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: filtroStatus === status ? 'bold' : 'normal',
                      fontSize: '0.9rem',
                    }}
                  >
                    {status === 'TODOS' ? '📋' : style.icon}{' '}
                    {status === 'TODOS' ? 'Todos' : status.replace('_', ' ')} ({count})
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      {orcamentosFiltrados.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Total de Orçamentos</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{orcamentosFiltrados.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Valor Total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {formatarMoeda(orcamentosFiltrados.reduce((acc, o) => acc + o.valor, 0))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Aprovados</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f5132' }}>
              {orcamentosFiltrados.filter((o) => o.status === 'APROVADO').length}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Orçamentos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p style={{ fontSize: '2rem' }}>
            <span role="img" aria-label="Carregando">⏳</span>
          </p>
          <p>Carregando orçamentos...</p>
        </div>
      ) : orcamentosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '12px' }}>
          <p style={{ fontSize: '2rem' }}>
            <span role="img" aria-label="Nenhum orçamento">📭</span>
          </p>
          <p>Nenhum orçamento encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orcamentosFiltrados.map((orcamento) => {
            const statusStyle = getStatusBadgeStyle(orcamento.status);
            return (
              <div
                key={orcamento.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                        {formatarMoeda(orcamento.valor)}
                      </h3>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          background: statusStyle.background,
                          color: statusStyle.color,
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {statusStyle.icon} {orcamento.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      {orcamento.projeto_id && (
                        <span>
                          <strong>Projeto:</strong> {obterNomeProjeto(orcamento.projeto_id)}
                        </span>
                      )}
                      {orcamento.lote_id && (
                        <span>
                          <strong>Lote:</strong> {obterNomeLote(orcamento.lote_id)}
                        </span>
                      )}
                      <span>
                        <strong>Criado em:</strong> {formatarData(orcamento.criado_em)}
                      </span>
                    </div>
                    {orcamento.observacoes && (
                      <p style={{ color: '#666', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        {orcamento.observacoes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => abrirFormularioEditar(orcamento)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => setConfirmarExclusao(orcamento.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        open={confirmarExclusao !== null}
        busy={salvando}
        message="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
        onCancel={() => setConfirmarExclusao(null)}
        onConfirm={() => confirmarExclusao !== null && excluirOrcamento(confirmarExclusao)}
      />

      {/* Modal de Formulário */}
      {mostrarFormulario && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !salvando && fecharFormulario()}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>
              {orcamentoEditando ? '✏️ Editar Orçamento' : '➕ Novo Orçamento'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!orcamentoEditando && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Projeto
                    </label>
                    <select
                      value={formData.projeto_id}
                      onChange={async (e) => {
                        const projetoId = e.target.value;
                        setFormData({ ...formData, projeto_id: projetoId, lote_id: '' });
                        if (projetoId) {
                          try {
                            const response = await apiClient.getLotes(Number(projetoId));
                            if (response.data) {
                              setLotes(response.data as Lote[]);
                            }
                          } catch (error) {
                            console.error('Erro ao carregar lotes:', error);
                          }
                        } else {
                          setLotes([]);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="">Selecione um projeto</option>
                      {projetos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.projeto_id && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Lote (opcional)
                      </label>
                      <select
                        value={formData.lote_id}
                        onChange={(e) => setFormData({ ...formData, lote_id: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="">Todos os lotes do projeto</option>
                        {lotes.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.nome_cliente}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Orcamento['status'] })
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="RASCUNHO">📝 Rascunho</option>
                  <option value="ENVIADO">📤 Enviado</option>
                  <option value="APROVADO">✅ Aprovado</option>
                  <option value="REJEITADO">❌ Rejeitado</option>
                  <option value="CANCELADO">🚫 Cancelado</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações sobre o orçamento..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  onClick={fecharFormulario}
                  disabled={salvando}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: salvando ? 'wait' : 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarOrcamento}
                  disabled={salvando}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: salvando ? 'wait' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {salvando ? 'Salvando...' : orcamentoEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
