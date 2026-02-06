import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { StatusBadge, StatusFilter } from '../../components/StatusBadge';
import { useFormState, useStatusFilter } from '../../hooks/useFormState';
import { useApiError, useNotification, extractErrorMessage } from '../../hooks/useErrorHandler';
import { PROJECT_TYPES, PROJECT_STATUSES, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { Projeto } from '../../schemas';
import '../../styles/TopografoPro.css';

export default function MeusProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<Projeto | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  const { error: apiError, handleError, clearError } = useApiError();
  const { notification, showSuccess, showError } = useNotification();
  const { filtroStatus, setFiltroStatus, filtered: projetosFiltrados, counts } = useStatusFilter(projetos);

  const form = useFormState(
    { nome: '', descricao: '', tipo: 'INDIVIDUAL', status: 'RASCUNHO' },
    {
      onSubmit: async (data) => {
        try {
          const response = projetoEditando
            ? await apiClient.updateProject(projetoEditando.id, data)
            : await apiClient.createProject(data);

          if (response.error) throw new Error(response.error);

          showSuccess(
            projetoEditando
              ? 'Projeto atualizado com sucesso!'
              : 'Projeto criado com sucesso!'
          );
          fecharFormulario();
          await carregarProjetos();
        } catch (error) {
          throw new Error(extractErrorMessage(error));
        }
      },
      validators: {
        nome: (v) =>
          !v?.trim()
            ? ERROR_MESSAGES.REQUIRED_FIELD('Nome')
            : v.length < VALIDATION_RULES.PROJECT_NAME_MIN
              ? ERROR_MESSAGES.MIN_LENGTH('Nome', VALIDATION_RULES.PROJECT_NAME_MIN)
              : v.length > VALIDATION_RULES.PROJECT_NAME_MAX
                ? ERROR_MESSAGES.MAX_LENGTH('Nome', VALIDATION_RULES.PROJECT_NAME_MAX)
                : null,
        descricao: (v) =>
          v && v.length > VALIDATION_RULES.DESCRIPTION_MAX
            ? ERROR_MESSAGES.MAX_LENGTH('Descrição', VALIDATION_RULES.DESCRIPTION_MAX)
            : null,
      },
      onError: (error) => showError(error.message),
    }
  );

  useEffect(() => {
    carregarProjetos();
  }, []);

  const carregarProjetos = async () => {
    clearError();
    setLoading(true);
    try {
      const response = await apiClient.getProjects();
      if (response.error) {
        handleError(new Error(response.error), 'carregarProjetos');
        return;
      }
      if (response.data) {
        setProjetos(response.data as Projeto[]);
      }
    } catch (error) {
      handleError(error, 'carregarProjetos');
    } finally {
      setLoading(false);
    }
  };

  const abrirFormularioCriar = () => {
    setProjetoEditando(null);
    form.reset();
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (projeto: Projeto) => {
    setProjetoEditando(projeto);
    form.setFormData({
      nome: projeto.nome,
      descricao: projeto.descricao || '',
      tipo: projeto.tipo,
      status: projeto.status as any,
    });
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setProjetoEditando(null);
    form.reset();
  };

  const excluirProjeto = async (id: number) => {
    try {
      const response = await apiClient.deleteProject(id);
      if (response.error) {
        showError(response.error);
        return;
      }
      showSuccess('Projeto excluído com sucesso!');
      setConfirmarExclusao(null);
      await carregarProjetos();
    } catch (error) {
      showError(extractErrorMessage(error));
    }
  };

  const formatarData = (data?: string | null) => {
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

  return (
    <div className="topografo-page">
      {/* Page Header */}
      <div className="topografo-page-header">
        <div className="topografo-page-header-left">
          <span className="topografo-page-icon">📁</span>
          <div className="topografo-page-title">
            <h1>Meus Projetos</h1>
            <p>Gerencie todos os seus projetos de topografia</p>
          </div>
        </div>
        <div className="topografo-page-actions">
          <button onClick={abrirFormularioCriar} className="pro-btn pro-btn-primary">
            ➕ Novo Projeto
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

      {/* Status Filter */}
      <div className="pro-card" style={{ marginBottom: '24px' }}>
        <div className="pro-card-body" style={{ padding: '16px 24px' }}>
          <StatusFilter
            statuses={PROJECT_STATUSES}
            selectedStatus={filtroStatus}
            onStatusChange={setFiltroStatus}
            counts={counts}
            variant="pills"
          />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="pro-loading">
          <div className="pro-loading-spinner" />
          <div className="pro-loading-text">Carregando projetos...</div>
        </div>
      ) : apiError ? (
        <div className="pro-card">
          <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
            <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>⚠️</span>
            <h3 style={{ color: '#e2e8f0', marginBottom: '8px' }}>Não foi possível carregar projetos</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{apiError.message}</p>
            <button onClick={carregarProjetos} className="pro-btn pro-btn-primary">
              🔄 Tentar novamente
            </button>
          </div>
        </div>
      ) : projetosFiltrados.length === 0 ? (
        <div className="pro-card">
          <div className="pro-card-body" style={{ textAlign: 'center', padding: '48px' }}>
            <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>📂</span>
            <h3 style={{ color: '#e2e8f0', marginBottom: '8px' }}>Nenhum projeto encontrado</h3>
            {filtroStatus !== 'TODOS' && (
              <>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Ajuste o filtro para ver outros projetos</p>
                <button onClick={() => setFiltroStatus('TODOS')} className="pro-btn pro-btn-secondary">
                  Ver todos os projetos
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="pro-grid-3">
          {projetosFiltrados.map((projeto) => (
            <div key={projeto.id} className="pro-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="pro-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{projeto.nome}</h3>
                  <StatusBadge status={projeto.status} size="sm" />
                </div>
                {projeto.descricao && (
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{projeto.descricao}</p>
                )}
              </div>
              <div className="pro-card-body" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#e2e8f0' }}>Tipo:</strong> {PROJECT_TYPES[projeto.tipo as keyof typeof PROJECT_TYPES]?.label}
                  </span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#e2e8f0' }}>Criado:</strong> {formatarData(projeto.criado_em)}
                  </span>
                </div>
              </div>
              <div className="pro-card-footer" style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => abrirFormularioEditar(projeto)} className="pro-btn pro-btn-primary" style={{ flex: 1 }}>
                  ✏️ Editar
                </button>
                <button onClick={() => setConfirmarExclusao(projeto.id)} className="pro-btn pro-btn-danger" style={{ flex: 1 }}>
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={confirmarExclusao !== null}
        busy={form.loading}
        message="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
        onCancel={() => setConfirmarExclusao(null)}
        onConfirm={() => confirmarExclusao !== null && excluirProjeto(confirmarExclusao)}
      />

      {/* Form Modal */}
      {mostrarFormulario && (
        <div className="pro-modal-overlay" onClick={() => !form.loading && fecharFormulario()}>
          <div className="pro-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h2 className="pro-modal-title">
                {projetoEditando ? '✏️ Editar Projeto' : '➕ Novo Projeto'}
              </h2>
              <button className="pro-modal-close" onClick={fecharFormulario} disabled={form.loading}>
                ✕
              </button>
            </div>
            <form onSubmit={form.handleSubmit}>
              <div className="pro-modal-body">
                <div className="pro-form-group">
                  <label className="pro-form-label">Nome do Projeto *</label>
                  <input
                    type="text"
                    className="pro-form-input"
                    value={form.formData.nome}
                    onChange={(e) => form.handleChange('nome', e.target.value)}
                    onBlur={() => form.handleBlur('nome')}
                    placeholder="Ex: Loteamento Jardim das Flores"
                  />
                  {form.errors.nome && <span className="pro-form-error">{form.errors.nome}</span>}
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Descrição</label>
                  <textarea
                    className="pro-form-textarea"
                    value={form.formData.descricao}
                    onChange={(e) => form.handleChange('descricao', e.target.value)}
                    placeholder="Descrição do projeto..."
                    rows={3}
                  />
                  {form.errors.descricao && <span className="pro-form-error">{form.errors.descricao}</span>}
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Tipo</label>
                  <select
                    className="pro-form-select"
                    value={form.formData.tipo}
                    onChange={(e) => form.handleChange('tipo', e.target.value)}
                  >
                    {Object.entries(PROJECT_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>

                {projetoEditando && (
                  <div className="pro-form-group">
                    <label className="pro-form-label">Status</label>
                    <select
                      className="pro-form-select"
                      value={form.formData.status}
                      onChange={(e) => form.handleChange('status', e.target.value)}
                    >
                      {Object.entries(PROJECT_STATUSES).map(([key, value]) => (
                        <option key={key} value={key}>{value.icon} {value.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="pro-modal-footer">
                <button type="button" onClick={fecharFormulario} disabled={form.loading} className="pro-btn pro-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={form.loading} className="pro-btn pro-btn-primary">
                  {form.loading ? 'Salvando...' : projetoEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
