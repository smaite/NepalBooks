const { app, BrowserWindow, ipcMain, contextBridge } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const UpdateHandler = require('./updateHandler');

// Initialize electron API namespace
global.electronAPI = {};

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Allow loading local resources
    },
    backgroundColor: '#1a1b1e',
    titleBarStyle: 'default',
    frame: true,
    autoHideMenuBar: true
  });

  // Initialize the update handler
  const updateHandler = new UpdateHandler(mainWindow);

  // Register IPC handlers
  ipcMain.handle('download-update', (event, url) => {
    return updateHandler.downloadUpdate(url);
  });
  
  ipcMain.handle('check-for-updates', () => {
    return updateHandler.checkForUpdates();
  });
  
  ipcMain.handle('set-update-channel', (event, channel) => {
    return updateHandler.setUpdateChannel(channel);
  });
  
  ipcMain.handle('get-current-update-channel', () => {
    return updateHandler.getCurrentUpdateChannel();
  });

  // Load the app
  if (isDev) {
    // Try different ports if 3000 is not available
    const ports = [3000, 3001, 3002, 3003, 3004, 3005];
    let loadedSuccessfully = false;
    
    // Try each port in sequence
    const tryLoadPort = (index) => {
      if (index >= ports.length) {
        console.error('Failed to load development server on any port');
        return;
      }
      
      const port = ports[index];
      const url = `http://localhost:${port}`;
      
      console.log(`Trying to load from ${url}`);
      
      // Try to load the URL
      mainWindow.loadURL(url)
        .then(() => {
          console.log(`Successfully loaded from ${url}`);
          loadedSuccessfully = true;
          mainWindow.webContents.openDevTools();
        })
        .catch(err => {
          console.log(`Failed to load from ${url}:`, err);
          // Try the next port
          tryLoadPort(index + 1);
        });
    };
    
    tryLoadPort(0);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Check for updates on startup (after a short delay)
  setTimeout(() => {
    if (!isDev) {
      updateHandler.checkForUpdates()
        .then(updateInfo => {
          if (updateInfo.hasUpdate) {
            mainWindow.webContents.send('update-available', updateInfo);
          }
        })
        .catch(console.error);
    }
  }, 3000);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 