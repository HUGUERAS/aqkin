import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initTelemetry } from './utils/telemetry';
import './styles/design-system.css';  // Design tokens & colors
import './styles/PortalLayout.css';   // Portal layout
import './styles/index.css';          // Reset & base styles
import './styles.css';                // Tailwind & utilities
import 'ol/ol.css';                   // OpenLayers CSS

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
