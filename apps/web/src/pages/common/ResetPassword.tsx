/**
 * Reset Password Page
 * Change password via recovery link
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Alert, Button, Input } from '../../components/UIComponents';
import Logo from '../../components/Logo';
import Icon from '../../components/Icon';
import './AuthPages.css';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionValid, setSessionValid] = useState(true);

    // Verificar se o usuário veio de um link de recuperação válido
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setSessionValid(false);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
            setError('As senhas não correspondem');
            return;
        }

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const { error: err } = await supabase.auth.updateUser({
                password,
            });

            if (err) throw err;

            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao redefinir senha';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!sessionValid) {
        return (
            <div className="auth-shell">
                <div className="auth-content">
                    <div className="auth-card auth-card--compact">
                        <Icon name="alert" size="xl" color="error" className="auth-warning-icon" />
                        <h2 className="auth-title">Link Inválido</h2>
                        <p className="auth-subtitle">
                            Este link de recuperação expirou ou é inválido. Solicite um novo link.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Solicitar Novo Link
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-shell">
            <div className="auth-content">
                <div className="auth-logo">
                    <Logo size="lg" variant="icon" />
                </div>

                <div className="auth-card">
                    {!success ? (
                        <>
                            <h1 className="auth-title">Nova Senha</h1>
                            <p className="auth-subtitle">Digite uma nova senha para sua conta</p>

                            {error && (
                                <Alert type="error" title="Erro">
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <Input
                                    type="password"
                                    placeholder="Nova senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    label="Nova Senha"
                                    helperText="Mínimo 8 caracteres"
                                    icon="lock"
                                />

                                <Input
                                    type="password"
                                    placeholder="Confirme a senha"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    required
                                    label="Confirmar Senha"
                                    icon="lock"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={loading}
                                    isLoading={loading}
                                >
                                    {loading ? 'Atualizando...' : 'Redefinir Senha'}
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
                            <h2 className="auth-title">Senha Redefinida!</h2>
                            <p className="auth-subtitle">Redirecionando para login...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
