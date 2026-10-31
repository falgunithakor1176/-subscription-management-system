/**
 * providers.jsx
 * Wraps the application with all global context providers.
 * Adding a new provider here automatically applies it to the whole app.
 */

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext.jsx';

export const AppProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              color: '#0F172A',
              background: '#FFFFFF',
            },
            success: {
              iconTheme: { primary: '#059669', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};
