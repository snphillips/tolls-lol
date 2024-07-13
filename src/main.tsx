import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LoadingProvider } from './LoadingContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LoadingProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </LoadingProvider>
);
