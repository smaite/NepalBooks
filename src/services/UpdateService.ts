import { electronService } from './ElectronService';

interface ReleaseInfo {
  version: string;
  url: string;
  notes: string;
  publishedAt: string;
  mandatory: boolean;
  channel: string;
}

// Update server types
type UpdateServerType = 'github' | 'custom';

// Update channel
export type UpdateChannel = 'stable' | 'beta';

export class UpdateService {
  // Default to custom server
  private serverType: UpdateServerType = 'custom';
  
  // Default to stable channel
  private currentChannel: UpdateChannel = 'stable';
  
  // GitHub server URL (can be used as fallback)
  private githubServerUrl: string = 'https://api.github.com/repos/yourusername/nepalbooks/releases/latest';
  
  // Custom update server URL - use environment variables
  private customServerUrl: string = import.meta.env.PROD 
    ? import.meta.env.VITE_UPDATE_SERVER_URL || 'https://mp.glorioustradehub.com/upd/api/updates'
    : import.meta.env.VITE_UPDATE_SERVER_URL_DEV || 'http://localhost/nepalbooks/upd/api/updates';
  
  private currentVersion: string;

  constructor() {
    const appInfo = electronService.getAppInfo();
    this.currentVersion = appInfo.appVersion;
    
    // Check if we're in development mode to use the local server by default
    if (import.meta.env.DEV) {
      this.serverType = 'custom';
      // Default to beta channel in development
      this.currentChannel = 'beta';
    }
    
    // Try to load the preferred channel from storage
    this.loadPreferredChannel();
  }

  // Load preferred channel from storage
  private loadPreferredChannel() {
    try {
      const savedChannel = localStorage.getItem('updateChannel');
      if (savedChannel === 'beta' || savedChannel === 'stable') {
        this.currentChannel = savedChannel;
      }
    } catch (error) {
      console.error('Error loading preferred update channel:', error);
    }
  }

  // Save preferred channel to storage
  private savePreferredChannel() {
    try {
      localStorage.setItem('updateChannel', this.currentChannel);
    } catch (error) {
      console.error('Error saving preferred update channel:', error);
    }
  }

  // Get the current channel
  getCurrentChannel(): UpdateChannel {
    return this.currentChannel;
  }

  // Set the channel ('stable' or 'beta')
  setChannel(channel: UpdateChannel) {
    this.currentChannel = channel;
    this.savePreferredChannel();
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
    if (this.serverType === 'github') {
      return this.githubServerUrl;
    }
    
    // Use channel-specific endpoint based on server-update implementation
    return `${this.customServerUrl}/latest/${this.currentChannel}`;
  }

  // Get URL for all releases in the current channel
  private getReleasesUrl(): string {
    return `${this.customServerUrl}/releases/${this.currentChannel}`;
  }

  // Check for updates in the current channel
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
        version: releaseData.version || releaseData.tag_name?.replace('v', '') || '',
        url: this.getDownloadUrlForPlatform(releaseData),
        notes: releaseData.body || 'No release notes available',
        publishedAt: releaseData.published_at || new Date().toISOString(),
        mandatory: releaseData.mandatory || false,
        channel: releaseData.channel || 'stable'
      };

      console.log(`Found version ${releaseInfo.version} (${releaseInfo.channel}), current version: ${this.currentVersion}`);
      
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

  // Get all releases for the current channel
  async getAllReleases(): Promise<ReleaseInfo[]> {
    try {
      if (!electronService.isElectron) {
        console.log('Update checking is only available in Electron app');
        return [];
      }

      const releasesUrl = this.getReleasesUrl();
      console.log(`Fetching all releases from: ${releasesUrl}`);

      const response = await fetch(releasesUrl);
      if (!response.ok) {
        throw new Error(`Error fetching releases: ${response.statusText}`);
      }

      const releasesData = await response.json();
      
      // Map the response to our ReleaseInfo interface
      return releasesData.map((release: any) => ({
        version: release.version || release.tag_name?.replace('v', '') || '',
        url: this.getDownloadUrlForPlatform(release),
        notes: release.body || 'No release notes available',
        publishedAt: release.published_at || new Date().toISOString(),
        mandatory: release.mandatory || false,
        channel: release.channel || 'stable'
      }));
    } catch (error) {
      console.error('Error fetching releases:', error);
      return [];
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
      const asset = releaseData.assets?.find((asset: any) => 
        asset.name.includes(platformKey) || 
        (platformKey === 'win' && asset.name.endsWith('.exe')) ||
        (platformKey === 'mac' && asset.name.endsWith('.dmg')) ||
        (platformKey === 'linux' && asset.name.endsWith('.AppImage'))
      );
      
      return asset ? asset.browser_download_url : '';
    }
    
    // For custom server - adapted to match the server-update format
    const asset = releaseData.assets?.find((asset: any) => 
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
    // Remove beta suffix for comparison, but keep it for display
    const cleanNewVersion = newVersion.replace(/-beta.*$/, '');
    const cleanCurrentVersion = currentVersion.replace(/-beta.*$/, '');

    const newParts = cleanNewVersion.split('.').map(part => parseInt(part, 10));
    const currentParts = cleanCurrentVersion.split('.').map(part => parseInt(part, 10));

    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const numA = newParts[i] || 0;
      const numB = currentParts[i] || 0;
      if (numA > numB) {
        return true;
      }
      if (numA < numB) {
        return false;
      }
    }
    
    // If versions are equal by numbers, check if new is beta and current is not
    if (newVersion.includes('-beta') && !currentVersion.includes('-beta')) {
      return false; // Don't consider a beta newer than a stable with same version
    }
    
    // If current is beta but new is not, then new is newer
    if (!newVersion.includes('-beta') && currentVersion.includes('-beta')) {
      return true;
    }
    
    return false; // Versions are equal
  }
}

// Create a singleton instance
export const updateService = new UpdateService(); 