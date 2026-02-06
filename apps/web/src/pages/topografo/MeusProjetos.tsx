import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';
import { Select, Input, Textarea } from '../../components/UIComponents';
import { StatusBadge, StatusFilter } from '../../components/StatusBadge';
import { useFormState, useStatusFilter } from '../../hooks/useFormState';
import { useApiError, useNotification, extractErrorMessage } from '../../hooks/useErrorHandler';
import { PROJECT_TYPES, PROJECT_STATUSES, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { Projeto, ProjetoCreateSchema, ProjetoUpdateSchema } from '../../schemas';

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
        setProjetos(response.data);
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

  return (
    <div style={{
      padding: 'clamp(1rem, 4vw, 2rem)',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      {/* Notificações */}
      {notification && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
        }}>
          {notification.message}
        </div>
      )}

      {apiError && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
        }}>
          {apiError.message}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>📁 Meus Projetos</h1>
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
          ➕ Novo Projeto
        </button>
      </div>

      {/* Filtros */}
      <StatusFilter
        statuses={PROJECT_STATUSES}
        selectedStatus={filtroStatus}
        onStatusChange={setFiltroStatus}
        counts={counts}
        variant="pills"
      />

      {/* Lista de Projetos */}
      {loading ? (
        <LoadingState title="Carregando projetos" description="Aguarde alguns segundos" />
      ) : apiError ? (
        <ErrorState
          title="Não foi possível carregar projetos"
          description={apiError.message}
          actionLabel="Tentar novamente"
          onAction={carregarProjetos}
        />
      ) : projetosFiltrados.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description={filtroStatus !== 'TODOS' ? 'Ajuste o filtro para ver outros projetos' : undefined}
          actionLabel={filtroStatus !== 'TODOS' ? 'Ver todos os projetos' : undefined}
          onAction={filtroStatus !== 'TODOS' ? () => setFiltroStatus('TODOS') : undefined}
        />
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        }}>
          {projetosFiltrados.map((projeto) => (
            <div
              key={projeto.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                      {projeto.nome}
                    </h3>
                    {projeto.descricao && (
                      <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{projeto.descricao}</p>
                    )}
                  </div>
                  <StatusBadge status={projeto.status} size="sm" />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#666' }}>
                  <span><strong>Tipo:</strong> {PROJECT_TYPES[projeto.tipo as keyof typeof PROJECT_TYPES]?.label}</span>
                  <span><strong>Criado:</strong> {formatarData(projeto.criado_em)}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => abrirFormularioEditar(projeto)}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      padding: '0.5rem',
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
                    onClick={() => setConfirmarExclusao(projeto.id)}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      padding: '0.5rem',
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        open={confirmarExclusao !== null}
        busy={form.loading}
        message="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
        onCancel={() => setConfirmarExclusao(null)}
        onConfirm={() => confirmarExclusao !== null && excluirProjeto(confirmarExclusao)}
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
            <h2 style={{ marginTop: 0 }}>
              {projetoEditando ? '✏️ Editar Projeto' : '➕ Novo Projeto'}
            </h2>

            <form onSubmit={form.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <Input
                  label="Nome do Projeto *"
                  type="text"
                  value={form.formData.nome}
                  onChange={(e) => form.handleChange('nome', e.target.value)}
                  onBlur={() => form.handleBlur('nome')}
                  placeholder="Ex: Loteamento Jardim das Flores"
                />
                {form.errors.nome && <span style={{ color: '#dc3545', fontSize: '0.85rem' }}>{form.errors.nome}</span>}
              </div>

              <div>
                <Textarea
                  label="Descrição"
                  value={form.formData.descricao}
                  onChange={(e) => form.handleChange('descricao', e.target.value)}
                  placeholder="Descrição do projeto..."
                  rows={3}
                />
                {form.errors.descricao && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem' }}>{form.errors.descricao}</span>
                )}
              </div>

              <Select
                label="Tipo"
                value={form.formData.tipo}
                onChange={(e) => form.handleChange('tipo', e.target.value)}
                options={Object.entries(PROJECT_TYPES).map(([key, value]) => ({
                  value: key,
                  label: value.label,
                }))}
              />

              {projetoEditando && (
                <Select
                  label="Status"
                  value={form.formData.status}
                  onChange={(e) => form.handleChange('status', e.target.value)}
                  options={Object.entries(PROJECT_STATUSES).map(([key, value]) => ({
                    value: key,
                    label: `${value.icon} ${value.label}`,
                  }))}
                />
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={fecharFormulario}
                  disabled={form.loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: form.loading ? 'wait' : 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={form.loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: form.loading ? 'wait' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
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
