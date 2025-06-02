# Ledger Pro - Comprehensive Accounting Software

A comprehensive accounting software with a modern UI, inventory management, and cross-platform capabilities.

## Features

- **Complete Accounting System**: Track income, expenses, sales, purchases, and taxes
- **Dark Glassmorphic UI**: Modern interface with responsive design
- **Dashboards & Analytics**: Real-time financial metrics and visualizations
- **Inventory Management**: Track stock, purchases, and sales
- **Multi-language**: Support for multiple languages
- **Cross-platform**: Available on Web, Windows, macOS, and Linux
- **Automatic Updates**: In-app update notification and installation

## Technology Stack

- **Frontend**: React, TypeScript, Mantine UI, Chart.js
- **State Management**: Zustand
- **Desktop Integration**: Electron
- **Build Tools**: Vite

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ledgerpro.git
cd ledgerpro

# Install dependencies
npm install

# Start development server
npm run dev

# For Electron development
npm run dev:electron
```

### Build

```bash
# Build for web
npm run build

# Build for desktop
npm run build:electron
```

## Update Server

Ledger Pro includes an automated update system for desktop applications. The update server is available at [https://mp.glorioustradehub.com/upd/](https://mp.glorioustradehub.com/upd/).

### Admin Console

For development and testing, you can access the admin console by opening your browser's developer tools console and typing:

```javascript
updateAdmin.showAdminPanel()
```

This will display a UI for managing releases and publishing updates.

### Update Server Features

- Separate stable and beta release channels
- Platform-specific update packages (Windows, macOS, Linux)
- Mandatory update enforcement
- Release notes management

For more information about the update server, see the [server documentation](./server/README.md).

## License

This project is licensed under the MIT License.

## Support

For support, please contact [support@ledgerpro.com](mailto:support@ledgerpro.com) or open an issue on GitHub.
