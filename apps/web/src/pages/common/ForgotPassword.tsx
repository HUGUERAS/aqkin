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
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
            }}
        >
            <div className="w-full max-w-xl">
                <div className="flex justify-center mb-8">
                    <Logo size="lg" variant="icon" />
                </div>

                <div
                    className="rounded-2xl p-10 shadow-2xl border"
                    style={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        borderColor: 'rgba(59, 130, 246, 0.25)',
                        boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
                    }}
                >
                    {!sent ? (
                        <>
                            <h1 className="text-3xl font-bold text-slate-50 mb-2 text-center">
                                Recuperar Senha
                            </h1>
                            <p className="text-slate-300 text-center mb-6">
                                Enviaremos um link seguro para você redefinir sua senha
                            </p>

                            {error && (
                                <Alert type="error" title="Erro">
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                                </Button>
                            </form>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 flex items-center justify-center gap-2 font-semibold transition-colors"
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
                                Email Enviado com Sucesso!
                            </h2>
                            <p className="text-slate-300 mb-4">
                                Clique no link enviado para <strong>{email}</strong> para redefinir sua senha
                            </p>
                            <p className="text-slate-400 text-sm mb-6">
                                Verifique também a pasta de spam se não encontrar o email
                            </p>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                    color: 'white',
                                }}
                            >
                                <Icon name="back" size="sm" />
                                Voltar ao Login
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-300 text-sm mt-6">
                    Não consegue acessar seu email?{' '}
                    <button
                        onClick={() => {
                            alert('Entre em contato com o suporte: suporte@ativoreal.com');
                        }}
                        className="font-semibold transition-colors"
                        style={{ color: '#60a5fa' }}
                    >
                        Contate o Suporte
                    </button>
                </p>
            </div>
        </div>
    );
}
