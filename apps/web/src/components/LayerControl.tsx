/**
 * LayerControl: Painel para controlar visibilidade e opacidade de layers no mapa
 * Permite el usuário escolher quais layers aparecem e qual a transparência
 */

import React, { useState } from 'react';
import '../styles/LayerControl.css';

export interface Layer {
    id: string;
    label: string;
    color: string;
    initialVisible: boolean;
    initialOpacity: number; // 0-100
    description?: string;
}

interface LayerControlProps {
    layers: Layer[];
    onLayerChange: (layerId: string, visible: boolean, opacity: number) => void;
    compact?: boolean;
}

export const LayerControl: React.FC<LayerControlProps> = ({
    layers,
    onLayerChange,
    compact = false,
}) => {
    const [layerStates, setLayerStates] = useState<
        Record<string, { visible: boolean; opacity: number }>
    >(
        layers.reduce(
            (acc, layer) => ({
                ...acc,
                [layer.id]: { visible: layer.initialVisible, opacity: layer.initialOpacity },
            }),
            {}
        )
    );

    const [expanded, setExpanded] = useState(!compact);

    const handleVisibilityChange = (layerId: string) => {
        const newVisible = !layerStates[layerId].visible;
        const newState = { ...layerStates[layerId], visible: newVisible };
        setLayerStates({ ...layerStates, [layerId]: newState });
        onLayerChange(layerId, newVisible, newState.opacity);
    };

    const handleOpacityChange = (layerId: string, opacity: number) => {
        const newState = { ...layerStates[layerId], opacity };
        setLayerStates({ ...layerStates, [layerId]: newState });
        onLayerChange(layerId, newState.visible, opacity);
    };

    return (
        <div className={`layer-control ${compact ? 'compact' : ''}`}>
            {/* Header */}
            <div className="layer-control-header">
                <h3>🗺️ Layers</h3>
                {compact && (
                    <button
                        className="expand-toggle"
                        onClick={() => setExpanded(!expanded)}
                        aria-label={expanded ? 'Minimizar' : 'Expandir'}
                    >
                        {expanded ? '▼' : '▶'}
                    </button>
                )}
            </div>

            {/* Lista de Layers */}
            {expanded && (
                <div className="layer-list">
                    {layers.map((layer) => {
                        const state = layerStates[layer.id];
                        return (
                            <div key={layer.id} className="layer-item">
                                {/* Checkbox de Visibilidade */}
                                <label className="layer-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={state.visible}
                                        onChange={() => handleVisibilityChange(layer.id)}
                                        aria-label={`Toggle ${layer.label}`}
                                    />
                                    <span
                                        className="color-dot"
                                        style={{
                                            backgroundColor: layer.color,
                                            opacity: state.visible ? state.opacity / 100 : 0.3,
                                        }}
                                    />
                                    <span className="layer-label">{layer.label}</span>
                                </label>

                                {/* Opacity Slider */}
                                {state.visible && (
                                    <div className="opacity-control">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={state.opacity}
                                            onChange={(e) =>
                                                handleOpacityChange(layer.id, parseInt(e.target.value))
                                            }
                                            className="opacity-slider"
                                            aria-label={`Opacity for ${layer.label}`}
                                        />
                                        <span className="opacity-value">{state.opacity}%</span>
                                    </div>
                                )}

                                {/* Descrição (opcional) */}
                                {layer.description && (
                                    <p className="layer-description">{layer.description}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Botões de Atalho */}
            <div className="layer-actions">
                <button
                    className="action-btn all-visible"
                    onClick={() => {
                        const newStates = { ...layerStates };
                        layers.forEach((layer) => {
                            newStates[layer.id] = { ...newStates[layer.id], visible: true };
                            onLayerChange(layer.id, true, newStates[layer.id].opacity);
                        });
                        setLayerStates(newStates);
                    }}
                    title="Mostrar todas as layers"
                >
                    👁️ Todas
                </button>

                <button
                    className="action-btn all-hidden"
                    onClick={() => {
                        const newStates = { ...layerStates };
                        layers.forEach((layer) => {
                            newStates[layer.id] = { ...newStates[layer.id], visible: false };
                            onLayerChange(layer.id, false, newStates[layer.id].opacity);
                        });
                        setLayerStates(newStates);
                    }}
                    title="Esconder todas as layers"
                >
                    👁️‍🗨️ Nenhuma
                </button>

                <button
                    className="action-btn reset"
                    onClick={() => {
                        const newStates = { ...layerStates };
                        layers.forEach((layer) => {
                            newStates[layer.id] = {
                                visible: layer.initialVisible,
                                opacity: layer.initialOpacity,
                            };
                            onLayerChange(layer.id, layer.initialVisible, layer.initialOpacity);
                        });
                        setLayerStates(newStates);
                    }}
                    title="Restaurar padrão"
                >
                    ↺ Padrão
                </button>
            </div>
        </div>
    );
};

export default LayerControl;
