import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import apiClient from '../../services/api';

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

            // 2. Definir como proprietário no backend
            const token = authData.session?.access_token;
            if (token) {
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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                width: '100%',
                maxWidth: '480px'
            }}>
                <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.8rem', color: '#1a202c' }}>
                    <span role="img" aria-label="Adicionar">➕</span> Criar Conta
                </h2>
                <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#718096', fontSize: '0.95rem' }}>
                    Comece a regularizar sua propriedade agora
                </p>

                {error && (
                    <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d3748' }}>
                            Nome Completo
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d3748' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d3748' }}>
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Pelo menos 8 caracteres"
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: passwordError ? '1px solid #f56565' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                            required
                        />
                        {passwordError && (
                            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#e53e3e' }}>{passwordError}</p>
                        )}
                        {!passwordError && (
                            <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#718096', lineHeight: '1.4' }}>
                                • Mínimo 8 caracteres • 1 letra maiúscula • 1 número
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="passwordConfirm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d3748' }}>
                            Confirmar Senha
                        </label>
                        <input
                            id="passwordConfirm"
                            type="password"
                            placeholder="Repita a senha"
                            value={formData.passwordConfirm}
                            onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="terms"
                            checked={formData.agreeTerms}
                            onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                            style={{ marginTop: '0.25rem' }}
                        />
                        <label htmlFor="terms" style={{ fontSize: '0.85rem', color: '#4a5568', cursor: 'pointer', lineHeight: '1.5' }}>
                            Concordo com os{' '}
                            <a href="/termos" target="_blank" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>
                                termos de serviço
                            </a>{' '}
                            e{' '}
                            <a href="/privacidade" target="_blank" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>
                                política de privacidade
                            </a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.agreeTerms}
                        style={{
                            padding: '1rem',
                            background: (loading || !formData.agreeTerms) ? '#3b3b3b' : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: (loading || !formData.agreeTerms) ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {loading ? (
                            <>
                                <span role="img" aria-label="Carregando">⏳</span> Criando conta...
                            </>
                        ) : (
                            <>
                                <span role="img" aria-label="Foguete">🚀</span> Criar Conta Grátis
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef6e7', border: '1px solid #f6d365', borderRadius: '8px', fontSize: '0.85rem', color: '#744210', textAlign: 'center' }}>
                    <span role="img" aria-label="Estrela">⭐</span> Crie sua conta e comece grátis!<br />
                    <span style={{ fontSize: '0.8rem' }}>Upgrade para Premium quando precisar</span>
                </div>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                    Já tem uma conta?{' '}
                    <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
                        Faça login aqui
                    </a>
                </p>

                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <a href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Voltar para Home
                    </a>
                </p>
            </div>
        </div>
    );
}
