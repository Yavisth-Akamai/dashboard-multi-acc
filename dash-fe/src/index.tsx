import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeWrapper } from './ThemeWrapper';

const container = document.getElementById('root')!;

if (!container.hasChildNodes()) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeWrapper>
        <App />
      </ThemeWrapper>
    </React.StrictMode>
  );
}