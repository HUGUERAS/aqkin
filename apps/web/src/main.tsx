import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './styles/design-tokens.css'; // Variáveis globais
import './styles/index.css';         // Reset e estilos base
import './styles.css';               // Tailwind
import 'ol/ol.css';                  // OpenLayers CSS

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
