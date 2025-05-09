# NepalBooks Update Server

A simple update server for NepalBooks application deployed on Netlify.

## Local Development

1. Install dependencies:
   ```
   cd server-update
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

The server will run on port 3005 by default.

## Server Endpoints

The update server exposes the following endpoints:

- **GET /api/updates/latest** - Returns information about the latest release
- **GET /api/updates/version/:version** - Returns information about a specific version
- **POST /api/admin/publish** - Admin endpoint to publish a new release

## Directory Structure

- `public/` - Static assets and public files
- `src/functions/` - Source code for serverless functions
- `functions/` - Compiled serverless functions (generated during build)
- `releases/` - Release data JSON files

## Deploying to Netlify

### Manual Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Deploy to Netlify:
   ```
   npm run deploy
   ```

### Automatic Deployment

The project is set up with GitHub Actions to automatically deploy to Netlify whenever changes are pushed to the main branch.

## Using with the NepalBooks App

To use this update server with your NepalBooks application, set the `customServerUrl` in your application's update service to point to the Netlify function:

```typescript
// In src/services/UpdateService.ts
private customServerUrl: string = 'https://your-netlify-site.netlify.app/.netlify/functions/updates';
```

## Publishing Updates

To publish a new update, send a POST request to the admin endpoint with the following payload:

```json
{
  "version": "1.0.2",
  "notes": "- Added: Feature 1\n- Fixed: Bug 1\n- Improved: Performance",
  "downloadUrls": {
    "win": "https://example.com/downloads/NepalBooks-1.0.2-win.exe",
    "mac": "https://example.com/downloads/NepalBooks-1.0.2-mac.dmg",
    "linux": "https://example.com/downloads/NepalBooks-1.0.2-linux.AppImage"
  },
  "mandatory": false
}
```

This will create a new release record and update the latest.json file. 