const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // File operations
    saveFile: async (options, data) => {
      const filePath = await ipcRenderer.invoke('show-save-dialog', options);
      if (filePath) {
        return await ipcRenderer.invoke('write-file', filePath, data);
      }
      return false;
    },
    openFile: async (options) => {
      const filePath = await ipcRenderer.invoke('show-open-dialog', options);
      if (filePath) {
        return {
          path: filePath,
          content: await ipcRenderer.invoke('read-file', filePath)
        };
      }
      return null;
    },
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),

    // Message listeners
    on: (channel, callback) => {
      // Whitelist channels for security
      const validChannels = [
        'menu-export-data',
        'menu-import-data',
        'menu-backup',
        'menu-restore'
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    
    // App info
    getAppInfo: () => {
      return {
        isElectron: true,
        platform: process.platform,
        appVersion: process.env.npm_package_version || '1.0.0'
      };
    }
  }
); 