const fs = require('fs-extra');
const path = require('path');

// Create necessary directories
const releasesDir = path.join(__dirname, '..', 'releases');
const functionsDir = path.join(__dirname, '..', 'functions');
const srcFunctionsDir = path.join(__dirname, '..', 'src', 'functions');
const publicDir = path.join(__dirname, '..', 'public');
const functionReleasesDir = path.join(__dirname, '..', 'functions', 'releases');
const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');

// Ensure directories exist
fs.ensureDirSync(releasesDir);
fs.ensureDirSync(functionsDir);
fs.ensureDirSync(srcFunctionsDir);
fs.ensureDirSync(publicDir);
fs.ensureDirSync(functionReleasesDir);
fs.ensureDirSync(downloadsDir);

// Create sample stable release
const stableReleasePath = path.join(releasesDir, 'latest-stable.json');
if (!fs.existsSync(stableReleasePath)) {
  const stableRelease = {
    tag_name: 'v1.0.0',
    name: 'NepalBooks v1.0.0',
    body: 'Initial stable release',
    published_at: new Date().toISOString(),
    channel: 'stable',
    assets: [
      {
        platform: 'win',
        browser_download_url: 'https://example.com/NepalBooks-1.0.0-win.exe',
        name: 'NepalBooks-1.0.0-win.exe'
      }
    ],
    mandatory: false
  };
  
  // Write the stable release files
  fs.writeJsonSync(stableReleasePath, stableRelease, { spaces: 2 });
  fs.writeJsonSync(path.join(releasesDir, '1.0.0.json'), stableRelease, { spaces: 2 });
  fs.writeJsonSync(path.join(functionReleasesDir, 'latest-stable.json'), stableRelease, { spaces: 2 });
  fs.writeJsonSync(path.join(functionReleasesDir, '1.0.0.json'), stableRelease, { spaces: 2 });
  console.log('Created sample stable release files');
}

// Create sample beta release
const betaReleasePath = path.join(releasesDir, 'latest-beta.json');
if (!fs.existsSync(betaReleasePath)) {
  const betaRelease = {
    tag_name: 'v1.1.0-beta',
    name: 'NepalBooks v1.1.0-beta',
    body: 'Beta release with new features\n- Added: Feature 1\n- Improved: Feature 2',
    published_at: new Date().toISOString(),
    channel: 'beta',
    assets: [
      {
        platform: 'win',
        browser_download_url: 'https://example.com/NepalBooks-1.1.0-beta-win.exe',
        name: 'NepalBooks-1.1.0-beta-win.exe'
      }
    ],
    mandatory: false
  };
  
  // Write the beta release files
  fs.writeJsonSync(betaReleasePath, betaRelease, { spaces: 2 });
  fs.writeJsonSync(path.join(releasesDir, '1.1.0-beta.json'), betaRelease, { spaces: 2 });
  fs.writeJsonSync(path.join(functionReleasesDir, 'latest-beta.json'), betaRelease, { spaces: 2 });
  fs.writeJsonSync(path.join(functionReleasesDir, '1.1.0-beta.json'), betaRelease, { spaces: 2 });
  console.log('Created sample beta release files');
}

// Create a README file in the downloads directory
const downloadsReadmePath = path.join(downloadsDir, 'README.md');
if (!fs.existsSync(downloadsReadmePath)) {
  const readmeContent = `# Downloads Directory

This directory is for storing download files for the application updates.

## Structure

Organize files by version and platform:

- NepalBooks-1.0.0-win.exe
- NepalBooks-1.0.0-mac.dmg
- NepalBooks-1.0.0-linux.AppImage

## Adding Files

Place new release binaries in this directory and reference them in the admin publish API.`;

  fs.writeFileSync(downloadsReadmePath, readmeContent);
  console.log('Created downloads directory README');
}

// Copy releases to functions/releases
fs.copySync(releasesDir, functionReleasesDir);

console.log('Setup completed successfully!'); 