import React from 'react';
import Icon from './Icon';
import '../styles/map-focused-layout.css';

interface FloatingToolbarProps {
    onDraw?: () => void;
    onMeasure?: () => void;
    onValidate?: () => void;
    onSnapTool?: () => void;
    onEditGeometry?: () => void;
    activeMode?: 'draw' | 'measure' | 'validate' | null;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
    onDraw,
    onMeasure,
    onValidate,
    onSnapTool,
    onEditGeometry,
    activeMode,
}) => {
    return (
        <div className="floating-toolbar">
            {/* Draw Mode */}
            <button
                className={`toolbar-btn draw ${activeMode === 'draw' ? 'active' : ''}`}
                onClick={onDraw}
                title="Desenhar (D)"
                aria-label="Draw on map"
            >
                <Icon name="edit-3" size="sm" />
            </button>

            {/* Measure Mode */}
            <button
                className={`toolbar-btn measure ${activeMode === 'measure' ? 'active' : ''}`}
                onClick={onMeasure}
                title="Medir (M)"
                aria-label="Measure distance"
            >
                <Icon name="ruler" size="sm" />
            </button>

            {/* Validate */}
            <button
                className={`toolbar-btn validate ${activeMode === 'validate' ? 'active' : ''}`}
                onClick={onValidate}
                title="Validar"
                aria-label="Validate geometry"
            >
                <Icon name="check-2" size="sm" />
            </button>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />

            {/* Snap Tool */}
            <button
                className="toolbar-btn"
                onClick={onSnapTool}
                title="Snap Tool"
                aria-label="Toggle snap grid"
            >
                <Icon name="grid" size="sm" />
            </button>

            {/* Edit Geometry */}
            <button
                className="toolbar-btn"
                onClick={onEditGeometry}
                title="Editar Vértices"
                aria-label="Edit vertices"
            >
                <Icon name="move" size="sm" />
            </button>
        </div>
    );
};

export default FloatingToolbar;
