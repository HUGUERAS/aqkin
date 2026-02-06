import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/api';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';
import { Select, Input, Textarea } from '../../components/UIComponents';
import { StatusBadge, StatusFilter } from '../../components/StatusBadge';
import { useFormState, useStatusFilter } from '../../hooks/useFormState';
import { useApiError, useNotification, extractErrorMessage } from '../../hooks/useErrorHandler';
import { ORCAMENTO_STATUSES, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { Orcamento, OrcamentoCreateSchema } from '../../schemas';

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
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Notificações */}
      {notification && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {notification.message}
        </div>
      )}

      {apiError && (
        <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
          {apiError.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>💰 Orçamentos</h1>
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
          }}
        >
          ➕ Novo Orçamento
        </button>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Projeto</label>
          <select
            value={filtroProjeto || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setFiltroProjeto(val);
              setFiltroLote(null);
              setSearchParams(val ? { projeto_id: String(val) } : {});
            }}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
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
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Lote</label>
            <select
              value={filtroLote || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setFiltroLote(val);
              }}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
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

        <div style={{ flex: 2, minWidth: '100%' }}>
          <StatusFilter
            statuses={ORCAMENTO_STATUSES}
            selectedStatus={filtroStatus}
            onStatusChange={setFiltroStatus}
            counts={counts}
            variant="pills"
          />
        </div>
      </div>

      {/* Resumo Financeiro */}
      {orcamentosFiltrados.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{orcamentosFiltrados.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Valor Total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>{formatarMoeda(totalValor)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Aprovados</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f5132' }}>{aprovados}</div>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <LoadingState title="Carregando orçamentos" description="Aguarde alguns segundos" />
      ) : apiError ? (
        <ErrorState
          title="Não foi possível carregar orçamentos"
          description={apiError.message}
          actionLabel="Tentar novamente"
          onAction={carregarOrcamentos}
        />
      ) : orcamentosFiltrados.length === 0 ? (
        <EmptyState title="Nenhum orçamento encontrado" />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orcamentosFiltrados.map((orcamento) => (
            <div key={orcamento.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>{formatarMoeda(orcamento.valor)}</h3>
                    <StatusBadge status={orcamento.status} size="sm" />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    {orcamento.projeto_id && <span><strong>Projeto:</strong> {obterNomeProjeto(orcamento.projeto_id)}</span>}
                    {orcamento.lote_id && <span><strong>Lote:</strong> {obterNomeLote(orcamento.lote_id)}</span>}
                    <span><strong>Criado:</strong> {formatarData(orcamento.criado_em)}</span>
                  </div>
                  {orcamento.observacoes && <p style={{ color: '#666', margin: '0.5rem 0', fontSize: '0.9rem' }}>{orcamento.observacoes}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => abrirFormularioEditar(orcamento)}
                    style={{ flex: 1, minWidth: '100px', padding: '0.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => setConfirmarExclusao(orcamento.id)}
                    style={{ flex: 1, minWidth: '100px', padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmDeleteModal
        open={confirmarExclusao !== null}
        busy={form.loading}
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
            padding: '1rem',
          }}
          onClick={() => !form.loading && fecharFormulario()}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>{orcamentoEditando ? '✏️ Editar' : '➕ Novo'} Orçamento</h2>

            <form onSubmit={form.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!orcamentoEditando && (
                <>
                  <Select
                    label="Projeto *"
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
                    options={[{ value: '', label: 'Selecione um projeto' }, ...projetos.map((p) => ({ value: String(p.id), label: p.nome }))]}
                  />
                  {form.errors.projeto_id && <span style={{ color: '#dc3545', fontSize: '0.85rem' }}>{form.errors.projeto_id}</span>}

                  {form.formData.projeto_id && (
                    <Select
                      label="Lote (opcional)"
                      value={form.formData.lote_id}
                      onChange={(e) => form.handleChange('lote_id', e.target.value)}
                      options={[{ value: '', label: 'Todos os lotes' }, ...lotes.map((l) => ({ value: String(l.id), label: l.nome_cliente }))]}
                    />
                  )}
                </>
              )}

              <div>
                <Input
                  label="Valor (R$) *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.formData.valor}
                  onChange={(e) => form.handleChange('valor', e.target.value)}
                  onBlur={() => form.handleBlur('valor')}
                  placeholder="0.00"
                />
                {form.errors.valor && <span style={{ color: '#dc3545', fontSize: '0.85rem' }}>{form.errors.valor}</span>}
              </div>

              <Select
                label="Status"
                value={form.formData.status}
                onChange={(e) => form.handleChange('status', e.target.value)}
                options={Object.entries(ORCAMENTO_STATUSES).map(([key, value]) => ({ value: key, label: `${value.icon} ${value.label}` }))}
              />

              <Textarea
                label="Observações"
                value={form.formData.observacoes}
                onChange={(e) => form.handleChange('observacoes', e.target.value)}
                placeholder="Observações..."
                rows={3}
              />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={fecharFormulario}
                  disabled={form.loading}
                  style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={form.loading}
                  style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
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
