import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './services/store';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
      <Toaster position="top-right" />
    </AppProvider>
  </React.StrictMode>
);