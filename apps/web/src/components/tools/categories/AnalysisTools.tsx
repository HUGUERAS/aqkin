/**
 * AnalysisTools Component
 * 7 geometric analysis tools
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface AnalysisToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function AnalysisTools({ activeTool, onToolActivate }: AnalysisToolsProps) {
  const tools = [
    {
      id: 'intersect' as ToolId,
      label: 'Intersecção',
      icon: 'search' as const,
      description: 'Encontrar área de intersecção entre geometrias'
    },
    {
      id: 'union' as ToolId,
      label: 'União',
      icon: 'plus' as const,
      description: 'Unir geometrias em uma só'
    },
    {
      id: 'difference' as ToolId,
      label: 'Diferença',
      icon: 'edit' as const,
      description: 'Subtrair geometria B de geometria A'
    },
    {
      id: 'symmetric-diff' as ToolId,
      label: 'Diferença Simétrica',
      icon: 'compass' as const,
      description: 'Áreas exclusivas de cada geometria (XOR)'
    },
    {
      id: 'convex-hull' as ToolId,
      label: 'Envoltória Convexa',
      icon: 'map' as const,
      description: 'Menor polígono convexo que contém a geometria'
    },
    {
      id: 'centroid' as ToolId,
      label: 'Centróide',
      icon: 'compass' as const,
      description: 'Calcular centro geométrico'
    },
    {
      id: 'perimeter' as ToolId,
      label: 'Perímetro',
      icon: 'ruler' as const,
      description: 'Calcular perímetro total'
    },
  ];

  return (
    <div className="analysis-tools tool-grid">
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
