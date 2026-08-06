import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IdeWorkspace } from './IdeWorkspace';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IdeWorkspace />
  </StrictMode>
);
