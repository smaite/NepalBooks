// AdminHotkeys.ts - Keyboard shortcuts for admin functions

import { showAdminPanel } from './index';

/**
 * Register keyboard shortcuts for admin functions
 * Alt+Shift+A: Open Admin Panel
 */
export function registerAdminHotkeys(): void {
  if (typeof window === 'undefined') return;

  // Only register in development mode
  if (!import.meta.env.DEV) return;

  // Add event listener for keyboard shortcuts
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    // Alt+Shift+A: Open Admin Panel
    if (event.altKey && event.shiftKey && event.key === 'A') {
      event.preventDefault();
      console.log('Admin panel hotkey triggered');
      showAdminPanel();
    }
  });

  console.debug('Admin hotkeys registered. Try Alt+Shift+A to open the admin panel.');
}

/**
 * Initialize admin hotkeys
 */
export function initAdminHotkeys(): void {
  registerAdminHotkeys();
} 