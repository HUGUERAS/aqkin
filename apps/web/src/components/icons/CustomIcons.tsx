/**
 * Custom SVG Icons for AtivoReal
 * Ícones personalizados para o sistema de gestão de terrenos
 */

import React from 'react';

interface IconProps {
    size?: number;
    color?: string;
    className?: string;
}

/**
 * Ícone de Terreno/Lote - Polígono com marcadores
 */
export const TerrainIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Polígono do terreno */}
        <path
            d="M4 8L8 4L16 6L20 10L18 18L10 20L4 16V8Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        {/* Marcadores nos vértices */}
        <circle cx="4" cy="8" r="2" fill={color} />
        <circle cx="8" cy="4" r="2" fill={color} />
        <circle cx="16" cy="6" r="2" fill={color} />
        <circle cx="20" cy="10" r="2" fill={color} />
        <circle cx="18" cy="18" r="2" fill={color} />
        <circle cx="10" cy="20" r="2" fill={color} />
        <circle cx="4" cy="16" r="2" fill={color} />
    </svg>
);

/**
 * Ícone de Medição - Régua com metros
 */
export const MeasureIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Régua diagonal */}
        <path
            d="M3 21L21 3"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        {/* Marcações */}
        <path d="M6 18L8 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 15L11 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12L14 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 9L17 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {/* Pontas com setas */}
        <path d="M3 21L3 17M3 21L7 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M21 3L17 3M21 3L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Topógrafo - Pessoa com teodolito
 */
export const SurveyorIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Cabeça */}
        <circle cx="12" cy="5" r="3" stroke={color} strokeWidth="2" />
        {/* Corpo */}
        <path
            d="M12 8V14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        {/* Braços segurando equipamento */}
        <path
            d="M8 10L12 12L16 10"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Pernas */}
        <path d="M12 14L8 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 14L16 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Teodolito/Tripé */}
        <path d="M16 10L20 8L18 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="9" r="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
);

/**
 * Ícone de Documento Legal - Papel com selo
 */
export const LegalDocIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Documento */}
        <path
            d="M6 2H14L18 6V22H6V2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Dobra do canto */}
        <path
            d="M14 2V6H18"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Linhas de texto */}
        <path d="M9 10H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 13H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {/* Selo/Carimbo */}
        <circle cx="12" cy="18" r="2" stroke={color} strokeWidth="1.5" />
        <path d="M12 16V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Área/Metros Quadrados
 */
export const AreaIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Quadrado principal */}
        <rect
            x="4"
            y="4"
            width="16"
            height="16"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        {/* Grid interno */}
        <path d="M4 12H20" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        <path d="M12 4V20" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        {/* Setas de dimensão */}
        <path d="M2 8L2 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 8L4 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 16L4 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone AtivoReal - Logo simplificado
 */
export const AtivoRealIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* A estilizado com pin de localização */}
        <path
            d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Letra A dentro */}
        <path
            d="M12 6L9 14H10.5L11 12.5H13L13.5 14H15L12 6Z"
            fill={color}
        />
        <path
            d="M11.5 11L12 8.5L12.5 11H11.5Z"
            fill="white"
        />
    </svg>
);

// Exportar todos
export default {
    TerrainIcon,
    MeasureIcon,
    SurveyorIcon,
    LegalDocIcon,
    AreaIcon,
    AtivoRealIcon,
};
/**
 * Ícone de GPS/Coordenadas
 */
export const GpsIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill={color} />
        <path d="M12 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 18V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M2 12H6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Contrato/Acordo
 */
export const ContractIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M5 3H15L19 7V21H5V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 3V7H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 11H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 14H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 17C10 17 11 18 12 18C13 18 14 17 14 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Vizinhos/Confrontantes
 */
export const NeighborsIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Casa esquerda */}
        <path d="M3 12L6 9V16H3V12Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Casa central (maior) */}
        <path d="M8 10L12 6L16 10V18H8V10Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <rect x="10" y="14" width="4" height="4" stroke={color} strokeWidth="1.5" />
        {/* Casa direita */}
        <path d="M21 12L18 9V16H21V12Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Linha de divisão */}
        <path d="M6 18H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Validação/Aprovação
 */
export const ValidationIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Orçamento/Cotação
 */
export const QuoteIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2" />
        <path d="M8 8H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 12H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15" cy="15" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M15 14V16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 15H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Memorial Descritivo
 */
export const MemorialIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M4 4H16L20 8V20H4V4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 4V8H20" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {/* Linhas numeradas */}
        <circle cx="7" cy="11" r="1" fill={color} />
        <path d="M9 11H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="14" r="1" fill={color} />
        <path d="M9 14H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="17" r="1" fill={color} />
        <path d="M9 17H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Planta/Mapa Técnico
 */
export const BlueprintIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
        {/* Polígono interno */}
        <path d="M7 10L10 7L17 9L15 15L9 17L7 10Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Cotas/medidas */}
        <path d="M7 10L10 7" stroke={color} strokeWidth="1" strokeDasharray="1 1" />
        <path d="M17 9L15 15" stroke={color} strokeWidth="1" strokeDasharray="1 1" />
        {/* Norte */}
        <path d="M19 5L21 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 3L21 3L21 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Pagamento
 */
export const PaymentIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
        <path d="M2 10H22" stroke={color} strokeWidth="2" />
        <path d="M6 15H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17" cy="15" r="2" stroke={color} strokeWidth="1.5" />
    </svg>
);

/**
 * Ícone de Upload de Documento
 */
export const UploadDocIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M6 2H14L18 6V22H6V2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 2V6H18" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 18V11" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M9 14L12 11L15 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Desenho/Sketching
 */
export const SketchIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Lápis */}
        <path d="M16 3L21 8L8 21H3V16L16 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 6L18 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Borracha */}
        <path d="M3 21H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Camadas/Layers
 */
export const LayersIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Perímetro
 */
export const PerimeterIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M4 8L8 4L16 5L20 9L18 16L12 20L6 18L4 8Z" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 2" />
        {/* Setas de direção */}
        <path d="M8 4L10 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M16 5L17 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 16L16 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// ============================================
// ÍCONES DE PROPRIEDADES
// ============================================

/**
 * Ícone de Edificação/Construção
 */
export const BuildingIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="4" width="16" height="16" rx="1" stroke={color} strokeWidth="2" />
        <rect x="8" y="8" width="3" height="3" stroke={color} strokeWidth="1.5" />
        <rect x="13" y="8" width="3" height="3" stroke={color} strokeWidth="1.5" />
        <rect x="8" y="13" width="3" height="3" stroke={color} strokeWidth="1.5" />
        <rect x="13" y="13" width="3" height="3" stroke={color} strokeWidth="1.5" />
    </svg>
);

/**
 * Ícone de Casa
 */
export const HouseIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 12L12 4L21 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10V20H19V10" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <rect x="10" y="14" width="4" height="6" stroke={color} strokeWidth="1.5" />
    </svg>
);

/**
 * Ícone de Fazenda/Rural
 */
export const FarmIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 20L6 12L10 14L14 8L18 10L21 20H3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 8V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 6H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="6" r="2" stroke={color} strokeWidth="1.5" />
    </svg>
);

/**
 * Ícone Comercial
 */
export const CommercialIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="3" y="8" width="18" height="12" rx="1" stroke={color} strokeWidth="2" />
        <path d="M3 8L12 4L21 8" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 12H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 16H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// ============================================
// ÍCONES DE EQUIPAMENTO TOPOGRÁFICO
// ============================================

/**
 * Ícone de Teodolito
 */
export const TheodoliteIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="8" r="5" stroke={color} strokeWidth="2" />
        <path d="M12 8H17" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 13V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 21L12 17L16 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="8" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Drone
 */
export const DroneIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="9" y="10" width="6" height="4" rx="1" stroke={color} strokeWidth="2" />
        <circle cx="5" cy="7" r="2" stroke={color} strokeWidth="1.5" />
        <circle cx="19" cy="7" r="2" stroke={color} strokeWidth="1.5" />
        <circle cx="5" cy="17" r="2" stroke={color} strokeWidth="1.5" />
        <circle cx="19" cy="17" r="2" stroke={color} strokeWidth="1.5" />
        <path d="M7 8L9 10" stroke={color} strokeWidth="1.5" />
        <path d="M17 8L15 10" stroke={color} strokeWidth="1.5" />
        <path d="M7 16L9 14" stroke={color} strokeWidth="1.5" />
        <path d="M17 16L15 14" stroke={color} strokeWidth="1.5" />
    </svg>
);

/**
 * Ícone de Estação Total
 */
export const StationIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="8" y="4" width="8" height="10" rx="1" stroke={color} strokeWidth="2" />
        <path d="M12 14V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M7 22L12 18L17 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="8" r="2" stroke={color} strokeWidth="1.5" />
        <path d="M6 8H8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 8H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Marco Geodésico
 */
export const BenchmarkIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 3L15 9H9L12 3Z" fill={color} />
        <rect x="10" y="9" width="4" height="8" stroke={color} strokeWidth="2" />
        <path d="M6 20H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 17H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Elevação/Altitude
 */
export const ElevationIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 20L8 12L12 16L16 8L21 20H3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M17 4V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M14 7L17 4L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Declividade
 */
export const SlopeIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 18L21 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M3 18V12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 18H9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 8L18 6L20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================
// ÍCONES DE DOCUMENTOS/LEGAL
// ============================================

/**
 * Ícone de Certificado
 */
export const CertificateIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="3" width="16" height="14" rx="1" stroke={color} strokeWidth="2" />
        <path d="M8 8H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 11H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="19" r="3" stroke={color} strokeWidth="2" />
        <path d="M10 21L12 19L14 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Matrícula
 */
export const RegistryIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 4H16L20 8V20H4V4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 4V8H20" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M7 9H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 12H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 15H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <rect x="14" y="15" width="3" height="3" fill={color} />
    </svg>
);

/**
 * Ícone de Cartório
 */
export const NotaryIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="6" y="8" width="12" height="12" rx="1" stroke={color} strokeWidth="2" />
        <path d="M6 8L12 4L18 8" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 12H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 15H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="6" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Selo/Carimbo
 */
export const StampIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="10" r="6" stroke={color} strokeWidth="2" />
        <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M12 16V20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 20H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// ============================================
// ÍCONES DE AÇÕES
// ============================================

/**
 * Ícone de Imprimir
 */
export const PrintIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="6" y="3" width="12" height="6" stroke={color} strokeWidth="2" />
        <rect x="3" y="9" width="18" height="8" rx="1" stroke={color} strokeWidth="2" />
        <rect x="6" y="15" width="12" height="6" stroke={color} strokeWidth="2" />
        <circle cx="16" cy="12" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Exportar
 */
export const ExportIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 3V15" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 7L12 3L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Baixar/Download
 */
export const DownloadIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 3V15" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 11L12 15L16 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Compartilhar
 */
export const ShareIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
        <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
        <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
        <path d="M8.5 10.5L15.5 6.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8.5 13.5L15.5 17.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Arquivar
 */
export const ArchiveIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="3" y="3" width="18" height="6" rx="1" stroke={color} strokeWidth="2" />
        <path d="M5 9V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V9" stroke={color} strokeWidth="2" />
        <path d="M10 14H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Buscar
 */
export const SearchIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="2" />
        <path d="M15 15L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Filtrar
 */
export const FilterIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 4H21L14 12V20L10 22V12L3 4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Ordenar
 */
export const SortIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 6H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 12H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 18H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// ============================================
// ÍCONES DE COMUNICAÇÃO
// ============================================

/**
 * Ícone de Telefone
 */
export const PhoneIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5 4H9L11 9L8.5 10.5C9.57096 12.6715 11.3285 14.429 13.5 15.5L15 13L20 15V19C20 20.1046 19.1046 21 18 21C9.71573 21 3 14.2843 3 6C3 4.89543 3.89543 4 5 4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Email
 */
export const EmailIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" />
        <path d="M3 7L12 13L21 7" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de WhatsApp
 */
export const WhatsAppIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
        <path d="M8 14C8 14 9 16 12 16C15 16 16 14 16 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 9V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 9V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M17 17L19 20L14 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Notificação
 */
export const NotificationIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="5" r="3" fill={color} />
    </svg>
);

// ============================================
// ÍCONES FINANCEIROS
// ============================================

/**
 * Ícone de Nota Fiscal
 */
export const InvoiceIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 4V20L6 18L8 20L10 18L12 20L14 18L16 20L18 18L20 20V4H4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 8H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 12H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 16H11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Recibo
 */
export const ReceiptIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="5" y="2" width="14" height="20" rx="1" stroke={color} strokeWidth="2" />
        <path d="M9 6H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 10H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 14H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 18L11 16L13 18L15 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Banco
 */
export const BankIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 10L12 4L21 10" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 10V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M9 10V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 10V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M19 10V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M3 18H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M2 21H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Dinheiro
 */
export const MoneyIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
        <path d="M6 9V9.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 15V15.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// ============================================
// ÍCONES DE STATUS
// ============================================

/**
 * Ícone de Pendente
 */
export const PendingIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Em Andamento
 */
export const InProgressIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M12 6V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M16 12H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
);

/**
 * Ícone de Concluído
 */
export const CompletedIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Cancelado
 */
export const CancelledIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M15 9L9 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M9 9L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Alerta
 */
export const WarningIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 3L2 21H22L12 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 10V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Erro
 */
export const ErrorIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M12 8V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill={color} />
    </svg>
);

// ============================================
// ÍCONES DE USUÁRIOS
// ============================================

/**
 * Ícone de Cliente
 */
export const ClientIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Equipe
 */
export const TeamIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="9" cy="7" r="3" stroke={color} strokeWidth="2" />
        <circle cx="17" cy="7" r="3" stroke={color} strokeWidth="2" />
        <path d="M2 18C2 15.2386 4.68629 13 8 13C9.36364 13 10.6364 13.3636 11.5 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 13C18.3137 13 21 15.2386 21 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="13" cy="17" r="4" stroke={color} strokeWidth="2" />
        <circle cx="13" cy="16" r="1.5" stroke={color} strokeWidth="1" />
        <path d="M11 19C11 18 11.5 17 13 17C14.5 17 15 18 15 19" stroke={color} strokeWidth="1" />
    </svg>
);

/**
 * Ícone de Administrador
 */
export const AdminIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C13.5 14 14.9 14.3 16 14.8" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M19 16V19" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M17.5 17.5H20.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="19" cy="19" r="4" stroke={color} strokeWidth="1.5" />
    </svg>
);

// ============================================
// ÍCONES DE INTERFACE/NAVEGAÇÃO
// ============================================

/**
 * Ícone de Menu
 */
export const MenuIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 6H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 12H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 18H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Configurações
 */
export const SettingsIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
        <path d="M12 1V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 20V23" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M4.22 4.22L6.34 6.34" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M17.66 17.66L19.78 19.78" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M1 12H4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M20 12H23" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M4.22 19.78L6.34 17.66" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M17.66 6.34L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Dashboard
 */
export const DashboardIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="3" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="2" />
        <rect x="13" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="2" />
        <rect x="3" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="2" />
        <rect x="13" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="2" />
    </svg>
);

/**
 * Ícone de Ajuda
 */
export const HelpIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Fechar
 */
export const CloseIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Adicionar
 */
export const AddIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M12 8V16" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Editar
 */
export const EditIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M11 4H4V20H20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 3L21 7L12 16H8V12L17 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Deletar
 */
export const DeleteIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke={color} strokeWidth="2" />
        <path d="M5 6L6 20C6 20.5523 6.44772 21 7 21H17C17.5523 21 18 20.5523 18 20L19 6" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 10V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M14 10V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Voltar
 */
export const BackIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Avançar
 */
export const ForwardIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 5L19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Expandir
 */
export const ExpandIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M15 3H21V9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21H3V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 3L14 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M3 21L10 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Minimizar
 */
export const MinimizeIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 14H10V20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 10H14V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 10L21 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M10 14L3 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Atualizar
 */
export const RefreshIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3137 3 18.1771 4.78049 19.7417 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M21 3V8H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Zoom In
 */
export const ZoomInIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="2" />
        <path d="M15 15L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M10 7V13" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M7 10H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Zoom Out
 */
export const ZoomOutIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="2" />
        <path d="M15 15L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M7 10H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Ícone de Localização
 */
export const LocationIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 21C12 21 19 15 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 15 12 21 12 21Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="3" stroke={color} strokeWidth="2" />
    </svg>
);

/**
 * Ícone de Calendário
 */
export const CalendarIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
        <path d="M3 10H21" stroke={color} strokeWidth="2" />
        <path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <rect x="7" y="14" width="2" height="2" fill={color} />
        <rect x="11" y="14" width="2" height="2" fill={color} />
        <rect x="15" y="14" width="2" height="2" fill={color} />
    </svg>
);

/**
 * Ícone de Foto/Câmera
 */
export const CameraIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
        <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
        <path d="M7 6L8 4H16L17 6" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="17" cy="9" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Anexo
 */
export const AttachmentIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M21.44 11.05L12.25 20.24C10.78 21.71 8.36 21.71 6.89 20.24C5.42 18.77 5.42 16.35 6.89 14.88L16.08 5.69C17.01 4.76 18.51 4.76 19.44 5.69C20.37 6.62 20.37 8.12 19.44 9.05L10.26 18.23C9.79 18.7 9.04 18.7 8.57 18.23C8.1 17.76 8.1 17.01 8.57 16.54L16.86 8.25" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Histórico
 */
export const HistoryIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C9.17157 3 6.68629 4.31714 5.12 6.37" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M3 3V8H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Favorito/Estrela
 */
export const StarIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.9 8.6L22 9.3L17 14.2L18.2 21.2L12 17.8L5.8 21.2L7 14.2L2 9.3L9.1 8.6L12 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

/**
 * Ícone de Bloqueado
 */
export const LockedIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2" />
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Desbloqueado
 */
export const UnlockedIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2" />
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C13.5 3 14.8 3.8 15.5 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill={color} />
    </svg>
);

/**
 * Ícone de Visível
 */
export const VisibleIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    </svg>
);

/**
 * Ícone de Oculto
 */
export const HiddenIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M2 2L22 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M6.71 6.71C4.13 8.19 2 12 2 12C2 12 6 20 12 20C14.06 20 15.93 19.19 17.35 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 12C17 14.76 14.76 17 12 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M22 12C22 12 18 4 12 4C11.39 4 10.79 4.08 10.22 4.22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Export all icons as a named object for easy access
export const CustomIcons = {
    // Original
    TerrainIcon,
    MeasureIcon,
    SurveyorIcon,
    LegalDocIcon,
    AreaIcon,
    AtivoRealIcon,
    GpsIcon,
    ContractIcon,
    NeighborsIcon,
    ValidationIcon,
    QuoteIcon,
    MemorialIcon,
    BlueprintIcon,
    PaymentIcon,
    UploadDocIcon,
    SketchIcon,
    LayersIcon,
    PerimeterIcon,

    // Propriedades
    BuildingIcon,
    HouseIcon,
    FarmIcon,
    CommercialIcon,

    // Equipamento
    TheodoliteIcon,
    DroneIcon,
    StationIcon,
    BenchmarkIcon,
    ElevationIcon,
    SlopeIcon,

    // Documentos
    CertificateIcon,
    RegistryIcon,
    NotaryIcon,
    StampIcon,

    // Ações
    PrintIcon,
    ExportIcon,
    DownloadIcon,
    ShareIcon,
    ArchiveIcon,
    SearchIcon,
    FilterIcon,
    SortIcon,

    // Comunicação
    PhoneIcon,
    EmailIcon,
    WhatsAppIcon,
    NotificationIcon,

    // Financeiro
    InvoiceIcon,
    ReceiptIcon,
    BankIcon,
    MoneyIcon,

    // Status
    PendingIcon,
    InProgressIcon,
    CompletedIcon,
    CancelledIcon,
    WarningIcon,
    ErrorIcon,

    // Usuários
    ClientIcon,
    TeamIcon,
    AdminIcon,

    // Interface
    MenuIcon,
    SettingsIcon,
    DashboardIcon,
    HelpIcon,
    CloseIcon,
    AddIcon,
    EditIcon,
    DeleteIcon,
    BackIcon,
    ForwardIcon,
    ExpandIcon,
    MinimizeIcon,
    RefreshIcon,
    ZoomInIcon,
    ZoomOutIcon,
    LocationIcon,
    CalendarIcon,
    CameraIcon,
    AttachmentIcon,
    HistoryIcon,
    StarIcon,
    LockedIcon,
    UnlockedIcon,
    VisibleIcon,
    HiddenIcon,
};