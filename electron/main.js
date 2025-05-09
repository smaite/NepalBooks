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
    },
    backgroundColor: '#1a1b1e',
    titleBarStyle: 'hidden',
    frame: false,
  });

  // Initialize the update handler
  const updateHandler = new UpdateHandler(mainWindow);

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
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