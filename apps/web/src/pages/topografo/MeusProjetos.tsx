import { useState, useEffect } from 'react';
import apiClient from '../../services/api';

interface Projeto {
  id: number;
  nome: string;
  descricao?: string;
  tipo: string;
  status: 'RASCUNHO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ARQUIVADO';
  criado_em?: string;
  atualizado_em?: string;
}

type StatusFiltro = 'TODOS' | 'RASCUNHO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ARQUIVADO';

export default function MeusProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('TODOS');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<Projeto | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'INDIVIDUAL',
    status: 'RASCUNHO' as Projeto['status'],
  });
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  useEffect(() => {
    carregarProjetos();
  }, []);

  const carregarProjetos = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProjects();
      if (response.data) {
        setProjetos(response.data as Projeto[]);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const projetosFiltrados = projetos.filter((p) =>
    filtroStatus === 'TODOS' ? true : p.status === filtroStatus
  );

  const getStatusBadgeStyle = (status: Projeto['status']) => {
    const styles: Record<Projeto['status'], { background: string; color: string; icon: string }> = {
      RASCUNHO: { background: '#f5c842', color: '#5d4e00', icon: '📝' },
      EM_ANDAMENTO: { background: '#2196f3', color: 'white', icon: '🚀' },
      CONCLUIDO: { background: '#4caf50', color: 'white', icon: '✅' },
      ARQUIVADO: { background: '#9e9e9e', color: 'white', icon: '📦' },
    };
    return styles[status] || styles.RASCUNHO;
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      INDIVIDUAL: 'Individual',
      DESMEMBRAMENTO: 'Desmembramento',
      LOTEAMENTO: 'Loteamento',
      RETIFICACAO: 'Retificação',
    };
    return tipos[tipo] || tipo;
  };

  const abrirFormularioCriar = () => {
    setProjetoEditando(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'INDIVIDUAL',
      status: 'RASCUNHO',
    });
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (projeto: Projeto) => {
    setProjetoEditando(projeto);
    setFormData({
      nome: projeto.nome,
      descricao: projeto.descricao || '',
      tipo: projeto.tipo,
      status: projeto.status,
    });
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setProjetoEditando(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'INDIVIDUAL',
      status: 'RASCUNHO',
    });
  };

  const salvarProjeto = async () => {
    if (!formData.nome.trim()) {
      alert('Nome do projeto é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      if (projetoEditando) {
        // Atualizar projeto existente
        const response = await apiClient.updateProject(projetoEditando.id, formData);
        if (response.error) {
          alert(`Erro ao atualizar projeto: ${response.error}`);
          return;
        }
      } else {
        // Criar novo projeto
        const response = await apiClient.createProject({
          nome: formData.nome,
          descricao: formData.descricao || undefined,
          tipo: formData.tipo,
        });
        if (response.error) {
          alert(`Erro ao criar projeto: ${response.error}`);
          return;
        }
      }
      fecharFormulario();
      carregarProjetos();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto');
    } finally {
      setSalvando(false);
    }
  };

  const excluirProjeto = async (id: number) => {
    setSalvando(true);
    try {
      const response = await apiClient.deleteProject(id);
      if (response.error) {
        alert(`Erro ao excluir projeto: ${response.error}`);
        return;
      }
      setConfirmarExclusao(null);
      carregarProjetos();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      alert('Erro ao excluir projeto');
    } finally {
      setSalvando(false);
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
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
              whiteSpace: 'nowrap' as const,
            }}
          >
            ➕ Novo Projeto
          </button>
        </div>
      </div>

      {/* Filtros com contadores por status */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {(['TODOS', 'RASCUNHO', 'EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO'] as StatusFiltro[]).map((status) => {
          const count = status === 'TODOS' ? projetos.length : projetos.filter((p) => p.status === status).length;
          const style = getStatusBadgeStyle(status === 'TODOS' ? 'RASCUNHO' : status);
          const isActive = filtroStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              style={{
                padding: '0.5rem 1rem',
                background: isActive ? (status === 'TODOS' ? '#667eea' : style.background) : 'white',
                color: isActive ? (status === 'TODOS' ? 'white' : style.color) : '#333',
                border: `2px solid ${isActive ? (status === 'TODOS' ? '#667eea' : style.background) : '#ddd'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                transition: 'all 0.2s ease',
              }}
            >
              {status === 'TODOS' ? '📋' : style.icon} {status === 'TODOS' ? 'Todos' : status.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de Projetos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p style={{ fontSize: '2rem' }}>⏳</p>
          <p>Carregando projetos...</p>
        </div>
      ) : projetosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '12px' }}>
          <p style={{ fontSize: '2rem' }}>📭</p>
          <p>Nenhum projeto encontrado</p>
          {filtroStatus !== 'TODOS' && (
            <button
              onClick={() => setFiltroStatus('TODOS')}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Ver todos os projetos
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        }}>
          {projetosFiltrados.map((projeto) => {
            const statusStyle = getStatusBadgeStyle(projeto.status);
            return (
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
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flex: 1,
                        minWidth: 0,
                      }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                          wordBreak: 'break-word' as const,
                        }}>
                          {projeto.nome}
                        </h3>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            background: statusStyle.background,
                            color: statusStyle.color,
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            flexShrink: 0,
                          }}
                        >
                          {statusStyle.icon} {projeto.status.replace('_', ' ')}
                        </span>
                      </div>
                      {projeto.descricao && (
                        <p style={{ color: '#666', margin: '0.5rem 0' }}>{projeto.descricao}</p>
                      )}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem 1.5rem',
                        marginTop: '1rem',
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        color: '#666',
                      }}>
                        <span>
                          <strong>Tipo:</strong> {getTipoLabel(projeto.tipo)}
                        </span>
                        <span>
                          <strong>Criado em:</strong> {formatarData(projeto.criado_em)}
                        </span>
                        {projeto.atualizado_em && projeto.atualizado_em !== projeto.criado_em && (
                          <span>
                            <strong>Atualizado em:</strong> {formatarData(projeto.atualizado_em)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}>
                      <button
                        onClick={() => abrirFormularioEditar(projeto)}
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
                        onClick={() => setConfirmarExclusao(projeto.id)}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmarExclusao !== null && (
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
          onClick={() => !salvando && setConfirmarExclusao(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => setConfirmarExclusao(null)}
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
                onClick={() => excluirProjeto(confirmarExclusao)}
                disabled={salvando}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: salvando ? 'wait' : 'pointer',
                }}
              >
                {salvando ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulário (Criar/Editar) */}
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
          onClick={() => !salvando && fecharFormulario()}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>
              {projetoEditando ? '✏️ Editar Projeto' : '➕ Novo Projeto'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Loteamento Jardim das Flores"
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
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do projeto..."
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

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="DESMEMBRAMENTO">Desmembramento</option>
                  <option value="LOTEAMENTO">Loteamento</option>
                  <option value="RETIFICACAO">Retificação</option>
                </select>
              </div>

              {projetoEditando && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Projeto['status'] })
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
                    <option value="EM_ANDAMENTO">🚀 Em Andamento</option>
                    <option value="CONCLUIDO">✅ Concluído</option>
                    <option value="ARQUIVADO">📦 Arquivado</option>
                  </select>
                </div>
              )}

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
                  onClick={salvarProjeto}
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
                  {salvando ? 'Salvando...' : projetoEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
