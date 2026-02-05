import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { Button, Input, Select, Card, Badge, Textarea } from '../../components/UIComponents';
import Icon from '../../components/Icon';
import { DialogHeader } from '../../components/Navigation';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import './Financeiro.css';

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

const categoriaOpcoes = [
  { value: 'MATERIAL', label: 'Material' },
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'OUTROS', label: 'Outros' },
];

const getCategoryColor = (categoria?: string): string => {
  const cores: Record<string, string> = {
    'MATERIAL': '#3b82f6',
    'SERVICO': '#8b5cf6',
    'TRANSPORTE': '#f59e0b',
    'OUTROS': '#6b7280',
  };
  return cores[categoria || 'OUTROS'] || '#6b7280';
};

const getStatusBadgeVariant = (status: string): 'info' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'PAGO': return 'success';
    case 'PROCESSANDO': return 'warning';
    case 'PENDENTE': return 'warning';
    case 'FALHA': return 'error';
    default: return 'warning';
  }
};

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
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [formDataDespesa, setFormDataDespesa] = useState({
    projeto_id: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'OUTROS',
    observacoes: '',
  });

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load lotes when filtering
  useEffect(() => {
    if (filtroProjeto) {
      carregarLotes();
    }
  }, [filtroProjeto]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [projData, despData, pagData] = await Promise.all([
        apiClient.getProjects(),
        apiClient.getDespesas(),
        apiClient.getPagamentos?.(),
      ]);
      setProjetos(Array.isArray(projData) ? projData : []);
      setDespesas(Array.isArray(despData) ? despData : []);
      setPagamentos(Array.isArray(pagData) ? pagData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  const formatarData = (data: string): string => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const obterNomeProjeto = (id: number): string => {
    return projetos.find((p) => p.id === id)?.nome || 'Projeto desconhecido';
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

  const abrirFormularioCriarDespesa = () => {
    setDespesaEditando(null);
    setFormDataDespesa({
      projeto_id: '',
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
    if (!salvando) {
      setMostrarFormularioDespesa(false);
      setDespesaEditando(null);
      setFormDataDespesa({
        projeto_id: '',
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        categoria: 'OUTROS',
        observacoes: '',
      });
    }
  };

  const salvarDespesa = async () => {
    // Validate
    if (!formDataDespesa.descricao.trim()) {
      alert('Descrição é obrigatória');
      return;
    }

    const valor = parseFloat(formDataDespesa.valor);
    if (isNaN(valor) || valor <= 0) {
      alert('Valor deve ser maior que 0');
      return;
    }

    if (!formDataDespesa.projeto_id) {
      alert('Selecione um projeto');
      return;
    }

    setSalvando(true);
    try {
      if (despesaEditando) {
        await apiClient.updateDespesa?.(despesaEditando.id, {
          descricao: formDataDespesa.descricao,
          valor,
          data: formDataDespesa.data,
          categoria: formDataDespesa.categoria,
          observacoes: formDataDespesa.observacoes,
        });
      } else {
        await apiClient.createDespesa?.({
          projeto_id: parseInt(formDataDespesa.projeto_id),
          descricao: formDataDespesa.descricao,
          valor,
          data: formDataDespesa.data,
          categoria: formDataDespesa.categoria,
          observacoes: formDataDespesa.observacoes,
        });
      }

      await loadInitialData();
      fecharFormularioDespesa();
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
      await apiClient.deleteDespesa?.(id);
      await loadInitialData();
      setConfirmarExclusao(null);
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa');
    } finally {
      setSalvando(false);
    }
  };

  const despesasFiltradas = filtroProjeto
    ? despesas.filter((d) => d.projeto_id === filtroProjeto)
    : despesas;

  const pagamentosFiltrados = filtroProjeto && lotes.length > 0
    ? pagamentos.filter((p) => lotes.some((l) => l.id === p.lote_id))
    : pagamentos;

  const totalDespesas = despesasFiltradas.reduce((acc, d) => acc + d.valor, 0);
  const totalPagamentos = pagamentosFiltrados.reduce((acc, p) => acc + p.valor_total, 0);
  const totalPago = pagamentosFiltrados.reduce((acc, p) => acc + p.valor_pago, 0);

  return (
    <div className="financeiro-container">
      {/* Header */}
      <div className="financeiro-header">
        <div className="financeiro-title">
          <Icon name="credit-card" size="lg" color="primary" />
          <h1>Módulo Financeiro</h1>
        </div>
        {abaAtiva === 'DESPESAS' && (
          <Button
            variant="primary"
            onClick={abrirFormularioCriarDespesa}
            icon="plus"
          >
            Nova Despesa
          </Button>
        )}
      </div>

      {/* Filter Section */}
      <div className="financeiro-filter">
        <Select
          label="Filtrar por Projeto"
          value={filtroProjeto?.toString() || ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : null;
            setFiltroProjeto(val);
          }}
          options={[
            { value: '', label: 'Todos os projetos' },
            ...projetos.map((p) => ({ value: p.id.toString(), label: p.nome }))
          ]}
        />
      </div>

      {/* Tabs */}
      <div className="financeiro-tabs">
        <button
          className={`tab ${abaAtiva === 'DESPESAS' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('DESPESAS')}
        >
          <Icon name="credit-card" size="md" />
          Despesas
        </button>
        <button
          className={`tab ${abaAtiva === 'PAGAMENTOS' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('PAGAMENTOS')}
        >
          <Icon name="check-circle" size="md" />
          Pagamentos Recebidos
        </button>
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
                  <span className="summary-value expense">
                    {formatarMoeda(totalDespesas)}
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Expenses List */}
          {loading ? (
            <div className="empty-state">
              <Icon name="loader" size="lg" />
              <p>Carregando despesas...</p>
            </div>
          ) : despesasFiltradas.length === 0 ? (
            <div className="empty-state">
              <Icon name="inbox" size="lg" />
              <p>Nenhuma despesa encontrada</p>
            </div>
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
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => abrirFormularioEditarDespesa(despesa)}
                        icon="edit"
                      >
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
                  <span className="summary-value income">
                    {formatarMoeda(totalPagamentos)}
                  </span>
                </div>
              </Card>
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Valor Pago</span>
                  <span className="summary-value income">
                    {formatarMoeda(totalPago)}
                  </span>
                </div>
              </Card>
              <Card className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Pagamentos Aprovados</span>
                  <span className="summary-value">
                    {pagamentosFiltrados.filter((p) => p.status === 'PAGO').length}
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Payments List */}
          {loading ? (
            <div className="empty-state">
              <Icon name="loader" size="lg" />
              <p>Carregando pagamentos...</p>
            </div>
          ) : pagamentosFiltrados.length === 0 ? (
            <div className="empty-state">
              <Icon name="inbox" size="lg" />
              <p>Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <div className="payments-list">
              {pagamentosFiltrados.map((pagamento) => (
                <Card key={pagamento.id} className="payment-card">
                  <div className="payment-header">
                    <Badge variant={getStatusBadgeVariant(pagamento.status)}>
                      {pagamento.status}
                    </Badge>
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
        <div className="modal-overlay" onClick={() => !salvando && fecharFormularioDespesa()}>
          <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
            <DialogHeader
              title={despesaEditando ? 'Editar Despesa' : 'Nova Despesa'}
              onClose={fecharFormularioDespesa}
            >
              <div className="form-body">
                <Select
                  label="Projeto *"
                  value={formDataDespesa.projeto_id}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, projeto_id: e.target.value })}
                  required
                  options={[
                    { value: '', label: 'Selecione um projeto' },
                    ...projetos.map((p) => ({ value: p.id.toString(), label: p.nome }))
                  ]}
                />

                <Input
                  label="Descrição *"
                  type="text"
                  value={formDataDespesa.descricao}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, descricao: e.target.value })}
                  placeholder="Ex: Material de escritório"
                  required
                />

                <Input
                  label="Valor (R$) *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formDataDespesa.valor}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, valor: e.target.value })}
                  placeholder="0.00"
                  required
                />

                <Input
                  label="Data *"
                  type="date"
                  value={formDataDespesa.data}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, data: e.target.value })}
                  required
                />

                <Select
                  label="Categoria"
                  value={formDataDespesa.categoria}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, categoria: e.target.value })}
                  options={categoriaOpcoes}
                />

                <Textarea
                  label="Observações"
                  value={formDataDespesa.observacoes}
                  onChange={(e) => setFormDataDespesa({ ...formDataDespesa, observacoes: e.target.value })}
                  placeholder="Observações sobre a despesa..."
                  rows={4}
                />

                <div className="form-actions">
                  <Button
                    variant="secondary"
                    onClick={fecharFormularioDespesa}
                    disabled={salvando}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={salvarDespesa}
                    disabled={salvando}
                    isLoading={salvando}
                  >
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
