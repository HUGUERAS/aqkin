/**
 * ImportExportTools Component
 * 5 data import/export tools
 */

import ToolButton from '../ToolButton';
import { ToolId } from '../ToolbarTabs';

interface ImportExportToolsProps {
  activeTool: ToolId | null;
  onToolActivate: (tool: ToolId | null) => void;
}

export default function ImportExportTools({ activeTool, onToolActivate }: ImportExportToolsProps) {
  const tools = [
    {
      id: 'import-kml' as ToolId,
      label: 'Importar KML/KMZ',
      icon: 'upload' as const,
      description: 'Importar arquivo KML ou KMZ do Google Earth'
    },
    {
      id: 'import-shp' as ToolId,
      label: 'Importar Shapefile',
      icon: 'upload' as const,
      description: 'Importar arquivo Shapefile (SHP)'
    },
    {
      id: 'import-gpx' as ToolId,
      label: 'Importar GPX',
      icon: 'upload' as const,
      description: 'Importar trilhas e pontos GPS (GPX)'
    },
    {
      id: 'export-dxf' as ToolId,
      label: 'Exportar DXF',
      icon: 'download' as const,
      description: 'Exportar geometrias para formato AutoCAD DXF'
    },
    {
      id: 'export-geojson' as ToolId,
      label: 'Exportar GeoJSON',
      icon: 'download' as const,
      description: 'Exportar dados para formato GeoJSON'
    },
  ];

  return (
    <div className="import-export-tools tool-grid">
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
