/**
 * MeasurementTools Component
 * 5 advanced measurement tools
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface MeasurementToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function MeasurementTools({ activeTool, onToolActivate }: MeasurementToolsProps) {
  const tools = [
    {
      id: 'angle' as ToolId,
      label: 'Ângulo',
      icon: 'compass' as const,
      description: 'Medir ângulo entre três pontos'
    },
    {
      id: 'azimuth' as ToolId,
      label: 'Azimute',
      icon: 'compass' as const,
      description: 'Calcular azimute (rumo) entre dois pontos'
    },
    {
      id: 'coords-display' as ToolId,
      label: 'Exibir Coordenadas',
      icon: 'grid' as const,
      description: 'Mostrar coordenadas ao mover o mouse'
    },
    {
      id: 'elevation' as ToolId,
      label: 'Perfil de Elevação',
      icon: 'chart' as const,
      description: 'Gerar perfil de elevação ao longo de linha'
    },
    {
      id: 'slope' as ToolId,
      label: 'Declividade',
      icon: 'chart' as const,
      description: 'Calcular declividade e aspecto do terreno'
    },
  ];

  return (
    <div className="measurement-tools tool-grid">
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
