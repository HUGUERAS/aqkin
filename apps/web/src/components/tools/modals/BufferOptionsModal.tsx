import { useState } from 'react';

interface BufferOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (distance: number, unit: 'meters' | 'kilometers') => void;
}

export default function BufferOptionsModal({ isOpen, onClose, onApply }: BufferOptionsModalProps) {
  const [distance, setDistance] = useState(50);
  const [unit, setUnit] = useState<'meters' | 'kilometers'>('meters');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tool-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Opcoes de Buffer</h3>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="buffer-distance">Distancia:</label>
            <input
              id="buffer-distance"
              type="number"
              min={0.1}
              step={0.1}
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="buffer-unit">Unidade:</label>
            <select
              id="buffer-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'meters' | 'kilometers')}
              className="form-select"
            >
              <option value="meters">Metros</option>
              <option value="kilometers">Quilometros</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => onApply(distance, unit)}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}
