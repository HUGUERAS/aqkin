/**
 * DrawingTools Component
 * 7 advanced drawing tools for CAD operations
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface DrawingToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function DrawingTools({ activeTool, onToolActivate }: DrawingToolsProps) {
  const tools = [
    {
      id: 'split' as ToolId,
      label: 'Dividir Polígono',
      icon: 'edit' as const,
      description: 'Dividir polígono com linha de corte'
    },
    {
      id: 'merge' as ToolId,
      label: 'Unir Polígonos',
      icon: 'plus' as const,
      description: 'Unir polígonos adjacentes em um único polígono'
    },
    {
      id: 'buffer' as ToolId,
      label: 'Buffer',
      icon: 'compass' as const,
      description: 'Criar buffer (área de influência) ao redor da geometria'
    },
    {
      id: 'offset' as ToolId,
      label: 'Offset',
      icon: 'move' as const,
      description: 'Criar linha paralela com distância específica'
    },
    {
      id: 'extend' as ToolId,
      label: 'Estender',
      icon: 'forward' as const,
      description: 'Estender linha até intersecção'
    },
    {
      id: 'trim' as ToolId,
      label: 'Cortar',
      icon: 'edit' as const,
      description: 'Cortar linha na intersecção'
    },
    {
      id: 'fillet' as ToolId,
      label: 'Arredondar',
      icon: 'compass' as const,
      description: 'Arredondar cantos com raio específico'
    },
  ];

  return (
    <div className="drawing-tools tool-grid">
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
