/**
 * CoordinateTools Component
 * 3 coordinate system tools
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface CoordinateToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function CoordinateTools({ activeTool, onToolActivate }: CoordinateToolsProps) {
  const tools = [
    {
      id: 'coord-converter' as ToolId,
      label: 'Conversor de Coordenadas',
      icon: 'compass' as const,
      description: 'Converter entre sistemas de coordenadas (WGS84, SIRGAS, UTM)'
    },
    {
      id: 'add-point' as ToolId,
      label: 'Adicionar Ponto por Coords',
      icon: 'plus' as const,
      description: 'Adicionar ponto digitando coordenadas'
    },
    {
      id: 'coord-grid' as ToolId,
      label: 'Grade de Coordenadas',
      icon: 'grid' as const,
      description: 'Exibir/ocultar grade de coordenadas'
    },
  ];

  return (
    <div className="coordinate-tools tool-grid">
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          {...tool}
          active={activeTool === tool.id}
          onClick={() => onToolActivate(activeTool === tool.id ? null : tool.id)}
        />
      ))}
    </div>
  );
}
