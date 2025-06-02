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
    
    // Use the custom update server
    this.updateServerUrl = 'https://mp.glorioustradehub.com/upd/api/updates';
    
    // Default to stable channel
    this.currentChannel = 'stable';
    
    // Create the updates directory if it doesn't exist
    if (!fs.existsSync(this.updateDownloadPath)) {
      fs.mkdirSync(this.updateDownloadPath, { recursive: true });
    }
    
    // Load preferred channel from storage
    this.loadPreferredChannel();
    
    // Register IPC handlers
    this.registerIPCHandlers();
  }

  loadPreferredChannel() {
    try {
      const userDataPath = app.getPath('userData');
      const settingsPath = path.join(userDataPath, 'settings.json');
      
      if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (settings.updateChannel === 'beta' || settings.updateChannel === 'stable') {
          this.currentChannel = settings.updateChannel;
        }
      }
    } catch (error) {
      console.error('Error loading preferred update channel:', error);
    }
  }

  savePreferredChannel(channel) {
    try {
      const userDataPath = app.getPath('userData');
      const settingsPath = path.join(userDataPath, 'settings.json');
      
      let settings = {};
      if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      }
      
      settings.updateChannel = channel;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error('Error saving preferred update channel:', error);
    }
  }

  registerIPCHandlers() {
    // These will be called from the renderer process
    global.electronAPI.downloadUpdate = async (_, url) => {
      return await this.downloadUpdate(url);
    };
    
    global.electronAPI.checkForUpdates = async () => {
      return await this.checkForUpdates();
    };
    
    global.electronAPI.setUpdateChannel = async (_, channel) => {
      this.currentChannel = channel;
      this.savePreferredChannel(channel);
      return await this.checkForUpdates();
    };
    
    global.electronAPI.getCurrentUpdateChannel = () => {
      return this.currentChannel;
    };
  }

  async checkForUpdates() {
    try {
      // Get current version from package.json
      const currentVersion = app.getVersion();
      
      // Fetch the latest release from our custom update server
      const response = await fetch(`${this.updateServerUrl}/latest/${this.currentChannel}`);
      if (!response.ok) {
        throw new Error(`Error fetching update: ${response.statusText}`);
      }

      const releaseData = await response.json();
      const latestVersion = releaseData.version || releaseData.tag_name?.replace('v', '');
      
      // If the latest version is newer than the current version
      if (this.isNewerVersion(latestVersion, currentVersion)) {
        // Find the appropriate download for the current platform
        const downloadUrl = this.getDownloadUrlForPlatform(releaseData);
        
        return {
          hasUpdate: true,
          version: latestVersion,
          downloadUrl: downloadUrl,
          notes: releaseData.body || '',
          publishedAt: releaseData.published_at || '',
          mandatory: releaseData.mandatory || false,
          channel: releaseData.channel || this.currentChannel
        };
      }
      
      return {
        hasUpdate: false,
        version: currentVersion,
        downloadUrl: '',
        notes: '',
        publishedAt: '',
        mandatory: false,
        channel: this.currentChannel
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return {
        hasUpdate: false,
        version: app.getVersion(),
        downloadUrl: '',
        notes: '',
        publishedAt: '',
        mandatory: false,
        channel: this.currentChannel
      };
    }
  }
  
  getDownloadUrlForPlatform(releaseData) {
    const platform = process.platform;
    let platformKey;
    
    switch (platform) {
      case 'darwin':
        platformKey = 'mac';
        break;
      case 'win32':
        platformKey = 'win';
        break;
      case 'linux':
        platformKey = 'linux';
        break;
      default:
        platformKey = 'win'; // Default to Windows if unknown
    }
    
    const asset = releaseData.assets?.find(asset => 
      asset.platform === platformKey
    );
    
    return asset ? asset.browser_download_url : '';
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
    if (!newVersion || !currentVersion) return false;
    
    // Handle beta versions
    const newIsBeta = newVersion.includes('beta') || newVersion.includes('alpha');
    const currentIsBeta = currentVersion.includes('beta') || currentVersion.includes('alpha');
    
    // Clean versions for comparison
    const cleanNewVersion = newVersion.split('-')[0];
    const cleanCurrentVersion = currentVersion.split('-')[0];
    
    const newParts = cleanNewVersion.split('.').map(part => parseInt(part, 10));
    const currentParts = cleanCurrentVersion.split('.').map(part => parseInt(part, 10));

    // Compare version numbers
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (newPart > currentPart) {
        return true;
      }
      if (newPart < currentPart) {
        return false;
      }
    }
    
    // If versions are the same, check if one is beta and the other is not
    if (newIsBeta && !currentIsBeta) {
      return false; // Current is stable, new is beta, so not newer
    }
    if (!newIsBeta && currentIsBeta) {
      return true; // Current is beta, new is stable, so newer
    }
    
    // If both are beta or both are stable with same version numbers
    if (newIsBeta && currentIsBeta) {
      // Extract beta numbers
      const newBetaMatch = newVersion.match(/beta\.?(\d+)/i);
      const currentBetaMatch = currentVersion.match(/beta\.?(\d+)/i);
      
      const newBetaNum = newBetaMatch ? parseInt(newBetaMatch[1], 10) : 0;
      const currentBetaNum = currentBetaMatch ? parseInt(currentBetaMatch[1], 10) : 0;
      
      return newBetaNum > currentBetaNum;
    }
    
    return false; // Versions are equal
  }
}

module.exports = UpdateHandler; 