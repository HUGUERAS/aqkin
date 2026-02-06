/**
 * Forgot Password Page
 * Password recovery via email
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Alert, Button, Input } from '../../components/UIComponents';
import Logo from '../../components/Logo';
import Icon from '../../components/Icon';
import './AuthPages.css';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (err) throw err;

            setSent(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao enviar email';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-content">
                <div className="auth-logo">
                    <Logo size="lg" variant="icon" />
                </div>

                <div className="auth-card">
                    {!sent ? (
                        <>
                            <h1 className="auth-title">Recuperar Senha</h1>
                            <p className="auth-subtitle">
                                Digite seu email para receber um link de recuperação
                            </p>

                            {error && (
                                <Alert type="error" title="Erro">
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    label="Email"
                                    icon="envelope"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={loading}
                                    isLoading={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                                </Button>
                            </form>

                            <div className="auth-action-row">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="auth-text-button"
                                >
                                    <Icon name="back" size="sm" />
                                    Voltar ao Login
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-success">
                            <div className="auth-success-icon">
                                <span>
                                    <Icon name="check" size="xl" color="success" />
                                </span>
                            </div>
                            <h2 className="auth-title">Email Enviado com Sucesso!</h2>
                            <p className="auth-subtitle">
                                Clique no link enviado para <strong>{email}</strong> para redefinir sua senha
                            </p>
                            <p className="auth-subtitle">
                                Verifique também a pasta de spam se não encontrar o email
                            </p>

                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/login')}
                            >
                                <Icon name="back" size="sm" />
                                Voltar ao Login
                            </Button>
                        </div>
                    )}
                </div>

                <p className="auth-help">
                    Não consegue acessar seu email?{' '}
                    <button
                        onClick={() => {
                            alert('Entre em contato com o suporte: suporte@ativoreal.com');
                        }}
                    >
                        Contate o Suporte
                    </button>
                </p>
            </div>
        </div>
    );
}
