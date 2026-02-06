/**
 * CADToolbar - Professional CAD Toolbar for Topographer
 *
 * Rich set of CAD tools for surveying and property boundary management
 */

import { useState, useCallback } from 'react';
import './CADToolbar.css';

export type CADToolType =
    | 'select'
    | 'pan'
    | 'measure-distance'
    | 'measure-area'
    | 'measure-angle'
    | 'draw-point'
    | 'draw-line'
    | 'draw-polygon'
    | 'draw-circle'
    | 'draw-rectangle'
    | 'edit-vertex'
    | 'snap'
    | 'split'
    | 'merge'
    | 'buffer'
    | 'undo'
    | 'redo'
    | 'delete'
    | 'layers'
    | 'settings';

interface ToolConfig {
    id: CADToolType;
    icon: string;
    label: string;
    shortcut?: string;
    group: 'navigation' | 'measure' | 'draw' | 'edit' | 'actions' | 'view';
    tooltip: string;
}

const TOOLS: ToolConfig[] = [
    // Navigation Tools
    { id: 'select', icon: '↖', label: 'Selecionar', shortcut: 'V', group: 'navigation', tooltip: 'Selecionar elementos (V)' },
    { id: 'pan', icon: '✋', label: 'Pan', shortcut: 'H', group: 'navigation', tooltip: 'Mover visualização (H)' },

    // Measurement Tools
    { id: 'measure-distance', icon: '📏', label: 'Distância', shortcut: 'D', group: 'measure', tooltip: 'Medir distância (D)' },
    { id: 'measure-area', icon: '⬛', label: 'Área', shortcut: 'A', group: 'measure', tooltip: 'Calcular área (A)' },
    { id: 'measure-angle', icon: '📐', label: 'Ângulo', shortcut: 'G', group: 'measure', tooltip: 'Medir ângulo (G)' },

    // Drawing Tools
    { id: 'draw-point', icon: '●', label: 'Ponto', shortcut: 'P', group: 'draw', tooltip: 'Inserir ponto (P)' },
    { id: 'draw-line', icon: '╱', label: 'Linha', shortcut: 'L', group: 'draw', tooltip: 'Desenhar linha (L)' },
    { id: 'draw-polygon', icon: '⬠', label: 'Polígono', shortcut: 'O', group: 'draw', tooltip: 'Desenhar polígono (O)' },
    { id: 'draw-circle', icon: '○', label: 'Círculo', shortcut: 'C', group: 'draw', tooltip: 'Desenhar círculo (C)' },
    { id: 'draw-rectangle', icon: '▢', label: 'Retângulo', shortcut: 'R', group: 'draw', tooltip: 'Desenhar retângulo (R)' },

    // Edit Tools
    { id: 'edit-vertex', icon: '◇', label: 'Vértices', shortcut: 'E', group: 'edit', tooltip: 'Editar vértices (E)' },
    { id: 'snap', icon: '🧲', label: 'Snap', shortcut: 'S', group: 'edit', tooltip: 'Ativar snap 0.5m (S)' },
    { id: 'split', icon: '✂', label: 'Dividir', group: 'edit', tooltip: 'Dividir geometria' },
    { id: 'merge', icon: '⊕', label: 'Mesclar', group: 'edit', tooltip: 'Mesclar geometrias' },
    { id: 'buffer', icon: '◎', label: 'Buffer', group: 'edit', tooltip: 'Criar buffer' },

    // Action Tools
    { id: 'undo', icon: '↩', label: 'Desfazer', shortcut: 'Ctrl+Z', group: 'actions', tooltip: 'Desfazer (Ctrl+Z)' },
    { id: 'redo', icon: '↪', label: 'Refazer', shortcut: 'Ctrl+Y', group: 'actions', tooltip: 'Refazer (Ctrl+Y)' },
    { id: 'delete', icon: '🗑', label: 'Excluir', shortcut: 'Del', group: 'actions', tooltip: 'Excluir seleção (Del)' },

    // View Tools
    { id: 'layers', icon: '☰', label: 'Layers', group: 'view', tooltip: 'Gerenciar camadas' },
    { id: 'settings', icon: '⚙', label: 'Config', group: 'view', tooltip: 'Configurações do mapa' },
];

interface CADToolbarProps {
    activeTool: CADToolType | null;
    onToolSelect: (tool: CADToolType) => void;
    snapEnabled?: boolean;
    onSnapToggle?: () => void;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    measurements?: {
        distance?: number | null;
        area?: number | null;
        angle?: number | null;
    };
}

export function CADToolbar({
    activeTool,
    onToolSelect,
    snapEnabled = false,
    onSnapToggle,
    orientation = 'vertical',
    className = '',
    measurements,
}: CADToolbarProps) {
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [showMeasurements, setShowMeasurements] = useState(true);

    const handleToolClick = useCallback(
        (toolId: CADToolType) => {
            if (toolId === 'snap' && onSnapToggle) {
                onSnapToggle();
            } else {
                onToolSelect(toolId);
            }
        },
        [onToolSelect, onSnapToggle]
    );

    const groupedTools = TOOLS.reduce(
        (acc, tool) => {
            if (!acc[tool.group]) acc[tool.group] = [];
            acc[tool.group].push(tool);
            return acc;
        },
        {} as Record<string, ToolConfig[]>
    );

    const groupLabels: Record<string, string> = {
        navigation: 'Navegação',
        measure: 'Medição',
        draw: 'Desenho',
        edit: 'Edição',
        actions: 'Ações',
        view: 'Visualização',
    };

    const formatMeasurement = (value: number | null | undefined, type: 'distance' | 'area' | 'angle') => {
        if (value === null || value === undefined) return '--';

        if (type === 'distance') {
            if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
            return `${value.toFixed(2)} m`;
        }

        if (type === 'area') {
            if (value >= 10000) return `${(value / 10000).toFixed(2)} ha`;
            return `${value.toFixed(2)} m²`;
        }

        if (type === 'angle') {
            return `${value.toFixed(1)}°`;
        }

        return String(value);
    };

    return (
        <div className={`cad-toolbar ${orientation} ${className}`}>
            {/* CAD Logo */}
            <div className="cad-toolbar-header">
                <span className="cad-logo">CAD</span>
                <span className="cad-version">Pro</span>
            </div>

            {/* Tool Groups */}
            <div className="cad-toolbar-groups">
                {Object.entries(groupedTools).map(([group, tools]) => (
                    <div key={group} className="cad-tool-group">
                        <div
                            className="cad-group-header"
                            onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                        >
                            <span className="cad-group-label">{groupLabels[group]}</span>
                            <span className="cad-group-toggle">{expandedGroup === group ? '▼' : '▶'}</span>
                        </div>

                        <div className={`cad-group-tools ${expandedGroup === group || expandedGroup === null ? 'expanded' : ''}`}>
                            {tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    className={`cad-tool-button ${activeTool === tool.id ? 'active' : ''} ${tool.id === 'snap' && snapEnabled ? 'snap-active' : ''}`}
                                    onClick={() => handleToolClick(tool.id)}
                                    title={tool.tooltip}
                                    aria-label={tool.label}
                                >
                                    <span className="cad-tool-icon">{tool.icon}</span>
                                    <span className="cad-tool-label">{tool.label}</span>
                                    {tool.shortcut && <span className="cad-tool-shortcut">{tool.shortcut}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Measurements Panel */}
            {measurements && (
                <div className="cad-measurements-panel">
                    <div
                        className="cad-measurements-header"
                        onClick={() => setShowMeasurements(!showMeasurements)}
                    >
                        <span>📊 Medições</span>
                        <span className="cad-toggle">{showMeasurements ? '▼' : '▶'}</span>
                    </div>

                    {showMeasurements && (
                        <div className="cad-measurements-body">
                            <div className="cad-measurement-item">
                                <span className="cad-measurement-label">Distância:</span>
                                <span className="cad-measurement-value">
                                    {formatMeasurement(measurements.distance, 'distance')}
                                </span>
                            </div>
                            <div className="cad-measurement-item">
                                <span className="cad-measurement-label">Área:</span>
                                <span className="cad-measurement-value">
                                    {formatMeasurement(measurements.area, 'area')}
                                </span>
                            </div>
                            <div className="cad-measurement-item">
                                <span className="cad-measurement-label">Ângulo:</span>
                                <span className="cad-measurement-value">
                                    {formatMeasurement(measurements.angle, 'angle')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Status Bar */}
            <div className="cad-status-bar">
                <div className="cad-status-item">
                    <span className={`cad-status-indicator ${snapEnabled ? 'active' : ''}`} />
                    <span>SNAP</span>
                </div>
                <div className="cad-status-item">
                    <span className="cad-status-indicator active" />
                    <span>ORTHO</span>
                </div>
                <div className="cad-status-item">
                    <span className="cad-status-indicator" />
                    <span>GRID</span>
                </div>
            </div>

            {/* Coordinates Display */}
            <div className="cad-coordinates">
                <span className="cad-coord-label">COORD:</span>
                <span className="cad-coord-value">--°, --°</span>
            </div>
        </div>
    );
}

export default CADToolbar;
