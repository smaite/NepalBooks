// Console commands for admin functions

import { showAdminPanel } from './index';
import { appConfig } from '../config/appConfig';

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
%c${appConfig.name} Admin Console Commands

%cadminPanel()%c - Open the admin release panel
%chelp()%c - Show this help information

%cAccess these commands by typing:%c
window.ledgerpro.adminPanel()
window.ledgerpro.help()
    `,
    'font-size: 16px; font-weight: bold; color: #1c7ed6;',
    'color: #40c057; font-weight: bold;', 'color: inherit;',
    'color: #40c057; font-weight: bold;', 'color: inherit;',
    'font-weight: bold; color: #1c7ed6;', 'color: inherit;'
    );
  }
};

/**
 * Register console commands to window.ledgerpro object
 */
export function registerConsoleCommands(): void {
  if (typeof window === 'undefined') return;

  // Create or get the ledgerpro object
  (window as any).ledgerpro = (window as any).ledgerpro || {};

  // Add commands
  (window as any).ledgerpro.adminPanel = ConsoleCommands.adminPanel;
  (window as any).ledgerpro.help = ConsoleCommands.help;

  // Print info in dev mode
  if (import.meta.env.DEV) {
    console.log(`
%c${appConfig.name} Admin Console Ready
%cType %cwindow.ledgerpro.help()%c for available commands
    `,
    'font-size: 14px; font-weight: bold; color: #1c7ed6;',
    'color: inherit;',
    'color: #40c057; font-weight: bold;',
    'color: inherit;'
    );
  }
} 