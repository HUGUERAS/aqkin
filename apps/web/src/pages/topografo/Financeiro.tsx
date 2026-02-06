import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { StatusBadge, StatusFilter } from '../../components/StatusBadge';
import { useFormState, useStatusFilter } from '../../hooks/useFormState';
import { useApiError, useNotification, extractErrorMessage } from '../../hooks/useErrorHandler';
import { DESPESA_CATEGORIES, PAGAMENTO_STATUSES, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { Despesa, Pagamento } from '../../schemas';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import '../../styles/TopografoPro.css';

interface Projeto {
  id: number;
  nome: string;
}

interface Lote {
  id: number;
  nome_cliente: string;
  projeto_id: number;
}

type Aba = 'DESPESAS' | 'PAGAMENTOS' | 'ENTRADA_RECURSO';

const getCategoryColor = (categoria?: string): string => {
  const cores: Record<string, string> = {
    MATERIAL: '#3b82f6',
    SERVICO: '#8b5cf6',
    TRANSPORTE: '#f59e0b',
    OUTROS: '#6b7280',
  };
  return cores[categoria || 'OUTROS'] || '#6b7280';
};

const getStatusBadgeVariant = (status: string): 'info' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'PAGO':
      return 'success';
    case 'PROCESSANDO':
      return 'warning';
    case 'PENDENTE':
      return 'warning';
    case 'FALHA':
      return 'error';
    default:
      return 'warning';
  }
};

const categoriaOpcoes = [
  { value: 'MATERIAL', label: 'Material' },
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function Financeiro() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('DESPESAS');
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormularioDespesa, setMostrarFormularioDespesa] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState<Despesa | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [filtroProjeto, setFiltroProjeto] = useState<number | null>(null);

  const { error: apiError, handleError, clearError } = useApiError();
  const { notification, showSuccess, showError } = useNotification();
  const { filtroStatus: filtroDespesaStatus, setFiltroStatus: setFiltroDespesaStatus, filtered: despesasFiltradas, counts: despesaCounts } = useStatusFilter(despesas);
  const { filtroStatus: filtroPagamentoStatus, setFiltroStatus: setFiltroPagamentoStatus, filtered: pagamentosFiltrados, counts: pagamentoCounts } = useStatusFilter(pagamentos);

  const formDataDespesa = {
    projeto_id: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'OUTROS',
    observacoes: '',
  };

  const form = useFormState(formDataDespesa, {
    onSubmit: async (data) => {
      try {
        if (!data.descricao?.trim()) throw new Error('Descrição é obrigatória');
        if (!data.projeto_id) throw new Error('Projeto é obrigatório');

        const valor = parseFloat(data.valor);
        if (isNaN(valor) || valor <= 0) throw new Error('Valor deve ser > 0');

        const response = despesaEditando
          ? await apiClient.updateDespesa?.(despesaEditando.id, {
            descricao: data.descricao,
            valor,
            data: data.data,
            categoria: data.categoria,
            observacoes: data.observacoes,
          })
          : await apiClient.createDespesa?.({
            projeto_id: Number(data.projeto_id),
            descricao: data.descricao,
            valor,
            data: data.data,
            categoria: data.categoria,
            observacoes: data.observacoes,
          });

        if (response?.error) throw new Error(response.error);

        showSuccess(despesaEditando ? 'Despesa atualizada!' : 'Despesa criada!');
        fecharFormulario();
        await carregarDados();
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    validators: {
      valor: (v) =>
        !v || parseFloat(v) <= 0
          ? 'Valor deve ser maior que zero'
          : parseFloat(v) > VALIDATION_RULES.VALOR_MAX
            ? 'Valor excede limite máximo'
            : null,
      descricao: (v) =>
        !v || v.trim().length < 3
          ? 'Descrição deve ter 3+ caracteres'
          : null,
    },
    onError: (error) => showError(error.message),
  });

  useEffect(() => {
    carregarDados();
  }, [filtroProjeto]);

  useEffect(() => {
    if (filtroProjeto) {
      carregarLotes();
    }
  }, [filtroProjeto]);

  const carregarDados = async () => {
    clearError();
    setLoading(true);
    try {
      const [projData, despData, pagData] = await Promise.all([
        apiClient.getProjects(),
        apiClient.getDespesas(),
        apiClient.getPagamentos?.(),
      ]);

      if (projData?.error) throw new Error(projData.error);
      if (despData?.error) throw new Error(despData.error);

      setProjetos(Array.isArray(projData?.data) ? (projData?.data as Projeto[]) : []);
      setDespesas(Array.isArray(despData?.data) ? (despData?.data as Despesa[]) : []);
      setPagamentos(Array.isArray(pagData?.data) ? (pagData?.data as Pagamento[]) : []);
    } catch (error) {
      handleError(error, 'carregarDados');
    } finally {
      setLoading(false);
    }
  };

  const carregarLotes = async () => {
    try {
      if (filtroProjeto) {
        const resp = await apiClient.getLotes?.(filtroProjeto);
        setLotes(Array.isArray(resp) ? resp : []);
      }
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    }
  };

  const abrirFormularioCriar = () => {
    setDespesaEditando(null);
    form.setFormData({
      projeto_id: '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: 'OUTROS',
      observacoes: '',
    });
    setMostrarFormularioDespesa(true);
  };

  const abrirFormularioEditar = (despesa: Despesa) => {
    setDespesaEditando(despesa);
    form.setFormData({
      projeto_id: despesa.projeto_id.toString(),
      descricao: despesa.descricao,
      valor: despesa.valor.toString(),
      data: despesa.data,
      categoria: despesa.categoria || 'OUTROS',
      observacoes: despesa.observacoes || '',
    });
    setMostrarFormularioDespesa(true);
  };

  const fecharFormulario = () => {
    setMostrarFormularioDespesa(false);
    setDespesaEditando(null);
    form.reset();
  };

  const excluirDespesa = async (id: number) => {
    setSalvando(true);
    try {
      const response = await apiClient.deleteDespesa?.(id);
      if (response?.error) {
        showError(response.error);
        setSalvando(false);
        return;
      }
      showSuccess('Despesa excluída!');
      setConfirmarExclusao(null);
      await carregarDados();
    } catch (error) {
      showError(extractErrorMessage(error));
      setSalvando(false);
    }
  };

  const formatarMoeda = (valor: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  const formatarData = (data: string): string => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const obterNomeProjeto = (id: number): string => projetos.find((p) => p.id === id)?.nome || `Projeto #${id}`;
  const obterNomeLote = (id: number): string => lotes.find((l) => l.id === id)?.nome_cliente || `Lote #${id}`;

  const totalDespesas = despesasFiltradas.reduce((acc, d) => acc + d.valor, 0);
  const totalPagamentos = pagamentosFiltrados.reduce((acc, p) => acc + p.valor_total, 0);
  const totalPago = pagamentosFiltrados.reduce((acc, p) => acc + p.valor_pago, 0);

  return (
    <div className="topografo-page">
      {/* Page Header */}
      <div className="topografo-page-header">
        <div className="topografo-page-header-left">
          <span className="topografo-page-icon">💰</span>
          <div className="topografo-page-title">
            <h1>Módulo Financeiro</h1>
            <p>Controle de despesas, pagamentos e recursos</p>
          </div>
        </div>
        <div className="topografo-page-actions">
          {abaAtiva === 'DESPESAS' && (
            <button className="pro-btn pro-btn-primary" onClick={abrirFormularioCriar}>
              ➕ Nova Despesa
            </button>
          )}
          {abaAtiva === 'ENTRADA_RECURSO' && (
            <button className="pro-btn pro-btn-success">
              ➕ Nova Entrada de Recurso
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`pro-alert ${notification.type === 'success' ? 'pro-alert-success' : 'pro-alert-error'}`}>
          <span className="pro-alert-icon">{notification.type === 'success' ? '✅' : '❌'}</span>
          <div className="pro-alert-content">
            <div className="pro-alert-text">{notification.message}</div>
          </div>
        </div>
      )}

      {apiError && (
        <div className="pro-alert pro-alert-error">
          <span className="pro-alert-icon">⚠️</span>
          <div className="pro-alert-content">
            <div className="pro-alert-text">{apiError.message}</div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="pro-card" style={{ marginBottom: '24px' }}>
        <div className="pro-card-body" style={{ padding: '16px 24px' }}>
          <div className="pro-form-group" style={{ marginBottom: 0 }}>
            <label className="pro-form-label">Filtrar por Projeto</label>
            <select
              className="pro-form-select"
              value={filtroProjeto?.toString() || ''}
              onChange={(e) => setFiltroProjeto(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Todos os projetos</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id.toString()}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pro-tabs" style={{ marginBottom: '24px' }}>
        {(['DESPESAS', 'PAGAMENTOS', 'ENTRADA_RECURSO'] as const).map((aba) => (
          <button
            key={aba}
            className={`pro-tab ${abaAtiva === aba ? 'active' : ''}`}
            onClick={() => setAbaAtiva(aba)}
          >
            <span style={{ marginRight: '8px' }}>
              {aba === 'DESPESAS' ? '💳' : aba === 'PAGAMENTOS' ? '✅' : '📋'}
            </span>
            {aba === 'DESPESAS' ? 'Despesas' : aba === 'PAGAMENTOS' ? 'Pagamentos Recebidos' : 'Entrada de Recurso'}
          </button>
        ))}
      </div>

      {/* DESPESAS Tab */}
      {abaAtiva === 'DESPESAS' && (
        <div>
          {/* Summary Cards */}
          {despesasFiltradas.length > 0 && (
            <div className="pro-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '24px' }}>
              <div className="pro-stat-card">
                <div className="pro-stat-header">
                  <span className="pro-stat-label">Total de Despesas</span>
                  <div className="pro-stat-icon blue"><span>📊</span></div>
                </div>
                <div className="pro-stat-value">{despesasFiltradas.length}</div>
              </div>
              <div className="pro-stat-card">
                <div className="pro-stat-header">
                  <span className="pro-stat-label">Valor Total</span>
                  <div className="pro-stat-icon red"><span>💸</span></div>
                </div>
                <div className="pro-stat-value" style={{ color: '#f87171' }}>{formatarMoeda(totalDespesas)}</div>
              </div>
            </div>
          )}

          {/* Expenses List */}
          {loading ? (
            <div className="pro-loading">
              <div className="pro-loading-spinner" />
              <div className="pro-loading-text">Carregando despesas...</div>
            </div>
          ) : apiError ? (
            <div className="pro-card">
              <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>⚠️</span>
                <h3 style={{ color: '#e2e8f0', marginBottom: '8px' }}>Não foi possível carregar despesas</h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{apiError.message}</p>
                <button onClick={carregarDados} className="pro-btn pro-btn-primary">
                  🔄 Tentar novamente
                </button>
              </div>
            </div>
          ) : despesasFiltradas.length === 0 ? (
            <div className="pro-card">
              <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>💳</span>
                <h3 style={{ color: '#e2e8f0' }}>Nenhuma despesa encontrada</h3>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {despesasFiltradas.map((despesa) => (
                <div key={despesa.id} className="pro-card">
                  <div className="pro-card-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{ margin: 0 }}>{despesa.descricao}</h3>
                      <span className="pro-badge pro-badge-info" style={{ backgroundColor: getCategoryColor(despesa.categoria) }}>
                        {despesa.categoria || 'OUTROS'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => abrirFormularioEditar(despesa)} className="pro-btn pro-btn-secondary" style={{ padding: '8px 16px' }}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => setConfirmarExclusao(despesa.id)} className="pro-btn pro-btn-danger" style={{ padding: '8px 16px' }}>
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                  <div className="pro-card-body">
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Valor:</span>
                        <div style={{ color: '#f87171', fontWeight: 600, fontSize: '1.1rem' }}>{formatarMoeda(despesa.valor)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Data:</span>
                        <div style={{ color: '#e2e8f0' }}>{formatarData(despesa.data)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Projeto:</span>
                        <div style={{ color: '#e2e8f0' }}>{obterNomeProjeto(despesa.projeto_id)}</div>
                      </div>
                    </div>
                    {despesa.observacoes && (
                      <p style={{ color: '#94a3b8', marginTop: '16px', fontStyle: 'italic' }}>{despesa.observacoes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PAGAMENTOS Tab */}
      {abaAtiva === 'PAGAMENTOS' && (
        <div>
          {/* Summary Cards */}
          {pagamentosFiltrados.length > 0 && (
            <div className="pro-stats-grid" style={{ marginBottom: '24px' }}>
              <div className="pro-stat-card">
                <div className="pro-stat-header">
                  <span className="pro-stat-label">Total de Pagamentos</span>
                  <div className="pro-stat-icon blue"><span>📊</span></div>
                </div>
                <div className="pro-stat-value">{pagamentosFiltrados.length}</div>
              </div>
              <div className="pro-stat-card">
                <div className="pro-stat-header">
                  <span className="pro-stat-label">Valor Total</span>
                  <div className="pro-stat-icon green"><span>💰</span></div>
                </div>
                <div className="pro-stat-value" style={{ color: '#10b981' }}>{formatarMoeda(totalPagamentos)}</div>
              </div>
              <div className="pro-stat-card">
                <div className="pro-stat-header">
                  <span className="pro-stat-label">Valor Pago</span>
                  <div className="pro-stat-icon green"><span>✅</span></div>
                </div>
                <div className="pro-stat-value" style={{ color: '#10b981' }}>{formatarMoeda(totalPago)}</div>
              </div>
              <div className="pro-stat-card">
                <div className="pro-stat-header">
                  <span className="pro-stat-label">Pagamentos Aprovados</span>
                  <div className="pro-stat-icon purple"><span>🎯</span></div>
                </div>
                <div className="pro-stat-value">{pagamentosFiltrados.filter((p) => p.status === 'PAGO').length}</div>
              </div>
            </div>
          )}

          {/* Payments List */}
          {loading ? (
            <div className="pro-loading">
              <div className="pro-loading-spinner" />
              <div className="pro-loading-text">Carregando pagamentos...</div>
            </div>
          ) : apiError ? (
            <div className="pro-card">
              <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>⚠️</span>
                <h3 style={{ color: '#e2e8f0', marginBottom: '8px' }}>Não foi possível carregar pagamentos</h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{apiError.message}</p>
                <button onClick={carregarDados} className="pro-btn pro-btn-primary">
                  🔄 Tentar novamente
                </button>
              </div>
            </div>
          ) : pagamentosFiltrados.length === 0 ? (
            <div className="pro-card">
              <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>✅</span>
                <h3 style={{ color: '#e2e8f0' }}>Nenhum pagamento encontrado</h3>
              </div>
            </div>
          ) : (
            <div className="pro-grid-2">
              {pagamentosFiltrados.map((pagamento) => (
                <div key={pagamento.id} className="pro-card">
                  <div className="pro-card-header">
                    <span className={`pro-badge ${pagamento.status === 'PAGO' ? 'pro-badge-success' :
                        pagamento.status === 'PROCESSANDO' ? 'pro-badge-warning' :
                          pagamento.status === 'FALHA' ? 'pro-badge-error' : 'pro-badge-warning'
                      }`}>
                      {pagamento.status}
                    </span>
                  </div>
                  <div className="pro-card-body">
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Valor Total:</span>
                        <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{formatarMoeda(pagamento.valor_total)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Valor Pago:</span>
                        <div style={{ color: '#10b981', fontWeight: 600 }}>{formatarMoeda(pagamento.valor_pago)}</div>
                      </div>
                      {pagamento.data_pagamento && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Data:</span>
                          <div style={{ color: '#e2e8f0' }}>{formatarData(pagamento.data_pagamento)}</div>
                        </div>
                      )}
                    </div>
                    {pagamento.gateway_id && (
                      <p style={{ color: '#94a3b8', marginTop: '16px', fontSize: '0.875rem' }}>
                        <strong style={{ color: '#e2e8f0' }}>Gateway:</strong> {pagamento.gateway_id}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ENTRADA_RECURSO Tab */}
      {abaAtiva === 'ENTRADA_RECURSO' && (
        <div>
          <div className="pro-card" style={{ marginBottom: '24px' }}>
            <div className="pro-card-header">
              <h2><span className="icon">📋</span> Entrada de Recurso Financeira</h2>
            </div>
            <div className="pro-card-body">
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                Registre uma reclamação ou recurso sobre valores pagos, retenções ou cobranças questionáveis
              </p>

              <div className="pro-form-group">
                <label className="pro-form-label">Tipo de Recurso *</label>
                <select className="pro-form-select">
                  <option value="">Selecione o tipo</option>
                  <option value="cobranca">Cobrança Indevida</option>
                  <option value="retencao">Problema com Retenção</option>
                  <option value="pagamento">Discrepância de Pagamento</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="pro-form-group">
                <label className="pro-form-label">Descrição do Problema *</label>
                <textarea
                  className="pro-form-textarea"
                  placeholder="Descreva detalhadamente o problema e como deseja resolvê-lo..."
                  rows={5}
                />
              </div>

              <div className="pro-grid-2" style={{ marginBottom: '16px' }}>
                <div className="pro-form-group">
                  <label className="pro-form-label">Data do Problema *</label>
                  <input type="date" className="pro-form-input" />
                </div>
                <div className="pro-form-group">
                  <label className="pro-form-label">Valor em Questão (R$)</label>
                  <input type="number" className="pro-form-input" placeholder="0.00" step="0.01" min="0" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="pro-btn pro-btn-secondary">Cancelar</button>
                <button className="pro-btn pro-btn-success">📤 Enviar Recurso</button>
              </div>
            </div>
          </div>

          <div className="pro-alert pro-alert-info" style={{ marginBottom: '24px' }}>
            <span className="pro-alert-icon">📌</span>
            <div className="pro-alert-content">
              <div className="pro-alert-title">Informações Importantes</div>
              <div className="pro-alert-text">
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', lineHeight: 1.8 }}>
                  <li><strong>Prazo:</strong> Até 30 dias a partir da data do problema</li>
                  <li><strong>Documentação:</strong> Tenha recibos, extratos e contratos disponíveis</li>
                  <li><strong>Resposta:</strong> Retorno em até 15 dias úteis</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pro-card">
            <div className="pro-card-header">
              <h2><span className="icon">📜</span> Histórico de Recursos</h2>
            </div>
            <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
              <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>📂</span>
              <h3 style={{ color: '#e2e8f0' }}>Nenhum recurso registrado ainda</h3>
              <p style={{ color: '#94a3b8' }}>Quando você submeter um recurso, ele aparecerá aqui</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={confirmarExclusao !== null}
        busy={salvando}
        message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        onCancel={() => setConfirmarExclusao(null)}
        onConfirm={() => confirmarExclusao !== null && excluirDespesa(confirmarExclusao)}
      />

      {/* Form Modal */}
      {mostrarFormularioDespesa && (
        <div className="pro-modal-overlay" onClick={() => !form.loading && fecharFormulario()}>
          <div className="pro-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h2 className="pro-modal-title">
                {despesaEditando ? '✏️ Editar Despesa' : '➕ Nova Despesa'}
              </h2>
              <button className="pro-modal-close" onClick={fecharFormulario} disabled={form.loading}>
                ✕
              </button>
            </div>
            <form onSubmit={form.handleSubmit}>
              <div className="pro-modal-body">
                <div className="pro-form-group">
                  <label className="pro-form-label">Projeto *</label>
                  <select
                    className="pro-form-select"
                    value={form.formData.projeto_id}
                    onChange={(e) => form.handleChange('projeto_id', e.target.value)}
                    required
                  >
                    <option value="">Selecione um projeto</option>
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id.toString()}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Descrição *</label>
                  <input
                    type="text"
                    className="pro-form-input"
                    value={form.formData.descricao}
                    onChange={(e) => form.handleChange('descricao', e.target.value)}
                    placeholder="Ex: Material de escritório"
                    required
                  />
                </div>

                <div className="pro-grid-2">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Valor (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="pro-form-input"
                      value={form.formData.valor}
                      onChange={(e) => form.handleChange('valor', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Data *</label>
                    <input
                      type="date"
                      className="pro-form-input"
                      value={form.formData.data}
                      onChange={(e) => form.handleChange('data', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Categoria</label>
                  <select
                    className="pro-form-select"
                    value={form.formData.categoria}
                    onChange={(e) => form.handleChange('categoria', e.target.value)}
                  >
                    {categoriaOpcoes.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Observações</label>
                  <textarea
                    className="pro-form-textarea"
                    value={form.formData.observacoes}
                    onChange={(e) => form.handleChange('observacoes', e.target.value)}
                    placeholder="Observações sobre a despesa..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="pro-modal-footer">
                <button type="button" onClick={fecharFormulario} disabled={form.loading} className="pro-btn pro-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={form.loading} className="pro-btn pro-btn-primary">
                  {form.loading ? 'Salvando...' : despesaEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
