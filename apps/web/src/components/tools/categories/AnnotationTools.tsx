/**
 * AnnotationTools Component
 * 4 annotation and labeling tools
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface AnnotationToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function AnnotationTools({ activeTool, onToolActivate }: AnnotationToolsProps) {
  const tools = [
    {
      id: 'label' as ToolId,
      label: 'Adicionar Rótulo',
      icon: 'file' as const,
      description: 'Adicionar texto de rótulo no mapa'
    },
    {
      id: 'dimension' as ToolId,
      label: 'Dimensão',
      icon: 'ruler' as const,
      description: 'Adicionar linha de dimensão com medida'
    },
    {
      id: 'north-arrow' as ToolId,
      label: 'Seta Norte',
      icon: 'compass' as const,
      description: 'Adicionar indicador de norte'
    },
    {
      id: 'scale-bar' as ToolId,
      label: 'Barra de Escala',
      icon: 'ruler' as const,
      description: 'Adicionar barra de escala gráfica'
    },
  ];

  return (
    <div className="annotation-tools tool-grid">
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
