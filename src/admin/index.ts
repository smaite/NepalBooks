// Admin module initialization

import { updateAdmin } from './UpdateAdmin';
import { initAdminHotkeys } from './AdminHotkeys';
import { registerConsoleCommands } from './ConsoleCommands';
import { appConfig } from '../config/appConfig';

/**
 * Initialize the admin module and ensure updateAdmin is available globally
 */
export function initAdminModule() {
  // Make sure updateAdmin is available in the global window object
  if (typeof window !== 'undefined') {
    // Set the updateAdmin object to window
    (window as any).updateAdmin = updateAdmin;
    
    // Register keyboard shortcuts for admin functions
    initAdminHotkeys();
    
    // Register console commands
    registerConsoleCommands();
    
    // Add a special command to the console
    console.debug(`${appConfig.name} admin module initialized`);
  }
}

/**
 * Show the admin panel UI
 */
export function showAdminPanel() {
  if (typeof window !== 'undefined') {
    try {
      if ((window as any).updateAdmin) {
        (window as any).updateAdmin.showAdminPanel();
      } else {
        // Fallback if not available on window
        updateAdmin.showAdminPanel();
        
        // Also set it to window for future use
        (window as any).updateAdmin = updateAdmin;
      }
    } catch (error) {
      console.error('Error showing admin panel:', error);
      alert('Error showing admin panel. Check console for details.');
    }
  }
}

// Export the updateAdmin instance
export { updateAdmin }; 