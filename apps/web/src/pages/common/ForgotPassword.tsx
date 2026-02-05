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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo size="lg" variant="icon" />
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {!sent ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                                Recuperar Senha
                            </h1>
                            <p className="text-gray-600 text-center mb-6">
                                Digite seu email para receber um link de recuperação
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
                                    className="w-full"
                                    disabled={loading}
                                    isLoading={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                                </Button>
                            </form>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                                >
                                    <Icon name="back" size="sm" />
                                    Voltar ao Login
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-full bg-green-100 p-4">
                                        <Icon name="check" size="xl" color="success" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Email Enviado com Sucesso!
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Clique no link enviado para <strong>{email}</strong> para redefinir sua senha
                                </p>
                                <p className="text-gray-500 text-sm mb-6">
                                    Verifique também a pasta de spam se não encontrar o email
                                </p>

                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Icon name="back" size="sm" />
                                    Voltar ao Login
                                </button>
                            </div>
                    )}
                </div>

                {/* Help Text */}
                <p className="text-center text-gray-600 text-sm mt-6">
                    Não consegue acessar seu email?{' '}
                    <button
                        onClick={() => {
                            // TODO: Open support chat or contact form
                            alert('Entre em contato com o suporte: suporte@ativoreal.com');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                    >
                        Contate o Suporte
                    </button>
                </p>
            </div>
        </div>
    );
}
