import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/index.css';

import { Providers } from './providers';
import { Router } from './router';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Không tìm thấy thẻ #root trong index.html.');
}

createRoot(container).render(
  <StrictMode>
    <Providers>
      <Router />
    </Providers>
  </StrictMode>,
);
