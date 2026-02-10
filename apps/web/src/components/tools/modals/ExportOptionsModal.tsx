import { useState } from 'react';

type ExportFormat = 'geojson' | 'dxf' | 'kml' | 'shapefile';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  exporting?: boolean;
}

export default function ExportOptionsModal({ isOpen, onClose, onExport, exporting = false }: ExportOptionsModalProps) {
  const [format, setFormat] = useState<ExportFormat>('geojson');

  if (!isOpen) return null;

  const formats = [
    { value: 'geojson' as ExportFormat, label: 'GeoJSON', description: 'Formato padrao para dados geoespaciais na web' },
    { value: 'dxf' as ExportFormat, label: 'DXF (AutoCAD)', description: 'Compativel com AutoCAD e outros softwares CAD' },
    { value: 'kml' as ExportFormat, label: 'KML (Google Earth)', description: 'Para visualizacao no Google Earth' },
    { value: 'shapefile' as ExportFormat, label: 'Shapefile', description: 'Formato ESRI para SIG' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content tool-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        <div className="modal-header">
          <h3 id="export-modal-title">Exportar Geometria</h3>
          <button 
            type="button"
            className="modal-close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            X
          </button>
        </div>
        <div className="modal-body">
          <div className="export-formats">
            {formats.map((f) => (
              <label key={f.value} className={`export-format-option ${format === f.value ? 'selected' : ''}`}>
                <input type="radio" name="export-format" value={f.value} checked={format === f.value} onChange={() => setFormat(f.value)} />
                <div className="format-info">
                  <strong>{f.label}</strong>
                  <span>{f.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => onExport(format)} disabled={exporting}>
            {exporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
}
