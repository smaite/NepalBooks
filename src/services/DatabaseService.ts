import type { Settings, Item, Customer, Supplier, Transaction } from '../store/useStore';
import { electronService } from './ElectronService';

interface StoredData {
  items: Item[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
}

export class DatabaseService {
  private settings: Settings;
  private _isConnected: boolean = false;
  private localData: StoredData = {
    items: [],
    customers: [],
    suppliers: [],
    transactions: [],
  };
  private dataFilePath: string | null = null;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<boolean> {
    try {
      switch (this.settings.dbType) {
        case 'mongodb':
          return await this.connectToMongoDB();
        case 'mysql':
          return await this.connectToMySQL();
        case 'local':
        default:
          // Local storage is always connected
          this._isConnected = true;
          return true;
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      this._isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this._isConnected = false;
      return true;
    } catch (error) {
      console.error('Database disconnection failed:', error);
      return false;
    }
  }

  async getAllData(): Promise<StoredData | null> {
    try {
      switch (this.settings.dbType) {
        case 'mongodb':
          return await this.getDataFromMongoDB();
        case 'mysql':
          return await this.getDataFromMySQL();
        case 'local':
        default:
          // Retrieve data from local storage
          return this.getDataFromLocal();
      }
    } catch (error) {
      console.error('Failed to get data from database:', error);
      return null;
    }
  }

  async saveData(data: StoredData): Promise<boolean> {
    try {
      switch (this.settings.dbType) {
        case 'mongodb':
          return await this.saveDataToMongoDB(data);
        case 'mysql':
          return await this.saveDataToMySQL(data);
        case 'local':
        default:
          // Save data to local storage
          return await this.saveDataToLocal(data);
      }
    } catch (error) {
      console.error('Failed to save data to database:', error);
      return false;
    }
  }

  async exportData(data: StoredData): Promise<string | null> {
    try {
      if (electronService.isElectron) {
        // Using Electron
        const options = {
          title: 'Export NepalBooks Data',
          defaultPath: 'nepalbooks-data.json',
          filters: [
            { name: 'JSON Files', extensions: ['json'] }
          ]
        };
        
        const result = await electronService.saveFile(options, JSON.stringify(data, null, 2));
        return result ? 'Data exported successfully.' : 'Export cancelled.';
      } else {
        // Fallback for browser
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "nepalbooks-data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        return 'Data exported successfully.';
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      return 'Failed to export data.';
    }
  }
  
  async importData(): Promise<StoredData | null> {
    try {
      if (electronService.isElectron) {
        // Using Electron
        const options = {
          title: 'Import NepalBooks Data',
          filters: [
            { name: 'JSON Files', extensions: ['json'] }
          ],
          properties: ['openFile']
        };
        
        const result = await electronService.openFile(options);
        if (result && result.content) {
          return JSON.parse(result.content) as StoredData;
        }
        return null;
      } else {
        // Fallback for browser (would need a file input in the UI)
        console.warn('Import in browser mode not implemented');
        return null;
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      return null;
    }
  }

  // MongoDB implementation
  private async connectToMongoDB(): Promise<boolean> {
    try {
      // In a real app, this would use a MongoDB driver to connect
      console.log('Connecting to MongoDB...', {
        host: this.settings.dbHost,
        port: this.settings.dbPort,
        dbName: this.settings.dbName,
      });
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this._isConnected = true;
      return true;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      this._isConnected = false;
      throw error;
    }
  }

  private async getDataFromMongoDB(): Promise<StoredData> {
    console.log('Getting data from MongoDB...');
    // Simulate database fetch delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.localData; // For now, just return local data
  }

  private async saveDataToMongoDB(data: StoredData): Promise<boolean> {
    console.log('Saving data to MongoDB...');
    // Simulate database save delay
    await new Promise(resolve => setTimeout(resolve, 300));
    this.localData = { ...data };
    return true;
  }

  // MySQL implementation
  private async connectToMySQL(): Promise<boolean> {
    try {
      // In a real app, this would use a MySQL driver to connect
      console.log('Connecting to MySQL...', {
        host: this.settings.dbHost,
        port: this.settings.dbPort,
        dbName: this.settings.dbName,
      });
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this._isConnected = true;
      return true;
    } catch (error) {
      console.error('MySQL connection failed:', error);
      this._isConnected = false;
      throw error;
    }
  }

  private async getDataFromMySQL(): Promise<StoredData> {
    console.log('Getting data from MySQL...');
    // Simulate database fetch delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.localData; // For now, just return local data
  }

  private async saveDataToMySQL(data: StoredData): Promise<boolean> {
    console.log('Saving data to MySQL...');
    // Simulate database save delay
    await new Promise(resolve => setTimeout(resolve, 300));
    this.localData = { ...data };
    return true;
  }

  // Local storage implementation
  private getDataFromLocal(): StoredData {
    try {
      // Check if we're in Electron
      if (electronService.isElectron) {
        // Try to read from the data file
        const filePathFromStorage = localStorage.getItem('nepalbooks-data-file-path');
        if (filePathFromStorage) {
          this.dataFilePath = filePathFromStorage;
          // Use a promise to read file content
          return new Promise<StoredData>((resolve) => {
            electronService.readFile(this.dataFilePath!)
              .then(content => {
                if (content) {
                  try {
                    const parsedData = JSON.parse(content) as StoredData;
                    this.localData = parsedData;
                    resolve(parsedData);
                  } catch (err) {
                    console.error('Error parsing data file:', err);
                    resolve(this.localData);
                  }
                } else {
                  resolve(this.localData);
                }
              })
              .catch(err => {
                console.error('Error reading data file:', err);
                resolve(this.localData);
              });
          }) as any; // Use Promise as any for simplicity
        }
      } else {
        // Browser mode
        const storedData = localStorage.getItem('nepalbooks-data');
        if (storedData) {
          try {
            return JSON.parse(storedData);
          } catch (err) {
            console.error('Error parsing stored data:', err);
          }
        }
      }
      return this.localData;
    } catch (error) {
      console.error('Failed to get data from local storage:', error);
      return this.localData;
    }
  }

  private async saveDataToLocal(data: StoredData): Promise<boolean> {
    try {
      this.localData = { ...data };
      
      // Check if we're in Electron
      if (electronService.isElectron) {
        if (!this.dataFilePath) {
          // If we don't have a file path yet, use the app data directory
          const savedPath = localStorage.getItem('nepalbooks-data-file-path');
          if (savedPath) {
            this.dataFilePath = savedPath;
          } else {
            // Ask user where to save the data file the first time
            const options = {
              title: 'Save NepalBooks Data File',
              defaultPath: 'nepalbooks-data.json',
              filters: [
                { name: 'JSON Files', extensions: ['json'] }
              ]
            };
            
            const success = await electronService.saveFile(
              options, 
              JSON.stringify(data, null, 2)
            );
            
            if (success && options.defaultPath) {
              this.dataFilePath = options.defaultPath;
              localStorage.setItem('nepalbooks-data-file-path', this.dataFilePath);
            }
            
            return success;
          }
        }
        
        // Now save to the file
        if (this.dataFilePath) {
          return await electronService.writeFile(
            this.dataFilePath,
            JSON.stringify(data, null, 2)
          );
        }
        
        // Fallback to localStorage if file operations fail
        localStorage.setItem('nepalbooks-data', JSON.stringify(data));
        return true;
      } else {
        // Browser mode
        localStorage.setItem('nepalbooks-data', JSON.stringify(data));
        return true;
      }
    } catch (error) {
      console.error('Failed to save data to local storage:', error);
      return false;
    }
  }
} 