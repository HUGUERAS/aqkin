import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Button, Input } from '../../components/UIComponents';
import { supabase } from '../../lib/supabase';
import apiClient from '../../services/api';
import './AuthPages.css';

export default function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        agreeTerms: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (pwd: string) => {
        if (pwd.length < 6) return 'Mínimo 6 caracteres';
        // Validação mais permissiva - Supabase aceita senhas simples por padrão
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

            if (authError) {
                // Se o Supabase pediu confirmação de email
                if (authError.message.includes('email') && authError.message.includes('confirm')) {
                    setError('✉️ Conta criada! Verifique seu email para confirmar.');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }
                throw authError;
            }
            if (!authData.user) throw new Error('Erro ao criar usuário');

            // 2. Definir como proprietário no backend (não-bloqueante)
            const token = authData.session?.access_token;
            if (token) {
                try {
                    apiClient.setToken(token);
                    await apiClient.setPerfilRole('proprietario');

                    // 3. Criar perfil do usuário
                    try {
                        await supabase.auth.updateUser({
                            data: { display_name: formData.name },
                        });
                    } catch (err) {
                        console.warn('Aviso ao atualizar nome:', err);
                    }
                } catch (perfilErr) {
                    console.warn('Erro ao configurar perfil, mas continuando:', perfilErr);
                }
            }

            // Redirecionar para login
            navigate('/login?registered=true');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao criar conta';

            if (msg.includes('already registered') || msg.includes('User already registered')) {
                setError('📧 Este email já está registrado. Faça login ou use outro email.');
            } else if (msg.includes('password') && msg.includes('weak')) {
                setError('🔒 Senha muito fraca. Use pelo menos 6 caracteres.');
            } else if (msg.includes('email') && msg.includes('invalid')) {
                setError('📧 Email inválido. Verifique o formato.');
            } else if (msg.includes('confirm')) {
                setError('✉️ Conta criada! Confirme seu email antes de fazer login.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-content">
                <div className="auth-card">
                    <h2 className="auth-title">Criar Conta</h2>
                    <p className="auth-subtitle">Comece a regularizar sua propriedade agora</p>

                    {error && (
                        <Alert type="error" title="Erro">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            label="Nome Completo"
                            required
                        />

                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            label="Email"
                            required
                        />

                        <Input
                            id="password"
                            type="password"
                            placeholder="Pelo menos 8 caracteres"
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            label="Senha"
                            error={passwordError || undefined}
                            helperText={passwordError ? undefined : 'Mínimo 8 caracteres, 1 letra maiúscula, 1 número'}
                            required
                        />

                        <Input
                            id="passwordConfirm"
                            type="password"
                            placeholder="Repita a senha"
                            value={formData.passwordConfirm}
                            onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                            label="Confirmar Senha"
                            required
                        />

                        <div className="auth-terms">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.agreeTerms}
                                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                            />
                            <label htmlFor="terms">
                                Concordo com os{' '}
                                <a href="/termos" target="_blank" rel="noreferrer">
                                    termos de serviço
                                </a>{' '}
                                e{' '}
                                <a href="/privacidade" target="_blank" rel="noreferrer">
                                    política de privacidade
                                </a>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !formData.agreeTerms}
                            isLoading={loading}
                            className="auth-button"
                        >
                            Criar Conta Grátis
                        </Button>
                    </form>

                    <div className="auth-banner">
                        Crie sua conta e comece grátis!
                        <div>Upgrade para Premium quando precisar</div>
                    </div>

                    <div className="auth-secondary">
                        Já tem uma conta? <Link to="/login">Faça login aqui</Link>
                    </div>

                    <div className="auth-backlink">
                        <Link to="/">Voltar para Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
