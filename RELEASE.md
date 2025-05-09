# NepalBooks Release Process

This document outlines the process for creating new releases of NepalBooks that will be automatically detected by the in-app update system.

## Creating a New Release

1. Update the version number in `package.json`
2. Make your code changes
3. Build the application for all platforms:
   ```
   npm run electron:build       # Windows
   npm run electron:build:mac   # macOS
   npm run electron:build:linux # Linux
   ```
4. Create a new release on GitHub:
   - Go to your GitHub repository
   - Click on "Releases" in the sidebar
   - Click "Draft a new release"
   - Tag version: `v1.0.x` (matching your package.json version)
   - Release title: `NepalBooks v1.0.x`
   - Description: Include release notes with bullet points for changes
     - Use `- Fixed: ...` for bug fixes
     - Use `- Added: ...` for new features
     - Use `- Improved: ...` for enhancements
     - Add `#mandatory` at the bottom if this is a required update
   - Upload the built binaries from the `release` folder
   - Publish the release

## Automatic Updates

The application includes an automatic update system that:

1. Checks for updates on startup
2. Shows a notification when updates are available
3. Allows users to download and install updates directly from the app

### How Users Get Updates

When a new release is published on GitHub:

1. Users will see an update notification in the bottom-right corner
2. Clicking on it shows release notes and update details
3. They can choose to update now or later (unless it's marked as mandatory)
4. The update downloads in the background
5. Once downloaded, the installer launches automatically

## Testing Updates

To test the update system:

1. Build and install an older version of the app
2. Create a new release on GitHub with a higher version number
3. Start the installed app and verify it detects the update

## Troubleshooting

If users report issues with updates:

- Verify the release assets are correctly uploaded on GitHub
- Ensure the version number in package.json is higher than previous releases
- Check that binaries are built correctly and are not corrupted
- Look for errors in the application logs 