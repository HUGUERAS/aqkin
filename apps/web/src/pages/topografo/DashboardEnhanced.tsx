/**
 * Enhanced Dashboard Component with Charts
 * Shows project metrics, statistics, and analytics
 */

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge, Alert } from '../../components/UIComponents';
import Icon from '../../components/Icon';
import apiClient from '../../services/api';
import '../../styles/TopografoPro.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const mockMetrics = [
    { name: 'Jan', projects: 4, lotes: 24, completos: 2 },
    { name: 'Feb', projects: 3, lotes: 13, completos: 9 },
    { name: 'Mar', projects: 2, lotes: 9, completos: 5 },
    { name: 'Apr', projects: 5, lotes: 39, completos: 4 },
    { name: 'May', projects: 4, lotes: 23, completos: 6 },
    { name: 'Jun', projects: 7, lotes: 31, completos: 8 },
];

const mockStatusData = [
    { name: 'Rascunho', value: 45 },
    { name: 'Em Andamento', value: 32 },
    { name: 'Pendente', value: 18 },
    { name: 'Completo', value: 25 },
];

export default function DashboardEnhanced() {
    const [_loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalProjetos: 0,
        totalLotes: 0,
        concluidROS: 0,
        pendentes: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(false);
        try {
            const response = await apiClient.getProjects();
            if (Array.isArray(response.data)) {
                setProjects(response.data);
                // Calculate stats from projects
                setStats({
                    totalProjetos: response.data.length,
                    totalLotes: response.data.reduce((acc: number, p: any) => acc + (p.lotes_count || 0), 0),
                    concluidROS: response.data.filter((p: any) => p.status === 'CONCLUIDO').length,
                    pendentes: response.data.filter((p: any) => p.status === 'EM_ANDAMENTO').length,
                });
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    return (
        <div className="topografo-page">
            {/* Page Header */}
            <div className="topografo-page-header">
                <div className="topografo-page-header-left">
                    <span className="topografo-page-icon">📊</span>
                    <div className="topografo-page-title">
                        <h1>Dashboard</h1>
                        <p>Acompanhe seus projetos e métricas em tempo real</p>
                    </div>
                </div>
            </div>

            {/* Alert - Status Overview */}
            {projects.length === 0 && (
                <div className="pro-alert pro-alert-info">
                    <span className="pro-alert-icon">💡</span>
                    <div className="pro-alert-content">
                        <div className="pro-alert-title">Bem-vindo!</div>
                        <div className="pro-alert-text">Crie seu primeiro projeto para começar a trabalhar com geolocalização e desenhos técnicos.</div>
                    </div>
                </div>
            )}

            {/* Stats Cards - 4 Column Grid */}
            <div className="pro-stats-grid">
                {[
                    { icon: '📁', label: 'Projetos', value: stats.totalProjetos, color: 'blue' },
                    { icon: '📍', label: 'Lotes', value: stats.totalLotes, color: 'green' },
                    { icon: '✅', label: 'Completos', value: stats.concluidROS, color: 'purple' },
                    { icon: '⏳', label: 'Pendentes', value: stats.pendentes, color: 'yellow' },
                ].map((stat, idx) => (
                    <div key={idx} className="pro-stat-card">
                        <div className="pro-stat-header">
                            <span className="pro-stat-label">{stat.label}</span>
                            <div className={`pro-stat-icon ${stat.color}`}>
                                <span>{stat.icon}</span>
                            </div>
                        </div>
                        <div className="pro-stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section - 2 Column Layout */}
            <div className="pro-grid-2" style={{ marginBottom: '24px' }}>
                {/* Bar Chart - Projects Trend */}
                <div className="pro-card">
                    <div className="pro-card-header">
                        <h2><span className="icon">📈</span> Projetos por Mês</h2>
                    </div>
                    <div className="pro-card-body pro-chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockMetrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                    }}
                                />
                                <Bar dataKey="projects" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart - Status Distribution */}
                <div className="pro-card">
                    <div className="pro-card-header">
                        <h2><span className="icon">🥧</span> Distribuição por Status</h2>
                    </div>
                    <div className="pro-card-body pro-chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={mockStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#6366f1"
                                    dataKey="value"
                                >
                                    {mockStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Line Chart - Progress Over Time */}
            <div className="pro-card" style={{ marginBottom: '24px' }}>
                <div className="pro-card-header">
                    <h2><span className="icon">📉</span> Progresso - Últimos 6 Meses</h2>
                </div>
                <div className="pro-card-body pro-chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={mockMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#e2e8f0',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="lotes"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ fill: '#6366f1', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="completos"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Projects Table */}
            {projects.length > 0 && (
                <div className="pro-card">
                    <div className="pro-card-header">
                        <h2><span className="icon">📋</span> Projetos Recentes</h2>
                    </div>
                    <div className="pro-card-body" style={{ padding: 0 }}>
                        <div className="pro-table-container">
                            <table className="pro-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Status</th>
                                        <th>Criado</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.slice(0, 5).map((project, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 500 }}>{project.nome}</td>
                                            <td>
                                                <span className={`pro-badge ${project.status === 'CONCLUIDO' ? 'pro-badge-success' : project.status === 'RASCUNHO' ? 'pro-badge-info' : 'pro-badge-warning'}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td style={{ color: '#94a3b8' }}>
                                                {new Date(project.criado_em).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td>
                                                <button className="pro-btn pro-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                                    Ver →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="pro-card-footer">
                        <button className="pro-btn pro-btn-primary">
                            <Icon name="plus" size="md" />
                            Ver Todos os Projetos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
