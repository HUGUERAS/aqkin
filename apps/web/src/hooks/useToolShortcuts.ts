/**
 * useToolShortcuts - Hook para keyboard shortcuts das ferramentas CAD/GIS
 *
 * Atalhos:
 * - 1-9: Selecionar categoria (Drawing, Analysis, ...)
 * - S: Split
 * - M: Merge/Measure (depende da categoria)
 * - B: Buffer
 * - D: Distance/Difference (depende da categoria)
 * - E: Edit/Extend
 * - A: Area/Angle
 * - P: Perimeter
 * - Escape: Desativar ferramenta atual
 * - Ctrl+E: Export GeoJSON
 * - Ctrl+I: Import KML
 */

import { useEffect, useCallback } from 'react';
import type { ToolCategory, ToolId } from '../components/tools/ToolbarTabs';

const CATEGORY_KEYS: Record<string, ToolCategory> = {
  '1': 'drawing',
  '2': 'analysis',
  '3': 'measurement',
  '4': 'topology',
  '5': 'annotation',
  '6': 'selection',
  '7': 'import-export',
  '8': 'coordinates',
  '9': 'sigef',
};

const TOOL_SHORTCUTS: Record<string, Partial<Record<ToolCategory, ToolId>>> = {
  s: { drawing: 'split', selection: 'select-rect' },
  m: { drawing: 'merge', measurement: 'measure' as ToolId },
  b: { drawing: 'buffer' },
  o: { drawing: 'offset' },
  e: { drawing: 'extend' },
  t: { drawing: 'trim', topology: 'validate-topology' },
  f: { drawing: 'fillet' },
  i: { analysis: 'intersect' },
  u: { analysis: 'union' },
  d: { analysis: 'difference', measurement: 'coords-display' },
  c: { analysis: 'centroid', coordinates: 'coord-converter' },
  p: { analysis: 'perimeter' },
  a: { measurement: 'angle', annotation: 'label' },
  z: { measurement: 'azimuth' },
  v: { topology: 'validate-topology', sigef: 'sigef-validator' },
  g: { coordinates: 'coord-grid' },
};

interface UseToolShortcutsOptions {
  activeCategory: ToolCategory;
  activeTool: ToolId | string | null;
  onCategoryChange: (category: ToolCategory) => void;
  onToolActivate: (tool: ToolId | null) => void;
  enabled?: boolean;
}

export default function useToolShortcuts({
  activeCategory,
  activeTool,
  onCategoryChange,
  onToolActivate,
  enabled = true,
}: UseToolShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Escape: deactivate current tool
      if (key === 'escape') {
        event.preventDefault();
        onToolActivate(null);
        return;
      }

      // Ctrl+E: Export GeoJSON
      if (event.ctrlKey && key === 'e') {
        event.preventDefault();
        onCategoryChange('import-export');
        onToolActivate('export-geojson');
        return;
      }

      // Ctrl+I: Import KML
      if (event.ctrlKey && key === 'i') {
        event.preventDefault();
        onCategoryChange('import-export');
        onToolActivate('import-kml');
        return;
      }

      // Number keys: switch category
      if (CATEGORY_KEYS[key] && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        onCategoryChange(CATEGORY_KEYS[key]);
        return;
      }

      // Letter keys: activate tool based on current category
      if (TOOL_SHORTCUTS[key] && !event.ctrlKey && !event.altKey) {
        const toolForCategory = TOOL_SHORTCUTS[key][activeCategory];
        if (toolForCategory) {
          event.preventDefault();
          // Toggle: if same tool is active, deactivate
          if (activeTool === toolForCategory) {
            onToolActivate(null);
          } else {
            onToolActivate(toolForCategory);
          }
        }
      }
    },
    [enabled, activeCategory, activeTool, onCategoryChange, onToolActivate]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
