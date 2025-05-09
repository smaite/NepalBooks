import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';

// Import our admin module for console access
import './admin/UpdateAdmin';

import { useState } from 'react';

function Main() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const toggleColorScheme = (value?: 'light' | 'dark') =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        theme={{
          colorScheme,
          primaryColor: 'blue',
          fontFamily: 'Inter, sans-serif',
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Notifications />
    <App />
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

// Initialize the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

// Add console message for developers about the admin panel
if (import.meta.env.DEV) {
  console.info(
    '%c🔧 Developer Tools: %cType %cupdateAdmin.showAdminPanel()%c to access the release manager',
    'color: #1c7ed6; font-weight: bold;',
    'color: inherit;',
    'color: #40c057; font-weight: bold;',
    'color: inherit;'
  );
}
