const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', 
  {
    // File System Operations
    saveFile: (options, data) => ipcRenderer.invoke('save-file', options, data),
    openFile: (options) => ipcRenderer.invoke('open-file', options),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    
    // App Info
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // Event listeners
    on: (channel, callback) => {
      // Whitelist channels
      const validChannels = [
        'update-available', 
        'update-progress',
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
    
    // Update-related functions
    downloadUpdate: (url) => ipcRenderer.invoke('download-update', url),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
  }
); 