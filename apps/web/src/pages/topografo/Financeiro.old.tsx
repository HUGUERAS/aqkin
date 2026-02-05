import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

interface Despesa {
  id: number;
  projeto_id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria?: string;
  observacoes?: string;
  criado_em?: string;
}

interface Pagamento {
  id: number;
  lote_id: number;
  valor_total: number;
  valor_pago: number;
  status: string;
  gateway_id?: string;
  data_pagamento?: string;
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

type Aba = 'DESPESAS' | 'PAGAMENTOS';

export default function Financeiro() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('DESPESAS');
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroProjeto, setFiltroProjeto] = useState<number | null>(null);
  const [mostrarFormularioDespesa, setMostrarFormularioDespesa] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState<Despesa | null>(null);
  const [formDataDespesa, setFormDataDespesa] = useState({
    projeto_id: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'OUTROS',
    observacoes: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  useEffect(() => {
    carregarProjetos();
    carregarLotes();
    if (abaAtiva === 'DESPESAS') {
      carregarDespesas();
    } else {
      carregarPagamentos();
    }
  }, [abaAtiva, filtroProjeto]);

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

  const carregarDespesas = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getDespesas(filtroProjeto || undefined);
      if (response.data) {
        setDespesas(response.data as Despesa[]);
      }
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarPagamentos = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPagamentos(filtroProjeto || undefined);
      if (response.data) {
        setPagamentos(response.data as Pagamento[]);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
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

  const obterNomeProjeto = (projetoId: number) => {
    const projeto = projetos.find((p) => p.id === projetoId);
    return projeto?.nome || `Projeto #${projetoId}`;
  };

  const obterNomeLote = (loteId: number) => {
    const lote = lotes.find((l) => l.id === loteId);
    return lote?.nome_cliente || `Lote #${loteId}`;
  };

  const abrirFormularioCriarDespesa = () => {
    setDespesaEditando(null);
    setFormDataDespesa({
      projeto_id: filtroProjeto?.toString() || '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: 'OUTROS',
      observacoes: '',
    });
    setMostrarFormularioDespesa(true);
  };

  const abrirFormularioEditarDespesa = (despesa: Despesa) => {
    setDespesaEditando(despesa);
    setFormDataDespesa({
      projeto_id: despesa.projeto_id.toString(),
      descricao: despesa.descricao,
      valor: despesa.valor.toString(),
      data: despesa.data,
      categoria: despesa.categoria || 'OUTROS',
      observacoes: despesa.observacoes || '',
    });
    setMostrarFormularioDespesa(true);
  };

  const fecharFormularioDespesa = () => {
    setMostrarFormularioDespesa(false);
    setDespesaEditando(null);
    setFormDataDespesa({
      projeto_id: filtroProjeto?.toString() || '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: 'OUTROS',
      observacoes: '',
    });
  };

  const salvarDespesa = async () => {
    if (!formDataDespesa.descricao.trim()) {
      alert('Descrição é obrigatória');
      return;
    }
    if (!formDataDespesa.valor || parseFloat(formDataDespesa.valor) <= 0) {
      alert('Valor é obrigatório e deve ser maior que zero');
      return;
    }
    if (!formDataDespesa.projeto_id) {
      alert('Projeto é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      const data = {
        projeto_id: Number(formDataDespesa.projeto_id),
        descricao: formDataDespesa.descricao,
        valor: parseFloat(formDataDespesa.valor),
        data: formDataDespesa.data,
        categoria: formDataDespesa.categoria,
        observacoes: formDataDespesa.observacoes || undefined,
      };

      if (despesaEditando) {
        const response = await apiClient.updateDespesa(despesaEditando.id, data);
        if (response.error) {
          alert(`Erro ao atualizar despesa: ${response.error}`);
          return;
        }
      } else {
        const response = await apiClient.createDespesa(data);
        if (response.error) {
          alert(`Erro ao criar despesa: ${response.error}`);
          return;
        }
      }
      fecharFormularioDespesa();
      carregarDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa');
    } finally {
      setSalvando(false);
    }
  };

  const excluirDespesa = async (id: number) => {
    setSalvando(true);
    try {
      const response = await apiClient.deleteDespesa(id);
      if (response.error) {
        alert(`Erro ao excluir despesa: ${response.error}`);
        return;
      }
      setConfirmarExclusao(null);
      carregarDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa');
    } finally {
      setSalvando(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, { background: string; color: string; icon: string }> = {
      PENDENTE: { background: '#fff3cd', color: '#856404', icon: '⏳' },
      PAGO: { background: '#d1e7dd', color: '#0f5132', icon: '✅' },
      FALHA: { background: '#f8d7da', color: '#842029', icon: '❌' },
    };
    return styles[status] || { background: '#e2e3e5', color: '#41464b', icon: '❓' };
  };

  const despesasFiltradas = filtroProjeto
    ? despesas.filter((d) => d.projeto_id === filtroProjeto)
    : despesas;

  const pagamentosFiltrados = filtroProjeto
    ? pagamentos.filter((p) => {
      const lote = lotes.find((l) => l.id === p.lote_id);
      return lote?.projeto_id === filtroProjeto;
    })
    : pagamentos;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>💳 Módulo Financeiro</h1>
        {abaAtiva === 'DESPESAS' && (
          <button
            onClick={abrirFormularioCriarDespesa}
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
            ➕ Nova Despesa
          </button>
        )}
      </div>

      {/* Filtro de Projeto */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
          Filtrar por Projeto
        </label>
        <select
          value={filtroProjeto || ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            setFiltroProjeto(val);
            if (val) carregarLotes();
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

      {/* Abas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setAbaAtiva('DESPESAS')}
          style={{
            padding: '1rem 2rem',
            background: abaAtiva === 'DESPESAS' ? '#667eea' : 'transparent',
            color: abaAtiva === 'DESPESAS' ? 'white' : '#333',
            border: 'none',
            borderBottom: abaAtiva === 'DESPESAS' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: abaAtiva === 'DESPESAS' ? 'bold' : 'normal',
            fontSize: '1rem',
          }}
        >
          💸 Despesas
        </button>
        <button
          onClick={() => setAbaAtiva('PAGAMENTOS')}
          style={{
            padding: '1rem 2rem',
            background: abaAtiva === 'PAGAMENTOS' ? '#667eea' : 'transparent',
            color: abaAtiva === 'PAGAMENTOS' ? 'white' : '#333',
            border: 'none',
            borderBottom: abaAtiva === 'PAGAMENTOS' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: abaAtiva === 'PAGAMENTOS' ? 'bold' : 'normal',
            fontSize: '1rem',
          }}
        >
          💰 Pagamentos Recebidos
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {abaAtiva === 'DESPESAS' && (
        <>
          {/* Resumo de Despesas */}
          {despesasFiltradas.length > 0 && (
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
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Total de Despesas</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{despesasFiltradas.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Valor Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                  {formatarMoeda(despesasFiltradas.reduce((acc, d) => acc + d.valor, 0))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Despesas */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <p style={{ fontSize: '2rem' }}>⏳</p>
              <p>Carregando despesas...</p>
            </div>
          ) : despesasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '2rem' }}>📭</p>
              <p>Nenhuma despesa encontrada</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {despesasFiltradas.map((despesa) => (
                <div
                  key={despesa.id}
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
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{despesa.descricao}</h3>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            background: '#e9ecef',
                            color: '#495057',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {despesa.categoria || 'OUTROS'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                        <span>
                          <strong>Valor:</strong>{' '}
                          <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                            {formatarMoeda(despesa.valor)}
                          </span>
                        </span>
                        <span>
                          <strong>Data:</strong> {formatarData(despesa.data)}
                        </span>
                        <span>
                          <strong>Projeto:</strong> {obterNomeProjeto(despesa.projeto_id)}
                        </span>
                      </div>
                      {despesa.observacoes && (
                        <p style={{ color: '#666', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                          {despesa.observacoes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        onClick={() => abrirFormularioEditarDespesa(despesa)}
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
                        onClick={() => setConfirmarExclusao(despesa.id)}
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
              ))}
            </div>
          )}
        </>
      )}

      {abaAtiva === 'PAGAMENTOS' && (
        <>
          {/* Resumo de Pagamentos */}
          {pagamentosFiltrados.length > 0 && (
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
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Total de Pagamentos</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{pagamentosFiltrados.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Valor Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f5132' }}>
                  {formatarMoeda(pagamentosFiltrados.reduce((acc, p) => acc + p.valor_total, 0))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Valor Pago</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f5132' }}>
                  {formatarMoeda(pagamentosFiltrados.reduce((acc, p) => acc + p.valor_pago, 0))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Pagamentos Aprovados</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f5132' }}>
                  {pagamentosFiltrados.filter((p) => p.status === 'PAGO').length}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Pagamentos */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <p style={{ fontSize: '2rem' }}>⏳</p>
              <p>Carregando pagamentos...</p>
            </div>
          ) : pagamentosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '2rem' }}>📭</p>
              <p>Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pagamentosFiltrados.map((pagamento) => {
                const statusStyle = getStatusBadgeStyle(pagamento.status);
                const lote = lotes.find((l) => l.id === pagamento.lote_id);
                return (
                  <div
                    key={pagamento.id}
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
                            {lote ? obterNomeLote(pagamento.lote_id) : `Lote #${pagamento.lote_id}`}
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
                            {statusStyle.icon} {pagamento.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                          <span>
                            <strong>Valor Total:</strong>{' '}
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                              {formatarMoeda(pagamento.valor_total)}
                            </span>
                          </span>
                          <span>
                            <strong>Valor Pago:</strong>{' '}
                            <span style={{ color: '#0f5132', fontWeight: 'bold' }}>
                              {formatarMoeda(pagamento.valor_pago)}
                            </span>
                          </span>
                          {pagamento.data_pagamento && (
                            <span>
                              <strong>Data Pagamento:</strong> {formatarData(pagamento.data_pagamento)}
                            </span>
                          )}
                          {lote && (
                            <span>
                              <strong>Projeto:</strong> {obterNomeProjeto(lote.projeto_id)}
                            </span>
                          )}
                        </div>
                        {pagamento.gateway_id && (
                          <p style={{ color: '#666', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                            <strong>Gateway ID:</strong> {pagamento.gateway_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        open={confirmarExclusao !== null}
        busy={salvando}
        message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        onCancel={() => setConfirmarExclusao(null)}
        onConfirm={() => confirmarExclusao !== null && excluirDespesa(confirmarExclusao)}
      />

      {/* Modal de Formulário de Despesa */}
      {mostrarFormularioDespesa && (
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
          onClick={() => !salvando && fecharFormularioDespesa()}
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
              {despesaEditando ? '✏️ Editar Despesa' : '➕ Nova Despesa'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Projeto *
                </label>
                <select
                  value={formDataDespesa.projeto_id}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, projeto_id: e.target.value })}
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

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Descrição *
                </label>
                <input
                  type="text"
                  value={formDataDespesa.descricao}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, descricao: e.target.value })}
                  placeholder="Ex: Material de escritório"
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
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formDataDespesa.valor}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, valor: e.target.value })}
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
                  Data *
                </label>
                <input
                  type="date"
                  value={formDataDespesa.data}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, data: e.target.value })}
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
                  Categoria
                </label>
                <select
                  value={formDataDespesa.categoria}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, categoria: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="MATERIAL">Material</option>
                  <option value="SERVICO">Serviço</option>
                  <option value="TRANSPORTE">Transporte</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Observações
                </label>
                <textarea
                  value={formDataDespesa.observacoes}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, observacoes: e.target.value })}
                  placeholder="Observações sobre a despesa..."
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
                  onClick={fecharFormularioDespesa}
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
                  onClick={salvarDespesa}
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
                  {salvando ? 'Salvando...' : despesaEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
