// Define the Electron API interface
export interface ElectronAPI {
  saveFile: (options: SaveDialogOptions, data: string) => Promise<boolean>;
  openFile: (options: OpenDialogOptions) => Promise<{ path: string; content: string } | null>;
  readFile: (filePath: string) => Promise<string | null>;
  writeFile: (filePath: string, data: string) => Promise<boolean>;
  getAppInfo: () => { isElectron: boolean; platform: string; appVersion: string };
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  downloadUpdate: (url: string) => Promise<boolean>;
  checkForUpdates: () => Promise<{ hasUpdate: boolean; version: string; downloadUrl: string }>;
  minimizeWindow: () => Promise<boolean>;
  maximizeWindow: () => Promise<boolean>;
  closeWindow: () => Promise<boolean>;
  isWindowMaximized: () => Promise<boolean>;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
  properties?: string[];
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

class ElectronService {
  private electron: ElectronAPI | undefined;

  constructor() {
    try {
      this.electron = (window as { electron?: ElectronAPI }).electron;
      
      // Log initialization status to help with debugging
      console.log('ElectronService initialized:', {
        isElectron: !!this.electron,
        environment: import.meta.env.MODE
      });
    } catch (error) {
      console.error('Error initializing ElectronService:', error);
      this.electron = undefined;
    }
  }

  get isElectron(): boolean {
    return !!this.electron;
  }

  get isDev(): boolean {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  async saveFile(options: SaveDialogOptions, data: string): Promise<boolean> {
    if (this.isElectron) {
      return await this.electron!.saveFile(options, data);
    }
    return false;
  }

  async openFile(options: OpenDialogOptions): Promise<{ path: string; content: string } | null> {
    if (this.isElectron) {
      return await this.electron!.openFile(options);
    }
    return null;
  }

  async readFile(filePath: string): Promise<string | null> {
    if (this.isElectron) {
      return await this.electron!.readFile(filePath);
    }
    return null;
  }

  async writeFile(filePath: string, data: string): Promise<boolean> {
    if (this.isElectron) {
      return await this.electron!.writeFile(filePath, data);
    }
    return false;
  }

  getAppInfo(): { isElectron: boolean; platform: string; appVersion: string } {
    if (this.isElectron) {
      return this.electron!.getAppInfo();
    }
    return {
      isElectron: false,
      platform: 'browser',
      appVersion: '1.0.0'
    };
  }

  on(channel: string, callback: (...args: unknown[]) => void): void {
    if (this.isElectron) {
      this.electron!.on(channel, callback);
    }
  }

  async downloadUpdate(url: string): Promise<boolean> {
    if (this.isElectron) {
      return await this.electron!.downloadUpdate(url);
    }
    return false;
  }

  async checkForUpdates(): Promise<{ hasUpdate: boolean; version: string; downloadUrl: string }> {
    if (this.isElectron) {
      return await this.electron!.checkForUpdates();
    }
    return { hasUpdate: false, version: '', downloadUrl: '' };
  }

  async minimizeWindow(): Promise<boolean> {
    if (this.isElectron) {
      return await this.electron!.minimizeWindow();
    }
    return false;
  }

  async maximizeWindow(): Promise<boolean> {
    if (this.isElectron) {
      return await this.electron!.maximizeWindow();
    }
    return false;
  }

  async closeWindow(): Promise<boolean> {
    if (this.isElectron) {
      return await this.electron!.closeWindow();
    }
    return false;
  }

  async isWindowMaximized(): Promise<boolean> {
    if (this.isElectron) {
      return await this.electron!.isWindowMaximized();
    }
    return false;
  }
}

// Create a singleton instance
export const electronService = new ElectronService(); 