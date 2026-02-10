/**
 * ToolbarTabs Component
 * Tab navigation for 43 CAD/GIS tools organized in 9 categories
 */

import { ReactNode } from 'react';
import Icon from '../Icon';
import '../../styles/tools/ToolbarTabs.css';

export type ToolCategory =
  | 'drawing'
  | 'analysis'
  | 'measurement'
  | 'topology'
  | 'annotation'
  | 'selection'
  | 'import-export'
  | 'coordinates'
  | 'sigef';

export type ToolId =
  | 'split' | 'merge' | 'buffer' | 'offset' | 'extend' | 'trim' | 'fillet'
  | 'intersect' | 'union' | 'difference' | 'symmetric-diff' | 'convex-hull' | 'centroid' | 'perimeter'
  | 'angle' | 'azimuth' | 'coords-display' | 'elevation' | 'slope'
  | 'validate-topology' | 'close-gaps' | 'remove-slivers' | 'simplify' | 'densify'
  | 'label' | 'dimension' | 'north-arrow' | 'scale-bar'
  | 'select-rect' | 'select-polygon' | 'select-distance' | 'select-attribute'
  | 'import-kml' | 'import-shp' | 'import-gpx' | 'export-dxf' | 'export-geojson'
  | 'coord-converter' | 'add-point' | 'coord-grid'
  | 'sigef-validator' | 'memorial' | 'vertices-sirgas';

interface Tab {
  id: ToolCategory;
  label: string;
  icon: 'edit-3' | 'map' | 'ruler' | 'compass' | 'file' | 'search' | 'download' | 'grid' | 'check-circle';
  color: string;
}

const tabs: Tab[] = [
  { id: 'drawing', label: 'Desenho', icon: 'edit-3', color: 'green' },
  { id: 'analysis', label: 'Análise', icon: 'map', color: 'blue' },
  { id: 'measurement', label: 'Medição', icon: 'ruler', color: 'amber' },
  { id: 'topology', label: 'Topologia', icon: 'compass', color: 'purple' },
  { id: 'annotation', label: 'Anotação', icon: 'file', color: 'pink' },
  { id: 'selection', label: 'Seleção', icon: 'search', color: 'cyan' },
  { id: 'import-export', label: 'Import/Export', icon: 'download', color: 'orange' },
  { id: 'coordinates', label: 'Coordenadas', icon: 'grid', color: 'teal' },
  { id: 'sigef', label: 'SIGEF', icon: 'check-circle', color: 'red' },
];

interface ToolbarTabsProps {
  activeCategory: ToolCategory;
  activeTool: ToolId | null;
  onCategoryChange: (category: ToolCategory) => void;
  onToolActivate: (tool: ToolId | null) => void;
  children?: ReactNode;
}

export default function ToolbarTabs({
  activeCategory,
  activeTool,
  onCategoryChange,
  onToolActivate,
  children,
}: ToolbarTabsProps) {
  return (
    <div className="toolbar-tabs">
      {/* Tab Navigation */}
      <div className="tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeCategory === tab.id ? 'active' : ''}`}
            data-color={tab.color}
            onClick={() => onCategoryChange(tab.id)}
            aria-label={`Selecionar categoria ${tab.label}`}
            aria-pressed={activeCategory === tab.id}
          >
            <Icon name={tab.icon} size="sm" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tool Panel for Active Category */}
      <div className="tools-panel">
        {children}
      </div>
    </div>
  );
}
