/**
 * SIGEFTools Component
 * 3 SIGEF (Sistema de Gestão Fundiária) validation tools for Brazil
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface SIGEFToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function SIGEFTools({ activeTool, onToolActivate }: SIGEFToolsProps) {
  const tools = [
    {
      id: 'sigef-validator' as ToolId,
      label: 'Validador SIGEF',
      icon: 'check-circle' as const,
      description: 'Validar geometria conforme normas SIGEF/INCRA'
    },
    {
      id: 'memorial' as ToolId,
      label: 'Memorial Descritivo',
      icon: 'file' as const,
      description: 'Gerar memorial descritivo do imóvel'
    },
    {
      id: 'vertices-sirgas' as ToolId,
      label: 'Vértices SIRGAS',
      icon: 'grid' as const,
      description: 'Exportar vértices em SIRGAS 2000'
    },
  ];

  return (
    <div className="sigef-tools tool-grid">
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
