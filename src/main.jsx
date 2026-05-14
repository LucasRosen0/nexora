import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/app.css';
import { App } from './App.jsx';
import { ThemeProvider } from './store/ThemeContext.jsx';
import { I18nProvider } from './store/I18nContext.jsx';
import { ToastProvider } from './store/ToastContext.jsx';
import { AuthProvider } from './store/AuthContext.jsx';
import { DevicesProvider } from './store/DevicesContext.jsx';
import { NotesProvider } from './store/NotesContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <AuthProvider>
              <DevicesProvider>
                <NotesProvider>
                  <App />
                </NotesProvider>
              </DevicesProvider>
            </AuthProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
