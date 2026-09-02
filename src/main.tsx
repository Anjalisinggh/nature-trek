import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppStateProvider } from './app/providers/AppState';
import { AppRoutes } from './app/navigation/Routes';
import { ParallaxProvider, CursorProvider } from './components/motion';

import './styles/site.css';
import './styles/experience.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppStateProvider>
        <ParallaxProvider>
          <CursorProvider>
            <AppRoutes />
          </CursorProvider>
        </ParallaxProvider>
      </AppStateProvider>
    </BrowserRouter>
  </StrictMode>,
);
