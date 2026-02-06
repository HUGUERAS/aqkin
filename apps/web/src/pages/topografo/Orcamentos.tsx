import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/api';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { StatusBadge, StatusFilter } from '../../components/StatusBadge';
import { useFormState, useStatusFilter } from '../../hooks/useFormState';
import { useApiError, useNotification, extractErrorMessage } from '../../hooks/useErrorHandler';
import { ORCAMENTO_STATUSES, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { Orcamento } from '../../schemas';
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

export default function Orcamentos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projetoIdParam = searchParams.get('projeto_id');
  const loteIdParam = searchParams.get('lote_id');

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [orcamentoEditando, setOrcamentoEditando] = useState<Orcamento | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);
  const [filtroProjeto, setFiltroProjeto] = useState<number | null>(
    projetoIdParam ? Number(projetoIdParam) : null
  );
  const [filtroLote, setFiltroLote] = useState<number | null>(
    loteIdParam ? Number(loteIdParam) : null
  );

  const { error: apiError, handleError, clearError } = useApiError();
  const { notification, showSuccess, showError } = useNotification();
  const { filtroStatus, setFiltroStatus, filtered: orcamentosFiltrados, counts } = useStatusFilter(orcamentos);

  const form = useFormState(
    { projeto_id: filtroProjeto?.toString() || '', lote_id: filtroLote?.toString() || '', valor: '', status: 'RASCUNHO', observacoes: '' },
    {
      onSubmit: async (data) => {
        try {
          if (!data.projeto_id && !data.lote_id) throw new Error('Projeto ou Lote é obrigatório');

          const response = orcamentoEditando
            ? await apiClient.updateOrcamento(orcamentoEditando.id, {
              valor: parseFloat(data.valor),
              status: data.status,
              observacoes: data.observacoes,
            })
            : await apiClient.createOrcamento({
              projeto_id: data.projeto_id ? Number(data.projeto_id) : undefined,
              lote_id: data.lote_id ? Number(data.lote_id) : undefined,
              valor: parseFloat(data.valor),
              status: data.status,
              observacoes: data.observacoes,
            });

          if (response.error) throw new Error(response.error);

          showSuccess(orcamentoEditando ? 'Orçamento atualizado!' : 'Orçamento criado!');
          fecharFormulario();
          await carregarOrcamentos();
        } catch (error) {
          throw new Error(extractErrorMessage(error));
        }
      },
      validators: {
        valor: (v) =>
          !v || parseFloat(v) <= 0
            ? 'Valor deve ser maior que zero'
            : parseFloat(v) > VALIDATION_RULES.VALOR_MAX
              ? 'Valor excede o limite máximo'
              : null,
      },
      onError: (error) => showError(error.message),
    }
  );

  useEffect(() => {
    carregarProjetos();
    carregarLotes();
    carregarOrcamentos();
  }, [filtroProjeto, filtroLote]);

  const carregarProjetos = async () => {
    try {
      const response = await apiClient.getProjects();
      if (response.error) {
        handleError(new Error(response.error), 'carregarProjetos');
        return;
      }
      if (response.data) setProjetos(response.data);
    } catch (error) {
      handleError(error, 'carregarProjetos');
    }
  };

  const carregarLotes = async () => {
    try {
      if (filtroProjeto) {
        const response = await apiClient.getLotes(filtroProjeto);
        if (response.error) {
          handleError(new Error(response.error), 'carregarLotes');
          return;
        }
        if (response.data) setLotes(response.data);
      } else {
        setLotes([]);
      }
    } catch (error) {
      handleError(error, 'carregarLotes');
    }
  };

  const carregarOrcamentos = async () => {
    clearError();
    setLoading(true);
    try {
      const response = await apiClient.getOrcamentos(filtroProjeto || undefined, filtroLote || undefined);
      if (response.error) {
        handleError(new Error(response.error), 'carregarOrcamentos');
        return;
      }
      setOrcamentos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      handleError(error, 'carregarOrcamentos');
    } finally {
      setLoading(false);
    }
  };

  const abrirFormularioCriar = async () => {
    setOrcamentoEditando(null);
    form.setFormData({
      projeto_id: filtroProjeto?.toString() || '',
      lote_id: filtroLote?.toString() || '',
      valor: '',
      status: 'RASCUNHO',
      observacoes: '',
    });
    if (filtroProjeto) {
      try {
        const response = await apiClient.getLotes(filtroProjeto);
        if (response.data) setLotes(response.data);
      } catch (error) {
        console.error('Erro ao carregar lotes:', error);
      }
    }
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = async (orcamento: Orcamento) => {
    setOrcamentoEditando(orcamento);
    form.setFormData({
      projeto_id: orcamento.projeto_id?.toString() || '',
      lote_id: orcamento.lote_id?.toString() || '',
      valor: orcamento.valor.toString(),
      status: orcamento.status,
      observacoes: orcamento.observacoes || '',
    });
    if (orcamento.projeto_id) {
      try {
        const response = await apiClient.getLotes(orcamento.projeto_id);
        if (response.data) setLotes(response.data);
      } catch (error) {
        console.error('Erro ao carregar lotes:', error);
      }
    }
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setOrcamentoEditando(null);
    form.reset();
  };

  const excluirOrcamento = async (id: number) => {
    try {
      const response = await apiClient.deleteOrcamento(id);
      if (response.error) {
        showError(response.error);
        return;
      }
      showSuccess('Orçamento excluído!');
      setConfirmarExclusao(null);
      await carregarOrcamentos();
    } catch (error) {
      showError(extractErrorMessage(error));
    }
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const formatarData = (data?: string) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  const obterNomeProjeto = (id?: number) => !id ? '-' : projetos.find((p) => p.id === id)?.nome || `Projeto #${id}`;
  const obterNomeLote = (id?: number) => !id ? '-' : lotes.find((l) => l.id === id)?.nome_cliente || `Lote #${id}`;
  const totalValor = orcamentosFiltrados.reduce((acc, o) => acc + o.valor, 0);
  const aprovados = orcamentosFiltrados.filter((o) => o.status === 'APROVADO').length;

  return (
    <div className="topografo-page">
      {/* Page Header */}
      <div className="topografo-page-header">
        <div className="topografo-page-header-left">
          <span className="topografo-page-icon">💰</span>
          <div className="topografo-page-title">
            <h1>Orçamentos</h1>
            <p>Gerencie orçamentos de projetos e lotes</p>
          </div>
        </div>
        <div className="topografo-page-actions">
          <button onClick={abrirFormularioCriar} className="pro-btn pro-btn-primary">
            ➕ Novo Orçamento
          </button>
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

      {/* Filters */}
      <div className="pro-card" style={{ marginBottom: '24px' }}>
        <div className="pro-card-body" style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="pro-form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
              <label className="pro-form-label">Projeto</label>
              <select
                className="pro-form-select"
                value={filtroProjeto || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setFiltroProjeto(val);
                  setFiltroLote(null);
                  setSearchParams(val ? { projeto_id: String(val) } : {});
                }}
              >
                <option value="">Todos os projetos</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {filtroProjeto && (
              <div className="pro-form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                <label className="pro-form-label">Lote</label>
                <select
                  className="pro-form-select"
                  value={filtroLote || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setFiltroLote(val);
                  }}
                >
                  <option value="">Todos os lotes</option>
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>{l.nome_cliente}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="pro-card" style={{ marginBottom: '24px' }}>
        <div className="pro-card-body" style={{ padding: '16px 24px' }}>
          <StatusFilter
            statuses={ORCAMENTO_STATUSES}
            selectedStatus={filtroStatus}
            onStatusChange={setFiltroStatus}
            counts={counts}
            variant="pills"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {orcamentosFiltrados.length > 0 && (
        <div className="pro-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
          <div className="pro-stat-card">
            <div className="pro-stat-header">
              <span className="pro-stat-label">Total</span>
              <div className="pro-stat-icon blue"><span>📊</span></div>
            </div>
            <div className="pro-stat-value">{orcamentosFiltrados.length}</div>
          </div>
          <div className="pro-stat-card">
            <div className="pro-stat-header">
              <span className="pro-stat-label">Valor Total</span>
              <div className="pro-stat-icon purple"><span>💰</span></div>
            </div>
            <div className="pro-stat-value" style={{ color: '#a78bfa' }}>{formatarMoeda(totalValor)}</div>
          </div>
          <div className="pro-stat-card">
            <div className="pro-stat-header">
              <span className="pro-stat-label">Aprovados</span>
              <div className="pro-stat-icon green"><span>✅</span></div>
            </div>
            <div className="pro-stat-value" style={{ color: '#10b981' }}>{aprovados}</div>
          </div>
        </div>
      )}

      {/* Budget List */}
      {loading ? (
        <div className="pro-loading">
          <div className="pro-loading-spinner" />
          <div className="pro-loading-text">Carregando orçamentos...</div>
        </div>
      ) : apiError ? (
        <div className="pro-card">
          <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
            <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>⚠️</span>
            <h3 style={{ color: '#e2e8f0', marginBottom: '8px' }}>Não foi possível carregar orçamentos</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{apiError.message}</p>
            <button onClick={carregarOrcamentos} className="pro-btn pro-btn-primary">
              🔄 Tentar novamente
            </button>
          </div>
        </div>
      ) : orcamentosFiltrados.length === 0 ? (
        <div className="pro-card">
          <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
            <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>💰</span>
            <h3 style={{ color: '#e2e8f0' }}>Nenhum orçamento encontrado</h3>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orcamentosFiltrados.map((orcamento) => (
            <div key={orcamento.id} className="pro-card">
              <div className="pro-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#a78bfa' }}>{formatarMoeda(orcamento.valor)}</h3>
                  <StatusBadge status={orcamento.status} size="sm" />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => abrirFormularioEditar(orcamento)} className="pro-btn pro-btn-primary" style={{ padding: '8px 16px' }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => setConfirmarExclusao(orcamento.id)} className="pro-btn pro-btn-danger" style={{ padding: '8px 16px' }}>
                    🗑️ Excluir
                  </button>
                </div>
              </div>
              <div className="pro-card-body">
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: orcamento.observacoes ? '16px' : 0 }}>
                  {orcamento.projeto_id && (
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Projeto:</span>
                      <div style={{ color: '#e2e8f0' }}>{obterNomeProjeto(orcamento.projeto_id)}</div>
                    </div>
                  )}
                  {orcamento.lote_id && (
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Lote:</span>
                      <div style={{ color: '#e2e8f0' }}>{obterNomeLote(orcamento.lote_id)}</div>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Criado:</span>
                    <div style={{ color: '#e2e8f0' }}>{formatarData(orcamento.criado_em)}</div>
                  </div>
                </div>
                {orcamento.observacoes && (
                  <p style={{ color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>{orcamento.observacoes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={confirmarExclusao !== null}
        busy={form.loading}
        message="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
        onCancel={() => setConfirmarExclusao(null)}
        onConfirm={() => confirmarExclusao !== null && excluirOrcamento(confirmarExclusao)}
      />

      {/* Form Modal */}
      {mostrarFormulario && (
        <div className="pro-modal-overlay" onClick={() => !form.loading && fecharFormulario()}>
          <div className="pro-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h2 className="pro-modal-title">
                {orcamentoEditando ? '✏️ Editar Orçamento' : '➕ Novo Orçamento'}
              </h2>
              <button className="pro-modal-close" onClick={fecharFormulario} disabled={form.loading}>
                ✕
              </button>
            </div>
            <form onSubmit={form.handleSubmit}>
              <div className="pro-modal-body">
                {!orcamentoEditando && (
                  <>
                    <div className="pro-form-group">
                      <label className="pro-form-label">Projeto *</label>
                      <select
                        className="pro-form-select"
                        value={form.formData.projeto_id}
                        onChange={async (e) => {
                          form.handleChange('projeto_id', e.target.value);
                          if (e.target.value) {
                            try {
                              const response = await apiClient.getLotes(Number(e.target.value));
                              if (response.data) setLotes(response.data);
                            } catch (error) {
                              console.error('Erro ao carregar lotes:', error);
                            }
                          }
                        }}
                      >
                        <option value="">Selecione um projeto</option>
                        {projetos.map((p) => (
                          <option key={p.id} value={String(p.id)}>{p.nome}</option>
                        ))}
                      </select>
                      {form.errors.projeto_id && <span className="pro-form-error">{form.errors.projeto_id}</span>}
                    </div>

                    {form.formData.projeto_id && (
                      <div className="pro-form-group">
                        <label className="pro-form-label">Lote (opcional)</label>
                        <select
                          className="pro-form-select"
                          value={form.formData.lote_id}
                          onChange={(e) => form.handleChange('lote_id', e.target.value)}
                        >
                          <option value="">Todos os lotes</option>
                          {lotes.map((l) => (
                            <option key={l.id} value={String(l.id)}>{l.nome_cliente}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <div className="pro-form-group">
                  <label className="pro-form-label">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pro-form-input"
                    value={form.formData.valor}
                    onChange={(e) => form.handleChange('valor', e.target.value)}
                    onBlur={() => form.handleBlur('valor')}
                    placeholder="0.00"
                  />
                  {form.errors.valor && <span className="pro-form-error">{form.errors.valor}</span>}
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Status</label>
                  <select
                    className="pro-form-select"
                    value={form.formData.status}
                    onChange={(e) => form.handleChange('status', e.target.value)}
                  >
                    {Object.entries(ORCAMENTO_STATUSES).map(([key, value]) => (
                      <option key={key} value={key}>{value.icon} {value.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Observações</label>
                  <textarea
                    className="pro-form-textarea"
                    value={form.formData.observacoes}
                    onChange={(e) => form.handleChange('observacoes', e.target.value)}
                    placeholder="Observações..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="pro-modal-footer">
                <button type="button" onClick={fecharFormulario} disabled={form.loading} className="pro-btn pro-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={form.loading} className="pro-btn pro-btn-primary">
                  {form.loading ? 'Salvando...' : orcamentoEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
