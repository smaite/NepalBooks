// Application configuration
export const appConfig = {
  name: 'Ledger Pro',
  version: import.meta.env.VITE_APP_VERSION || '1.1.2',
  logo: {
    src: '/ledgerpro_icon.png',
    alt: 'Ledger Pro Logo',
  },
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  updateServerUrl: import.meta.env.VITE_UPDATE_SERVER_URL || 'https://mp.glorioustradehub.com/upd/api/updates',
}; 