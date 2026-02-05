import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // Global styles + Tailwind
import 'ol/ol.css'; // OpenLayers CSS

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
