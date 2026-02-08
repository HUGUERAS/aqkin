import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientToken } from '../../hooks/useClientToken';
import { validateCPF, formatCPF, formatPhone } from '../../utils/validators';
import apiClient from '../../services/api';

export default function DadosPessoais() {
  const { token, loteId, loteData, loading: tokenLoading, error: tokenError } = useClientToken();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome_cliente: '',
    cpf_cnpj_cliente: '',
    rg_cliente: '',
    telefone_cliente: '',
    email_cliente: '',
    endereco_cliente: '',
    estado_civil: '',
    nacionalidade: 'Brasileira',
    profissao: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pre-fill from lote data if available
  useState(() => {
    if (loteData) {
      setForm((prev) => ({
        ...prev,
        nome_cliente: String(loteData.nome_cliente || prev.nome_cliente),
        email_cliente: String(loteData.email_cliente || prev.email_cliente),
        telefone_cliente: String(loteData.telefone_cliente || prev.telefone_cliente),
        cpf_cnpj_cliente: String(loteData.cpf_cnpj_cliente || prev.cpf_cnpj_cliente),
      }));
    }
  });

  const handleChange = (field: string, value: string) => {
    let formatted = value;
    if (field === 'cpf_cnpj_cliente') formatted = formatCPF(value);
    if (field === 'telefone_cliente') formatted = formatPhone(value);

    setForm((prev) => ({ ...prev, [field]: formatted }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nome_cliente.trim()) newErrors.nome_cliente = 'Nome obrigatorio';
    if (!form.cpf_cnpj_cliente.trim()) {
      newErrors.cpf_cnpj_cliente = 'CPF obrigatorio';
    } else if (!validateCPF(form.cpf_cnpj_cliente)) {
      newErrors.cpf_cnpj_cliente = 'CPF invalido';
    }
    if (!form.telefone_cliente.trim()) {
      newErrors.telefone_cliente = 'Telefone obrigatorio';
    } else if (form.telefone_cliente.replace(/\D/g, '').length < 10) {
      newErrors.telefone_cliente = 'Telefone invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteId || !validate()) return;

    setSaving(true);
    const result = await apiClient.saveIntake(loteId, form);

    if (result.error) {
      setErrors({ _form: result.error });
    } else {
      setSaved(true);
      setTimeout(() => {
        const qs = token ? `?token=${token}` : `?lote=${loteId}`;
        navigate(`/cliente/desenhar${qs}`);
      }, 1500);
    }
    setSaving(false);
  };

  if (tokenLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        color: '#e5e7eb',
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (tokenError || !loteId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        color: '#ef4444',
        padding: '2rem',
      }}>
        <p>{tokenError || 'Lote nao encontrado'}</p>
      </div>
    );
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${errors[field] ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.25)'}`,
    borderRadius: '8px',
    fontSize: '1rem',
    background: '#0b1220',
    color: '#e5e7eb',
    outline: 'none',
  });

  return (
    <div style={{
      padding: '1.5rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
      color: '#e5e7eb',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'rgba(15, 23, 42, 0.92)',
        borderRadius: '14px',
        padding: '1.5rem',
        border: '1px solid rgba(59, 130, 246, 0.25)',
      }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Dados Pessoais
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Preencha seus dados para o processo de regularizacao.
        </p>

        {saved && (
          <div style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            marginBottom: '1rem',
            textAlign: 'center',
            fontWeight: 600,
          }}>
            Dados salvos com sucesso! Redirecionando...
          </div>
        )}

        {errors._form && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            color: '#ef4444',
            marginBottom: '1rem',
          }}>
            {errors._form}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              value={form.nome_cliente}
              onChange={(e) => handleChange('nome_cliente', e.target.value)}
              style={inputStyle('nome_cliente')}
              placeholder="Seu nome completo"
            />
            {errors.nome_cliente && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{errors.nome_cliente}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                CPF *
              </label>
              <input
                type="text"
                value={form.cpf_cnpj_cliente}
                onChange={(e) => handleChange('cpf_cnpj_cliente', e.target.value)}
                style={inputStyle('cpf_cnpj_cliente')}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
              {errors.cpf_cnpj_cliente && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{errors.cpf_cnpj_cliente}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                RG
              </label>
              <input
                type="text"
                value={form.rg_cliente}
                onChange={(e) => handleChange('rg_cliente', e.target.value)}
                style={inputStyle('rg_cliente')}
                placeholder="Numero do RG"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Telefone *
              </label>
              <input
                type="tel"
                value={form.telefone_cliente}
                onChange={(e) => handleChange('telefone_cliente', e.target.value)}
                style={inputStyle('telefone_cliente')}
                placeholder="(00) 00000-0000"
                inputMode="tel"
              />
              {errors.telefone_cliente && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{errors.telefone_cliente}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email_cliente}
                onChange={(e) => handleChange('email_cliente', e.target.value)}
                style={inputStyle('email_cliente')}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Endereco
            </label>
            <input
              type="text"
              value={form.endereco_cliente}
              onChange={(e) => handleChange('endereco_cliente', e.target.value)}
              style={inputStyle('endereco_cliente')}
              placeholder="Rua, numero, bairro, cidade"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Estado Civil
              </label>
              <select
                value={form.estado_civil}
                onChange={(e) => handleChange('estado_civil', e.target.value)}
                style={inputStyle('estado_civil')}
              >
                <option value="">Selecione</option>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viuvo(a)">Viuvo(a)</option>
                <option value="Uniao Estavel">Uniao Estavel</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Nacionalidade
              </label>
              <input
                type="text"
                value={form.nacionalidade}
                onChange={(e) => handleChange('nacionalidade', e.target.value)}
                style={inputStyle('nacionalidade')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Profissao
              </label>
              <input
                type="text"
                value={form.profissao}
                onChange={(e) => handleChange('profissao', e.target.value)}
                style={inputStyle('profissao')}
                placeholder="Sua profissao"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            style={{
              width: '100%',
              padding: '1rem',
              background: saving || saved ? '#3a3a3a' : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: saving || saved ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Dados'}
          </button>
        </form>
      </div>
    </div>
  );
}
