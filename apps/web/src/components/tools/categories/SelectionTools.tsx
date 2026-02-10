/**
 * SelectionTools Component
 * 4 feature selection tools
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface SelectionToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function SelectionTools({ activeTool, onToolActivate }: SelectionToolsProps) {
  const tools = [
    {
      id: 'select-rect' as ToolId,
      label: 'Selecionar por Retângulo',
      icon: 'grid' as const,
      description: 'Selecionar features dentro de retângulo'
    },
    {
      id: 'select-polygon' as ToolId,
      label: 'Selecionar por Polígono',
      icon: 'map' as const,
      description: 'Selecionar features dentro de polígono desenhado'
    },
    {
      id: 'select-distance' as ToolId,
      label: 'Selecionar por Distância',
      icon: 'compass' as const,
      description: 'Selecionar features dentro de raio'
    },
    {
      id: 'select-attribute' as ToolId,
      label: 'Selecionar por Atributo',
      icon: 'filter' as const,
      description: 'Selecionar features por filtro de atributo'
    },
  ];

  return (
    <div className="selection-tools tool-grid">
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
