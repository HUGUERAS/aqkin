/**
 * Enhanced Dashboard Component with Charts
 * Shows project metrics, statistics, and analytics
 */

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardBody, CardFooter, Badge, Alert } from '../../components/UIComponents';
import Icon from '../../components/Icon';
import apiClient from '../../services/api';

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
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Acompanhe seus projetos e métricas em tempo real</p>
            </div>

            {/* Alert - Status Overview */}
            {projects.length === 0 && (
                <Alert type="info" title="Bem-vindo!">
                    Crie seu primeiro projeto para começar a trabalhar com geolocalização e desenhos técnicos.
                </Alert>
            )}

            {/* Stats Cards - 4 Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: 'grid', label: 'Projetos', value: stats.totalProjetos, color: 'blue' },
                    { icon: 'map-pin', label: 'Lotes', value: stats.totalLotes, color: 'green' },
                    { icon: 'check', label: 'Completos', value: stats.concluidROS, color: 'emerald' },
                    { icon: 'alert', label: 'Pendentes', value: stats.pendentes, color: 'yellow' },
                ].map((stat, idx) => (
                    <Card key={idx} className="flex flex-col items-start">
                        <div className="flex items-center justify-between w-full mb-4">
                            <h3 className="text-gray-600 font-semibold text-sm">{stat.label}</h3>
                            <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                                <Icon name={stat.icon as any} size="lg" color={stat.color as any} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Charts Section - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Bar Chart - Projects Trend */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900">Projetos por Mês</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockMetrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Bar dataKey="projects" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                {/* Pie Chart - Status Distribution */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900">Distribuição por Status</h2>
                    </CardHeader>
                    <CardBody className="flex justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={mockStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#3b82f6"
                                    dataKey="value"
                                >
                                    {mockStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip /> </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Line Chart - Progress Over Time */}
            <Card className="mb-8">
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">Progresso - Últimos 6 Meses</h2>
                </CardHeader>
                <CardBody>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={mockMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="lotes"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
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
                </CardBody>
            </Card>

            {/* Recent Projects Table */}
            {projects.length > 0 && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900">Projetos Recentes</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200">
                                    <tr className="text-left text-sm font-semibold text-gray-600">
                                        <th className="pb-3 px-2">Nome</th>
                                        <th className="pb-3 px-2">Status</th>
                                        <th className="pb-3 px-2">Criado</th>
                                        <th className="pb-3 px-2">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {projects.slice(0, 5).map((project, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-2 font-medium text-gray-900">{project.nome}</td>
                                            <td className="py-3 px-2">
                                                <Badge
                                                    variant={
                                                        project.status === 'CONCLUIDO'
                                                            ? 'success'
                                                            : project.status === 'RASCUNHO'
                                                                ? 'default'
                                                                : 'info'
                                                    }
                                                >
                                                    {project.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-gray-600 text-sm">
                                                {new Date(project.criado_em).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="py-3 px-2">
                                                <button className="text-blue-600 hover:text-blue-800 transition-colors font-semibold text-sm">
                                                    Ver →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center gap-2">
                            <Icon name="plus" size="md" />
                            Ver Todos os Projetos
                        </button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
