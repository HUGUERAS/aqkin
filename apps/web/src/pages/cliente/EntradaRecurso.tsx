import { useState } from 'react';
import { Alert, Button, Card, Input, Select } from '../../components/UIComponents';
import './EntradaRecurso.css';

export default function EntradaRecurso() {
    const [formData, setFormData] = useState({
        tipo: 'desenho',
        assunto: '',
        descricao: '',
        prioridade: 'media',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Simulação de envio
            console.log('📤 Recurso enviado:', formData);

            // Aqui você faria a chamada à API
            // await apiClient.submitRecurso(formData);

            setSuccess(true);
            setFormData({ tipo: 'desenho', assunto: '', descricao: '', prioridade: 'media' });

            setTimeout(() => setSuccess(false), 5000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao enviar recurso';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recurso-container">
            <Card className="recurso-card" hover={false}>
                <header className="recurso-header">
                    <h1>📋 Entrada de Recurso</h1>
                    <p>
                        Use este formulário para fazer reclamações, sugestões ou questionar decisões
                        relacionadas ao seu processo de regularização.
                    </p>
                </header>

                {success && (
                    <Alert type="success" title="Sucesso!">
                        Seu recurso foi registrado com sucesso. Você receberá uma resposta em até 5 dias úteis.
                    </Alert>
                )}

                {error && (
                    <Alert type="error" title="Erro">
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="recurso-form">
                    {/* Tipo de Recurso */}
                    <div className="recurso-group">
                        <label htmlFor="tipo" className="recurso-label">
                            Tipo de Recurso
                        </label>
                        <Select
                            id="tipo"
                            value={formData.tipo}
                            onChange={(e) => handleChange('tipo', e.target.value)}
                        >
                            <option value="desenho">❌ Desenho rejeitado</option>
                            <option value="validade">⏰ Questionar validade</option>
                            <option value="topografo">🙋 Recurso contra topógrafo</option>
                            <option value="sugestao">💡 Sugestão de melhoria</option>
                            <option value="outro">📝 Outro</option>
                        </Select>
                    </div>

                    {/* Assunto */}
                    <div className="recurso-group">
                        <label htmlFor="assunto" className="recurso-label">
                            Assunto *
                        </label>
                        <Input
                            id="assunto"
                            type="text"
                            placeholder="Resumo do recurso em 1 linha"
                            value={formData.assunto}
                            onChange={(e) => handleChange('assunto', e.target.value)}
                            required
                        />
                    </div>

                    {/* Descrição Detalhada */}
                    <div className="recurso-group">
                        <label htmlFor="descricao" className="recurso-label">
                            Descrição Detalhada *
                        </label>
                        <textarea
                            id="descricao"
                            placeholder="Explique com detalhes o motivo do seu recurso. Seja específico e objetivo."
                            value={formData.descricao}
                            onChange={(e) => handleChange('descricao', e.target.value)}
                            className="recurso-textarea"
                            rows={6}
                            required
                        />
                    </div>

                    {/* Prioridade */}
                    <div className="recurso-group">
                        <label htmlFor="prioridade" className="recurso-label">
                            Prioridade
                        </label>
                        <Select
                            id="prioridade"
                            value={formData.prioridade}
                            onChange={(e) => handleChange('prioridade', e.target.value)}
                        >
                            <option value="baixa">🟢 Baixa</option>
                            <option value="media">🟡 Média</option>
                            <option value="alta">🔴 Alta</option>
                        </Select>
                    </div>

                    {/* Botões */}
                    <div className="recurso-actions">
                        <Button
                            type="submit"
                            disabled={loading || !formData.assunto || !formData.descricao}
                            isLoading={loading}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                color: 'white',
                            }}
                        >
                            📤 Enviar Recurso
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setFormData({ tipo: 'desenho', assunto: '', descricao: '', prioridade: 'media' })}
                            style={{
                                background: '#f3f4f6',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            Limpar Formulário
                        </Button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="recurso-info">
                    <h3>ℹ️ Informações Importantes</h3>
                    <ul>
                        <li>Recursos devem ser fundamentados e específicos</li>
                        <li>Prazo de resposta: até 5 dias úteis</li>
                        <li>Você receberá atualizações por email</li>
                        <li>Não delete seu histórico de recurso</li>
                    </ul>
                </div>
            </Card>

            {/* Histórico de Recursos */}
            <Card className="recurso-history" hover={false}>
                <h2>📜 Histórico de Recursos</h2>
                <div className="history-list">
                    <div className="history-item pending">
                        <div className="history-status">⏳ Pendente</div>
                        <div className="history-content">
                            <p className="history-assunto">Desenho rejected - questionamento</p>
                            <p className="history-data">Enviado em 15/01/2025</p>
                        </div>
                        <div className="history-priority">🟡 Média</div>
                    </div>

                    <div className="history-item approved">
                        <div className="history-status">✅ Aprovado</div>
                        <div className="history-content">
                            <p className="history-assunto">Solicitação de revisão do topógrafo</p>
                            <p className="history-data">Enviado em 05/01/2025</p>
                        </div>
                        <div className="history-priority">🟢 Baixa</div>
                    </div>

                    <div className="history-item rejected">
                        <div className="history-status">❌ Rejeitado</div>
                        <div className="history-content">
                            <p className="history-assunto">Sugestão de melhoria no formulário</p>
                            <p className="history-data">Enviado em 20/12/2024</p>
                        </div>
                        <div className="history-priority">🟢 Baixa</div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
