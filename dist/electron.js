const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Check if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Set app name
app.name = 'Ledger Pro';
app.setName('Ledger Pro');

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'ledgerpro_icon.png'),
    frame: true, // Standard window frame with default controls
    titleBarStyle: 'default',
    title: 'Ledger Pro - Accounting Software',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow loading local resources
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // Set the app icon
  mainWindow.setIcon(path.join(__dirname, 'ledgerpro_icon.png'));

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
          
          // Open DevTools if in development
          if (isDev) {
            mainWindow.webContents.openDevTools();
          }
        })
        .catch(err => {
          console.log(`Failed to load from ${url}:`, err);
          // Try the next port
          tryLoadPort(index + 1);
        });
    };
    
    tryLoadPort(0);
  } else {
    const startUrl = `file://${path.join(__dirname, '../dist/index.html')}`;
    console.log('Loading URL:', startUrl);
    mainWindow.loadURL(startUrl);
  }

  // Create menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          click() {
            mainWindow.webContents.send('menu-export-data');
          }
        },
        {
          label: 'Import Data',
          click() {
            mainWindow.webContents.send('menu-import-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Backup',
          click() {
            mainWindow.webContents.send('menu-backup');
          }
        },
        {
          label: 'Restore',
          click() {
            mainWindow.webContents.send('menu-restore');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            dialog.showMessageBox(mainWindow, {
              title: 'About Ledger Pro',
              message: 'Ledger Pro - Accounting Software',
              detail: 'Version 1.2.0\nCopyright © 2023-2024\n\nA comprehensive accounting solution for businesses.',
              buttons: ['OK'],
              icon: path.join(__dirname, 'ledgerpro_icon.png')
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Handle IPC messages from renderer process

// Window control handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Save file dialog
ipcMain.handle('show-save-dialog', async (event, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog(options);
  if (canceled) {
    return null;
  } else {
    return filePath;
  }
});

// Open file dialog
ipcMain.handle('show-open-dialog', async (event, options) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(options);
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

// Read file
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

// Write file
ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data);
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
});

// App info handler
ipcMain.handle('get-app-info', () => {
  return {
    isElectron: true,
    platform: process.platform,
    appVersion: app.getVersion()
  };
}); 