import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { Button, Input, Select, Card, Badge, Textarea } from '../../components/UIComponents';
import { StatusBadge, StatusFilter } from '../../components/StatusBadge';
import { useFormState, useStatusFilter } from '../../hooks/useFormState';
import { useApiError, useNotification, extractErrorMessage } from '../../hooks/useErrorHandler';
import { DESPESA_CATEGORIES, PAGAMENTO_STATUSES, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { Despesa, Pagamento } from '../../schemas';
import Icon from '../../components/Icon';
import { DialogHeader } from '../../components/Navigation';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';
import './Financeiro.css';

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
    <div className="financeiro-container">
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
      <div className="financeiro-header">
        <div className="financeiro-title">
          <Icon name="credit-card" size="lg" color="primary" />
          <h1>Módulo Financeiro</h1>
        </div>
        {abaAtiva === 'DESPESAS' && (
          <Button variant="primary" onClick={abrirFormularioCriar} icon="plus">
            Nova Despesa
          </Button>
        )}
        {abaAtiva === 'ENTRADA_RECURSO' && (
          <Button variant="success" icon="plus">
            Nova Entrada de Recurso
          </Button>
        )}
      </div>

      {/* Filter Section */}
      <div className="financeiro-filter">
        <Select
          label="Filtrar por Projeto"
          value={filtroProjeto?.toString() || ''}
          onChange={(e) => setFiltroProjeto(e.target.value ? parseInt(e.target.value) : null)}
          options={[{ value: '', label: 'Todos os projetos' }, ...projetos.map((p) => ({ value: p.id.toString(), label: p.nome }))]}
        />
      </div>

      {/* Tabs */}
      <div className="financeiro-tabs">
        {(['DESPESAS', 'PAGAMENTOS', 'ENTRADA_RECURSO'] as const).map((aba) => (
          <button
            key={aba}
            className={`tab ${abaAtiva === aba ? 'active' : ''}`}
            onClick={() => setAbaAtiva(aba)}
          >
            <Icon name={aba === 'DESPESAS' ? 'credit-card' : aba === 'PAGAMENTOS' ? 'check-circle' : 'alert-circle'} size="md" />
            {aba === 'DESPESAS' ? 'Despesas' : aba === 'PAGAMENTOS' ? 'Pagamentos Recebidos' : 'Entrada de Recurso'}
          </button>
        ))}
      </div>

      {/* Content */}
      {abaAtiva === 'DESPESAS' && (
        <div className="financeiro-content">
          {/* Summary Cards */}
          {despesasFiltradas.length > 0 && (
            <div className="financeiro-summary">
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Total de Despesas</span>
                  <span className="summary-value">{despesasFiltradas.length}</span>
                </div>
              </Card>
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Valor Total</span>
                  <span className="summary-value expense">{formatarMoeda(totalDespesas)}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Expenses List */}
          {loading ? (
            <LoadingState title="Carregando despesas" description="Aguarde alguns segundos" />
          ) : apiError ? (
            <ErrorState
              title="Não foi possível carregar despesas"
              description={apiError.message}
              actionLabel="Tentar novamente"
              onAction={carregarDados}
            />
          ) : despesasFiltradas.length === 0 ? (
            <EmptyState title="Nenhuma despesa encontrada" />
          ) : (
            <div className="expenses-list">
              {despesasFiltradas.map((despesa) => (
                <Card key={despesa.id} className="expense-card">
                  <div className="expense-header">
                    <div className="expense-title-group">
                      <h3>{despesa.descricao}</h3>
                      <Badge variant="info" style={{ backgroundColor: getCategoryColor(despesa.categoria) }}>
                        {despesa.categoria || 'OUTROS'}
                      </Badge>
                    </div>
                    <div className="expense-actions">
                      <Button variant="secondary" size="sm" onClick={() => abrirFormularioEditar(despesa)} icon="edit">
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmarExclusao(despesa.id)}
                        icon="trash-2"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>

                  <div className="expense-details">
                    <div className="detail-item">
                      <span className="detail-label">Valor:</span>
                      <span className="detail-value expense">{formatarMoeda(despesa.valor)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Data:</span>
                      <span className="detail-value">{formatarData(despesa.data)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Projeto:</span>
                      <span className="detail-value">{obterNomeProjeto(despesa.projeto_id)}</span>
                    </div>
                  </div>

                  {despesa.observacoes && (
                    <div className="expense-notes">
                      <p>{despesa.observacoes}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'PAGAMENTOS' && (
        <div className="financeiro-content">
          {/* Summary Cards */}
          {pagamentosFiltrados.length > 0 && (
            <div className="financeiro-summary">
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Total de Pagamentos</span>
                  <span className="summary-value">{pagamentosFiltrados.length}</span>
                </div>
              </Card>
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Valor Total</span>
                  <span className="summary-value income">{formatarMoeda(totalPagamentos)}</span>
                </div>
              </Card>
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Valor Pago</span>
                  <span className="summary-value income">{formatarMoeda(totalPago)}</span>
                </div>
              </Card>
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Pagamentos Aprovados</span>
                  <span className="summary-value">{pagamentosFiltrados.filter((p) => p.status === 'PAGO').length}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Payments List */}
          {loading ? (
            <LoadingState title="Carregando pagamentos" description="Aguarde alguns segundos" />
          ) : apiError ? (
            <ErrorState
              title="Não foi possível carregar pagamentos"
              description={apiError.message}
              actionLabel="Tentar novamente"
              onAction={carregarDados}
            />
          ) : pagamentosFiltrados.length === 0 ? (
            <EmptyState title="Nenhum pagamento encontrado" />
          ) : (
            <div className="payments-list">
              {pagamentosFiltrados.map((pagamento) => (
                <Card key={pagamento.id} className="payment-card">
                  <div className="payment-header">
                    <Badge variant={getStatusBadgeVariant(pagamento.status)}>{pagamento.status}</Badge>
                  </div>

                  <div className="payment-details">
                    <div className="detail-item">
                      <span className="detail-label">Valor Total:</span>
                      <span className="detail-value">{formatarMoeda(pagamento.valor_total)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Valor Pago:</span>
                      <span className="detail-value income">{formatarMoeda(pagamento.valor_pago)}</span>
                    </div>
                    {pagamento.data_pagamento && (
                      <div className="detail-item">
                        <span className="detail-label">Data:</span>
                        <span className="detail-value">{formatarData(pagamento.data_pagamento)}</span>
                      </div>
                    )}
                  </div>

                  {pagamento.gateway_id && (
                    <div className="payment-gateway">
                      <p>
                        <strong>Gateway:</strong> {pagamento.gateway_id}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Entrada de Recurso Tab */}
      {abaAtiva === 'ENTRADA_RECURSO' && (
        <div className="financeiro-content">
          <Card className="entrada-recurso-info">
            <div className="entrada-recurso-header">
              <div className="entrada-recurso-title">
                <span className="titulo-icon">📋</span>
                <h2>Entrada de Recurso Financeira</h2>
              </div>
              <p className="entrada-recurso-desc">
                Registre uma reclamação ou recurso sobre valores pagos, retenções ou cobranças questionáveis
              </p>
            </div>

            <div className="entrada-recurso-form">
              <div className="form-group">
                <label>Tipo de Recurso *</label>
                <select className="form-select">
                  <option value="">Selecione o tipo</option>
                  <option value="cobranca">Cobrança Indevida</option>
                  <option value="retencao">Problema com Retenção</option>
                  <option value="pagamento">Discrepância de Pagamento</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descrição do Problema *</label>
                <textarea 
                  className="form-textarea"
                  placeholder="Descreva detalhadamente o problema e como deseja resolvê-lo..."
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label>Data do Problema *</label>
                <input type="date" className="form-input" />
              </div>

              <div className="form-group">
                <label>Valor em Questão (R$)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-actions">
                <Button variant="secondary">Cancelar</Button>
                <Button variant="success" icon="send">
                  Enviar Recurso
                </Button>
              </div>
            </div>
          </Card>

          <Card className="entrada-recurso-info info-box">
            <h3>📌 Informações Importantes</h3>
            <ul>
              <li><strong>Prazo:</strong> Você tem até 30 dias a partir da data do problema para registrar um recurso</li>
              <li><strong>Documentação:</strong> Tenha documentação disponível (recibos, extratos, contratos)</li>
              <li><strong>Resposta:</strong> Você receberá resposta em até 15 dias úteis</li>
              <li><strong>Recursos Anteriores:</strong> Consulte o histórico de recursos abaixo</li>
            </ul>
          </Card>

          <div style={{ marginTop: '2rem' }}>
            <h3>Histórico de Recursos</h3>
            <EmptyState 
              title="Nenhum recurso registrado ainda" 
              description="Quando você submeter um recurso, ele aparecerá aqui"
            />
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
        <div className="modal-overlay" onClick={() => !form.loading && fecharFormulario()}>
          <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
            <DialogHeader title={despesaEditando ? 'Editar Despesa' : 'Nova Despesa'} onClose={fecharFormulario}>
              <div className="form-body">
                <Select
                  label="Projeto *"
                  value={form.formData.projeto_id}
                  onChange={(e) => form.handleChange('projeto_id', e.target.value)}
                  required
                  options={[{ value: '', label: 'Selecione um projeto' }, ...projetos.map((p) => ({ value: p.id.toString(), label: p.nome }))]}
                />

                <Input
                  label="Descrição *"
                  type="text"
                  value={form.formData.descricao}
                  onChange={(e) => form.handleChange('descricao', e.target.value)}
                  placeholder="Ex: Material de escritório"
                  required
                />

                <Input
                  label="Valor (R$) *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.formData.valor}
                  onChange={(e) => form.handleChange('valor', e.target.value)}
                  placeholder="0.00"
                  required
                />

                <Input
                  label="Data *"
                  type="date"
                  value={form.formData.data}
                  onChange={(e) => form.handleChange('data', e.target.value)}
                  required
                />

                <Select
                  label="Categoria"
                  value={form.formData.categoria}
                  onChange={(e) => form.handleChange('categoria', e.target.value)}
                  options={categoriaOpcoes}
                />

                <Textarea
                  label="Observações"
                  value={form.formData.observacoes}
                  onChange={(e) => form.handleChange('observacoes', e.target.value)}
                  placeholder="Observações sobre a despesa..."
                  rows={4}
                />

                <div className="form-actions">
                  <Button variant="secondary" onClick={fecharFormulario} disabled={form.loading}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={() => form.handleSubmit()} disabled={form.loading} isLoading={form.loading}>
                    {despesaEditando ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
