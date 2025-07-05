import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { MicroSipProvider } from './contexts/MicroSipContext';
import { AutoDialProvider } from './contexts/AutoDialContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MicroSipProvider>
      <AutoDialProvider>
        <App />
      </AutoDialProvider>
    </MicroSipProvider>
  </StrictMode>
);