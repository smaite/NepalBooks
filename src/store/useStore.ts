import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';
import { DatabaseService } from '../services/DatabaseService';

export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  vatRate: number;
  stockQuantity: number;
  minStockLevel: number;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vatNumber?: string;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  vatNumber?: string;
  balance: number;
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  vat?: number;
  reference: string;
  description: string;
}

export interface Settings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  vatNumber: string;
  currency: string;
  vatRate: number;
  dateFormat: string;
  dbType: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  cloudSync: boolean;
  autoBakup: boolean;
}

interface StoreState {
  items: Item[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  settings: Settings;
  dbService: DatabaseService | null;
  
  // Actions
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  updateSettings: (settings: Partial<Settings>) => void;
  initDatabase: () => Promise<void>;
  syncWithDatabase: () => Promise<void>;
  exportData: (data: ExportData, isBackup?: boolean) => Promise<string | null>;
  importData: (isRestore?: boolean) => Promise<ExportData | null>;
}

// Define the data structure for export/import
interface ExportData {
  items: Item[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      customers: [],
      suppliers: [],
      transactions: [],
      settings: {
        businessName: 'NepalBooks',
        address: 'Kathmandu, Nepal',
        phone: '+977 1234567890',
        email: 'contact@nepalbooks.com',
        vatNumber: '123456789',
        currency: 'NPR',
        vatRate: 13,
        dateFormat: 'YYYY-MM-DD',
        dbType: 'local',
        dbHost: 'localhost',
        dbPort: '27017',
        dbName: 'nepalbooks',
        dbUser: '',
        dbPassword: '',
        cloudSync: false,
        autoBakup: true,
      },
      dbService: null,

      addItem: (item) => {
        const newItem = { ...item, id: uuidv4() };
        set((state) => ({ items: [...state.items, newItem] }));
        get().syncWithDatabase();
      },
      
      updateItem: (id, item) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...item } : i)),
        }));
        get().syncWithDatabase();
      },
      
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
        get().syncWithDatabase();
      },

      addCustomer: (customer) => {
        const newCustomer = { ...customer, id: uuidv4() };
        set((state) => ({ customers: [...state.customers, newCustomer] }));
        get().syncWithDatabase();
      },
      
      updateCustomer: (id, customer) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...customer } : c)),
        }));
        get().syncWithDatabase();
      },
      
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
        get().syncWithDatabase();
      },

      addSupplier: (supplier) => {
        const newSupplier = { ...supplier, id: uuidv4() };
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
        get().syncWithDatabase();
      },
      
      updateSupplier: (id, supplier) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...supplier } : s)),
        }));
        get().syncWithDatabase();
      },
      
      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }));
        get().syncWithDatabase();
      },

      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: uuidv4() };
        set((state) => ({ transactions: [...state.transactions, newTransaction] }));
        get().syncWithDatabase();
      },
      
      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...transaction } : t)),
        }));
        get().syncWithDatabase();
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        get().syncWithDatabase();
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        
        // Re-initialize database connection if database settings changed
        if (
          newSettings.dbType !== undefined ||
          newSettings.dbHost !== undefined ||
          newSettings.dbPort !== undefined ||
          newSettings.dbName !== undefined ||
          newSettings.dbUser !== undefined ||
          newSettings.dbPassword !== undefined
        ) {
          get().initDatabase();
        }
      },

      initDatabase: async () => {
        const { settings } = get();
        if (settings.dbType !== 'local') {
          try {
            const dbService = new DatabaseService(settings);
            await dbService.connect();
            set({ dbService });
            console.log('Database connection established');
            
            // Initial sync of data from database
            if (dbService.isConnected) {
              const data = await dbService.getAllData();
              if (data) {
                set({
                  items: data.items || [],
                  customers: data.customers || [],
                  suppliers: data.suppliers || [],
                  transactions: data.transactions || [],
                });
                console.log('Data synced from database');
              }
            }
          } catch (error) {
            console.error('Failed to initialize database connection:', error);
            set({ dbService: null });
          }
        } else {
          set({ dbService: null });
        }
      },

      syncWithDatabase: async () => {
        const { dbService, items, customers, suppliers, transactions } = get();
        if (dbService && dbService.isConnected) {
          try {
            await dbService.saveData({
              items,
              customers,
              suppliers,
              transactions,
            });
            console.log('Data synced to database');
          } catch (error) {
            console.error('Failed to sync data with database:', error);
          }
        }
      },

      exportData: async (data, isBackup = false) => {
        const { dbService } = get();
        if (dbService) {
          return await dbService.exportData(data);
        }
        return 'Database service not initialized.';
      },

      importData: async (isRestore = false) => {
        const { dbService } = get();
        if (dbService) {
          const data = await dbService.importData();
          if (data) {
            // Update the store with imported data
            set({
              items: data.items || [],
              customers: data.customers || [],
              suppliers: data.suppliers || [],
              transactions: data.transactions || [],
            });
            return data;
          }
        }
        return null;
      },
    }),
    {
      name: 'nepalbooks-storage',
    }
  )
); 