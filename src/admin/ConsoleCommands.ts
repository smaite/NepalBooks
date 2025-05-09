// Console commands for admin functions

import { showAdminPanel } from './index';

/**
 * Commands available in the console for administrators
 */
export const ConsoleCommands = {
  /**
   * Show the admin panel UI
   */
  adminPanel: (): void => {
    showAdminPanel();
  },

  /**
   * Print help information about available commands
   */
  help: (): void => {
    console.log(`
%cNepalBooks Admin Console Commands

%cadminPanel()%c - Open the admin release panel
%chelp()%c - Show this help information

%cAccess these commands by typing:%c
window.nepalbooks.adminPanel()
window.nepalbooks.help()
    `,
    'font-size: 16px; font-weight: bold; color: #1c7ed6;',
    'color: #40c057; font-weight: bold;', 'color: inherit;',
    'color: #40c057; font-weight: bold;', 'color: inherit;',
    'font-weight: bold; color: #1c7ed6;', 'color: inherit;'
    );
  }
};

/**
 * Register console commands to window.nepalbooks object
 */
export function registerConsoleCommands(): void {
  if (typeof window === 'undefined') return;

  // Create or get the nepalbooks object
  (window as any).nepalbooks = (window as any).nepalbooks || {};

  // Add commands
  (window as any).nepalbooks.adminPanel = ConsoleCommands.adminPanel;
  (window as any).nepalbooks.help = ConsoleCommands.help;

  // Print info in dev mode
  if (import.meta.env.DEV) {
    console.log(`
%cNepalBooks Admin Console Ready
%cType %cwindow.nepalbooks.help()%c for available commands
    `,
    'font-size: 14px; font-weight: bold; color: #1c7ed6;',
    'color: inherit;',
    'color: #40c057; font-weight: bold;',
    'color: inherit;'
    );
  }
} 