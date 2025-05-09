const { app, autoUpdater, dialog } = require('electron');
const { download } = require('electron-dl');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

class UpdateHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.updateDownloadPath = path.join(app.getPath('userData'), 'updates');
    this.updateServerUrl = 'https://api.github.com/repos/yourusername/nepalbooks/releases/latest';
    
    // Create the updates directory if it doesn't exist
    if (!fs.existsSync(this.updateDownloadPath)) {
      fs.mkdirSync(this.updateDownloadPath, { recursive: true });
    }
    
    // Register IPC handlers
    this.registerIPCHandlers();
  }

  registerIPCHandlers() {
    // These will be called from the renderer process
    global.electronAPI.downloadUpdate = async (_, url) => {
      return await this.downloadUpdate(url);
    };
    
    global.electronAPI.checkForUpdates = async () => {
      return await this.checkForUpdates();
    };
  }

  async checkForUpdates() {
    try {
      // Get current version from package.json
      const currentVersion = app.getVersion();
      
      // Fetch the latest release from GitHub
      const response = await fetch(this.updateServerUrl);
      if (!response.ok) {
        throw new Error(`Error fetching update: ${response.statusText}`);
      }

      const releaseData = await response.json();
      const latestVersion = releaseData.tag_name.replace('v', '');
      
      // If the latest version is newer than the current version
      if (this.isNewerVersion(latestVersion, currentVersion)) {
        return {
          hasUpdate: true,
          version: latestVersion,
          downloadUrl: releaseData.assets[0]?.browser_download_url || ''
        };
      }
      
      return {
        hasUpdate: false,
        version: currentVersion,
        downloadUrl: ''
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return {
        hasUpdate: false,
        version: app.getVersion(),
        downloadUrl: ''
      };
    }
  }

  async downloadUpdate(url) {
    try {
      // First, clean up any old updates
      this.cleanUpdateDirectory();
      
      // Download the update
      const downloadOptions = {
        directory: this.updateDownloadPath,
        onProgress: (progress) => {
          // Send download progress to renderer if needed
          this.mainWindow.webContents.send('update-progress', progress);
        }
      };
      
      const dl = await download(this.mainWindow, url, downloadOptions);
      const filePath = dl.getSavePath();
      
      // Ask the user if they want to install the update now
      const dialogOptions = {
        type: 'info',
        buttons: ['Install Now', 'Install Later'],
        defaultId: 0,
        title: 'Update Downloaded',
        message: 'The update has been downloaded. Do you want to install it now?'
      };
      
      const response = await dialog.showMessageBox(this.mainWindow, dialogOptions);
      
      if (response.response === 0) { // 'Install Now'
        this.installUpdate(filePath);
      }
      
      return true;
    } catch (error) {
      console.error('Error downloading update:', error);
      return false;
    }
  }

  installUpdate(filePath) {
    // Different installation methods based on OS
    const platform = process.platform;
    
    if (platform === 'win32') {
      // For Windows (.exe or .msi)
      exec(`"${filePath}"`, (error) => {
        if (error) {
          console.error('Error installing update:', error);
          return;
        }
        app.quit();
      });
    } else if (platform === 'darwin') {
      // For MacOS (.dmg)
      exec(`open "${filePath}"`, (error) => {
        if (error) {
          console.error('Error installing update:', error);
          return;
        }
        app.quit();
      });
    } else if (platform === 'linux') {
      // For Linux (.deb, .rpm, etc.)
      const extension = path.extname(filePath).toLowerCase();
      let command = '';
      
      if (extension === '.deb') {
        command = `sudo dpkg -i "${filePath}"`;
      } else if (extension === '.rpm') {
        command = `sudo rpm -U "${filePath}"`;
      } else if (extension === '.AppImage') {
        // Make it executable
        fs.chmodSync(filePath, '755');
        command = `"${filePath}"`;
      }
      
      if (command) {
        exec(command, (error) => {
          if (error) {
            console.error('Error installing update:', error);
            return;
          }
          app.quit();
        });
      }
    }
  }

  cleanUpdateDirectory() {
    try {
      // Remove all files in the update directory
      const files = fs.readdirSync(this.updateDownloadPath);
      for (const file of files) {
        fs.unlinkSync(path.join(this.updateDownloadPath, file));
      }
    } catch (error) {
      console.error('Error cleaning update directory:', error);
    }
  }

  // Compare versions (semver)
  isNewerVersion(newVersion, currentVersion) {
    const newParts = newVersion.split('.').map(part => parseInt(part, 10));
    const currentParts = currentVersion.split('.').map(part => parseInt(part, 10));

    for (let i = 0; i < newParts.length; i++) {
      if (newParts[i] > (currentParts[i] || 0)) {
        return true;
      }
      if (newParts[i] < (currentParts[i] || 0)) {
        return false;
      }
    }
    return false; // Versions are equal
  }
}

module.exports = UpdateHandler; 