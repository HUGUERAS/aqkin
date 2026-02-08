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
        supabase.auth.getSession().then((result) => {
            if (!result.data.session) {
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
            <div
                className="min-h-screen flex items-center justify-center p-6"
                style={{ background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)' }}
            >
                <div
                    className="w-full max-w-md rounded-2xl shadow-2xl p-8 text-center border"
                    style={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#e5e7eb',
                    }}
                >
                    <Icon name="alert" size="xl" color="error" className="mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-50 mb-2">Link Inválido</h2>
                    <p className="text-slate-300 mb-6">
                        Este link de recuperação expirou ou é inválido. Solicite um novo link.
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/forgot-password')}
                        className="w-full text-white font-semibold"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                            border: 'none',
                        }}
                    >
                        Solicitar Novo Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)' }}
        >
            <div className="w-full max-w-xl">
                <div className="flex justify-center mb-8">
                    <Logo size="lg" variant="icon" />
                </div>

                <div
                    className="rounded-2xl shadow-2xl p-10 border"
                    style={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        borderColor: 'rgba(59, 130, 246, 0.25)',
                        color: '#e5e7eb',
                    }}
                >
                    {!success ? (
                        <>
                            <h1 className="text-3xl font-bold text-slate-50 mb-2 text-center">
                                Nova Senha
                            </h1>
                            <p className="text-slate-300 text-center mb-6">
                                Escolha uma nova senha forte para sua conta
                            </p>

                            {error && (
                                <Alert type="error" title="Erro">
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    className="w-full text-white font-semibold"
                                    style={{
                                        background:
                                            loading
                                                ? '#1f2937'
                                                : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                        border: 'none',
                                    }}
                                    disabled={loading}
                                    isLoading={loading}
                                >
                                    {loading ? 'Atualizando...' : 'Redefinir Senha'}
                                </Button>
                            </form>

                            <div className="mt-6">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full flex items-center justify-center gap-2 font-semibold transition-colors"
                                    style={{ color: '#60a5fa' }}
                                >
                                    <Icon name="back" size="sm" />
                                    Voltar ao Login
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-emerald-900/60 border border-emerald-500/40 p-4">
                                    <Icon name="check" size="xl" color="success" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-50 mb-2">
                                Senha Redefinida!
                            </h2>
                            <p className="text-slate-300">
                                Redirecionando para login...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
