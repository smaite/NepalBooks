# NepalBooks Update Server

A Node.js based update server for the NepalBooks accounting application. This server provides endpoints for checking and downloading updates for different platforms.

## Features
- Version management
- Separate stable and beta release channels
- Platform-specific update packages (Windows, macOS, Linux)
- Admin authentication for publishing updates
- JSON-based storage (no database required)

## API Endpoints

### Public Endpoints
- `GET /api/updates/latest/:channel` - Get the latest release for a specific channel (stable or beta)
- `GET /api/updates/releases/:channel` - Get all releases for a specific channel
- `GET /api/updates/version/:version` - Get information for a specific version

### Admin Endpoints
- `POST /api/updates/admin/auth` - Authenticate as admin (requires password)
- `POST /api/updates/admin/publish` - Publish a new release (requires auth token)

## Deployment Instructions

### Prerequisites
- Node.js v14 or higher
- npm or yarn

### Installation
1. Clone this repository:
   ```
   git clone https://github.com/your-username/nepalbooks-update-server.git
   cd nepalbooks-update-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the server (optional):
   - Set JWT_SECRET environment variable (recommended for production)
   - Modify the admin password in api.js

4. Start the server:
   ```
   npm start
   ```

### Deployment to Netlify

1. Create a new Netlify site
2. Connect your GitHub repository
3. Set build command to `npm install`
4. Set publish directory to `server`
5. Set environment variables:
   - JWT_SECRET: A secure secret for JWT token generation

## Publishing Updates

There are two ways to publish updates:

### 1. Using the Admin API

```javascript
// Example: Publishing a new release
fetch('https://up-books.netlify.app/api/updates/admin/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'your-admin-password' })
})
.then(res => res.json())
.then(data => {
  const token = data.token;
  
  // Now publish the release
  return fetch('https://up-books.netlify.app/api/updates/admin/publish', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      version: '1.0.0',
      notes: 'Initial release',
      channel: 'stable',
      mandatory: false,
      downloadUrls: {
        win: 'https://example.com/downloads/NepalBooks-1.0.0-win.exe',
        mac: 'https://example.com/downloads/NepalBooks-1.0.0-mac.dmg',
        linux: 'https://example.com/downloads/NepalBooks-1.0.0-linux.AppImage'
      }
    })
  });
})
.then(res => res.json())
.then(data => console.log('Release published:', data));
```

### 2. Using the Admin Console in NepalBooks App

When running the NepalBooks application in development mode, you can access the admin console by opening your browser's developer tools console and typing:

```javascript
updateAdmin.showAdminPanel()
```

This will display a UI for publishing new releases.

## Data Structure

Releases are stored in `data/releases.json` with the following structure:

```json
{
  "stable": [
    {
      "version": "1.0.0",
      "notes": "Initial release",
      "channel": "stable",
      "mandatory": false,
      "publishedAt": "2023-01-01T00:00:00.000Z",
      "assets": [
        {
          "platform": "win",
          "browser_download_url": "https://example.com/downloads/NepalBooks-1.0.0-win.exe"
        },
        {
          "platform": "mac",
          "browser_download_url": "https://example.com/downloads/NepalBooks-1.0.0-mac.dmg"
        }
      ]
    }
  ],
  "beta": []
}
```

## License

This project is licensed under the MIT License. 