/**
 * TopologyTools Component
 * 5 topology validation and correction tools
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface TopologyToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function TopologyTools({ activeTool, onToolActivate }: TopologyToolsProps) {
  const tools = [
    {
      id: 'validate-topology' as ToolId,
      label: 'Validar Topologia',
      icon: 'check-circle' as const,
      description: 'Verificar auto-intersecções e erros topológicos'
    },
    {
      id: 'close-gaps' as ToolId,
      label: 'Fechar Lacunas',
      icon: 'edit' as const,
      description: 'Detectar e fechar gaps entre polígonos'
    },
    {
      id: 'remove-slivers' as ToolId,
      label: 'Remover Slivers',
      icon: 'filter' as const,
      description: 'Remover polígonos muito finos (slivers)'
    },
    {
      id: 'simplify' as ToolId,
      label: 'Simplificar',
      icon: 'grid' as const,
      description: 'Reduzir número de vértices mantendo forma'
    },
    {
      id: 'densify' as ToolId,
      label: 'Densificar',
      icon: 'plus' as const,
      description: 'Adicionar vértices intermediários'
    },
  ];

  return (
    <div className="topology-tools tool-grid">
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
