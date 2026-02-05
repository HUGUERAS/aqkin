/**
 * Sign Up Page
 * User registration for new accounts
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import apiClient from '../../services/api';
import { Alert, Button, Input } from '../../components/UIComponents';
import Logo from '../../components/Logo';

export default function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'cliente' as 'cliente' | 'topografo',
        agreeTerms: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return 'Mínimo 8 caracteres';
        if (!/[A-Z]/.test(pwd)) return 'Deve conter uma letra maiúscula';
        if (!/[0-9]/.test(pwd)) return 'Deve conter um número';
        return '';
    };

    const handlePasswordChange = (value: string) => {
        setFormData({ ...formData, password: value });
        const err = validatePassword(value);
        setPasswordError(err);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações
        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            setError('As senhas não correspondem');
            return;
        }

        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (!formData.agreeTerms) {
            setError('Você deve aceitar os termos de serviço');
            return;
        }

        setLoading(true);

        try {
            // 1. Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Erro ao criar usuário');

            // 2. Definir role no backend
            const token = authData.session?.access_token;
            if (token) {
                apiClient.setToken(token);
                const roleApi = formData.role === 'topografo' ? 'topografo' : 'proprietario';

                await apiClient.setPerfilRole(roleApi);

                // 3. Criar perfil do usuário (nome, etc)
                try {
                    await supabase.auth.updateUser({
                        data: { display_name: formData.name },
                    });
                } catch (err) {
                    console.warn('Aviso ao atualizar nome:', err);
                }
            }

            // Redirecionar para login ou confirmação
            navigate('/login?registered=true');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao criar conta';

            // Mensagens mais amigáveis
            if (msg.includes('already registered')) {
                setError('Este email já está registrado. Faça login ou use outro email.');
            } else if (msg.includes('password')) {
                setError('Senha não atende aos requisitos de segurança');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo size="lg" variant="icon" />
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Criar Conta
                    </h1>
                    <p className="text-gray-600 text-center mb-6">
                        Junte-se a AtivoReal hoje mesmo
                    </p>

                    {error && (
                        <Alert type="error" title="Erro">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <Input
                            label="Nome Completo"
                            type="text"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            icon="user"
                        />

                        {/* Email */}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            icon="envelope"
                        />

                        {/* Tipo de Acesso */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tipo de Acesso
                            </label>
                            <div className="space-y-2">
                                {[
                                    { value: 'cliente', label: '🏠 Proprietário', desc: 'Desenhar e gerenciar suas áreas' },
                                    { value: 'topografo', label: '🗺️ Topógrafo', desc: 'Validar e criar projetos' },
                                ].map((option) => (
                                    <label key={option.value} className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={option.value}
                                            checked={formData.role === option.value}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                            className="mt-1"
                                        />
                                        <div className="ml-3">
                                            <p className="font-semibold text-gray-900">{option.label}</p>
                                            <p className="text-sm text-gray-600">{option.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Senha */}
                        <Input
                            label="Senha"
                            type="password"
                            placeholder="Pelo menos 8 caracteres"
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            required
                            error={passwordError}
                            helperText={!passwordError ? '• Mínimo 8 caracteres\n• 1 letra maiúscula\n• 1 número' : ''}
                            icon="lock"
                        />

                        {/* Confirmar Senha */}
                        <Input
                            label="Confirmar Senha"
                            type="password"
                            placeholder="Repita a senha"
                            value={formData.passwordConfirm}
                            onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                            required
                            icon="lock"
                        />

                        {/* Termos */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.agreeTerms}
                                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                className="mt-1"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                                Concordo com os{' '}
                                <button
                                    type="button"
                                    onClick={() => window.open('/termos', '_blank')}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                    termos de serviço
                                </button>{' '}
                                e{' '}
                                <button
                                    type="button"
                                    onClick={() => window.open('/privacidade', '_blank')}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                    política de privacidade
                                </button>
                            </label>
                        </div>

                        {/* Botão */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={loading || !formData.agreeTerms}
                            isLoading={loading}
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </Button>
                    </form>

                    {/* Link Login */}
                    <p className="text-center text-gray-600 text-sm mt-6">
                        Já tem uma conta?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                            Faça login aqui
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
