# NepalBooks - Accounting Software

A modern accounting software built for Nepali businesses with VAT support, featuring a beautiful dark glassmorphic UI and mobile support.

## Features

- 💰 Nepali currency (रू) support
- 📊 VAT calculation and reporting
- 📱 Responsive design with mobile support
- 🎨 Dark glassmorphic UI
- 📈 Interactive charts and reports
- 💾 Data persistence
- 🔄 Real-time updates
- 🌐 Multi-language support (Nepali/English)
- 💻 Cross-platform (Web, Desktop, Mobile)

## Tech Stack

- React
- TypeScript
- Mantine UI
- Chart.js
- Electron
- Vite
- Zustand (State Management)

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nepalbooks.git
   cd nepalbooks
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For desktop app development:
   ```bash
   npm run electron:dev
   ```

## Building

### Web App
```bash
npm run build
```

### Desktop App
```bash
npm run electron:build
```

## Project Structure

```
nepalbooks/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── store/          # State management
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── electron/           # Electron main process
├── public/            # Static assets
└── package.json       # Project configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@nepalbooks.com or join our Slack channel.
