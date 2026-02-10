import { useState } from 'react';

interface CoordinateConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (lon: number, lat: number, fromCRS: string, toCRS: string) => void;
  result?: { easting: number; northing: number; zone: number } | null;
}

export default function CoordinateConverterModal({ isOpen, onClose, onConvert, result }: CoordinateConverterModalProps) {
  const [lon, setLon] = useState(-47.9292);
  const [lat, setLat] = useState(-15.7801);
  const [fromCRS, setFromCRS] = useState('EPSG:4326');
  const [toCRS, setToCRS] = useState('SIRGAS2000-UTM');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tool-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Conversor de Coordenadas</h3>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="coord-lon">Longitude:</label>
              <input id="coord-lon" type="number" step={0.000001} value={lon} onChange={(e) => setLon(parseFloat(e.target.value) || 0)} className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="coord-lat">Latitude:</label>
              <input id="coord-lat" type="number" step={0.000001} value={lat} onChange={(e) => setLat(parseFloat(e.target.value) || 0)} className="form-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="from-crs">De:</label>
              <select id="from-crs" value={fromCRS} onChange={(e) => setFromCRS(e.target.value)} className="form-select">
                <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
                <option value="EPSG:4674">SIRGAS 2000 (EPSG:4674)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="to-crs">Para:</label>
              <select id="to-crs" value={toCRS} onChange={(e) => setToCRS(e.target.value)} className="form-select">
                <option value="SIRGAS2000-UTM">SIRGAS 2000 UTM</option>
                <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
                <option value="EPSG:4674">SIRGAS 2000 (EPSG:4674)</option>
              </select>
            </div>
          </div>
          {result && (
            <div className="conversion-result">
              <h4>Resultado:</h4>
              <p>E: {result.easting.toFixed(3)}</p>
              <p>N: {result.northing.toFixed(3)}</p>
              <p>Fuso UTM: {result.zone}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
          <button className="btn-primary" onClick={() => onConvert(lon, lat, fromCRS, toCRS)}>Converter</button>
        </div>
      </div>
    </div>
  );
}
