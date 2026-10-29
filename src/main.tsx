console.log('[MAIN] Starting application mount...');
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[MAIN] Root element not found!');
} else {
  try {
    createRoot(rootEl).render(<App />);
    console.log('[MAIN] Render call dispatched to root');
  } catch (err) {
    console.error('[MAIN] Render threw error:', err);
  }
}
