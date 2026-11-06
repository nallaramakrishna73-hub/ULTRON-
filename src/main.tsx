import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent browser ResizeObserver loop notification from triggering unhandled error overlay
window.addEventListener('error', (e) => {
  if (
    e.message?.includes('ResizeObserver loop completed with undelivered notifications') ||
    e.message?.includes('ResizeObserver loop limit exceeded')
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
