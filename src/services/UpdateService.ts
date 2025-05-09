import { electronService } from './ElectronService';

interface ReleaseInfo {
  version: string;
  url: string;
  notes: string;
  publishedAt: string;
  mandatory: boolean;
}

// Update server types
type UpdateServerType = 'github' | 'custom';

export class UpdateService {
  // Default to GitHub server
  private serverType: UpdateServerType = 'custom';
  
  // GitHub server URL (can be used as fallback)
  private githubServerUrl: string = 'https://api.github.com/repos/yourusername/nepalbooks/releases/latest';
  
  // Custom update server URL
  private customServerUrl: string = import.meta.env.PROD 
    ? 'https://nepalbooks-updates.netlify.app/.netlify/functions/updates' 
    : 'http://localhost:3005/api/updates/latest';
  
  private currentVersion: string;

  constructor() {
    const appInfo = electronService.getAppInfo();
    this.currentVersion = appInfo.appVersion;
    
    // Check if we're in development mode to use the local server by default
    if (import.meta.env.DEV) {
      this.serverType = 'custom';
    }
  }

  // Set the server type ('github' or 'custom')
  setServerType(type: UpdateServerType) {
    this.serverType = type;
  }

  // Set custom server URL
  setCustomServerUrl(url: string) {
    this.customServerUrl = url;
  }

  // Set GitHub repository
  setGitHubRepo(owner: string, repo: string) {
    this.githubServerUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  }

  // Get the current active update server URL
  private getUpdateServerUrl(): string {
    return this.serverType === 'github' ? this.githubServerUrl : this.customServerUrl;
  }

  async checkForUpdates(): Promise<ReleaseInfo | null> {
    try {
      if (!electronService.isElectron) {
        console.log('Update checking is only available in Electron app');
        return null;
      }

      const updateServerUrl = this.getUpdateServerUrl();
      console.log(`Checking for updates from: ${updateServerUrl}`);

      const response = await fetch(updateServerUrl);
      if (!response.ok) {
        throw new Error(`Error fetching update: ${response.statusText}`);
      }

      const releaseData = await response.json();
      
      // Format the response to our ReleaseInfo interface
      const releaseInfo: ReleaseInfo = {
        version: releaseData.tag_name.replace('v', ''),
        url: this.getDownloadUrlForPlatform(releaseData),
        notes: releaseData.body || 'No release notes available',
        publishedAt: releaseData.published_at,
        mandatory: releaseData.body?.includes('#mandatory') || false
      };

      console.log(`Found version ${releaseInfo.version}, current version: ${this.currentVersion}`);
      
      // Compare versions to see if update is needed
      if (this.isNewerVersion(releaseInfo.version, this.currentVersion)) {
        return releaseInfo;
      }
      
      return null; // No update needed
    } catch (error) {
      console.error('Error checking for updates:', error);
      
      // If primary server fails, try the fallback
      if (this.serverType === 'custom') {
        console.log('Trying GitHub fallback...');
        this.serverType = 'github';
        return this.checkForUpdates();
      }
      
      return null;
    }
  }

  // Get the appropriate download URL for the current platform
  private getDownloadUrlForPlatform(releaseData: any): string {
    const platform = electronService.getAppInfo().platform;
    let platformKey: string;
    
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
    
    // For GitHub releases
    if (this.serverType === 'github') {
      const asset = releaseData.assets.find((asset: any) => 
        asset.name.includes(platformKey) || 
        (platformKey === 'win' && asset.name.endsWith('.exe')) ||
        (platformKey === 'mac' && asset.name.endsWith('.dmg')) ||
        (platformKey === 'linux' && asset.name.endsWith('.AppImage'))
      );
      
      return asset ? asset.browser_download_url : '';
    }
    
    // For custom server
    const asset = releaseData.assets.find((asset: any) => 
      asset.platform === platformKey
    );
    
    return asset ? asset.browser_download_url : '';
  }

  async downloadUpdate(url: string): Promise<boolean> {
    try {
      if (!electronService.isElectron) {
        return false;
      }

      // Send message to electron to download and install update
      const result = await electronService.downloadUpdate(url);
      return result;
    } catch (error) {
      console.error('Error downloading update:', error);
      return false;
    }
  }

  // Compare versions (semver)
  private isNewerVersion(newVersion: string, currentVersion: string): boolean {
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

// Create a singleton instance
export const updateService = new UpdateService(); 