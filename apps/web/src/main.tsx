import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initTelemetry } from './utils/telemetry';
import './styles/design-tokens.css';       // Design tokens & colors
import './styles/map-focused-layout.css';  // New map-focused layout system
import './styles/index.css';               // Reset & base styles
import './styles.css';                     // Tailwind & utilities
import 'ol/ol.css';                        // OpenLayers CSS

initTelemetry();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
