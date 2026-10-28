import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@/app/i18n';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DragProvider } from '@/app/DragContext';
import { ConfirmProvider } from '@/app/ConfirmContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DragProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </HashRouter>
      </QueryClientProvider>
    </DragProvider>
  </StrictMode>,
);
