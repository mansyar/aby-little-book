import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { registerSw } from './sw/register';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/reader.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Application root element is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerSw();
