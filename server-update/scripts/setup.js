const fs = require('fs-extra');
const path = require('path');

// Create necessary directories
const releasesDir = path.join(__dirname, '..', 'releases');
const functionsDir = path.join(__dirname, '..', 'functions');
const srcFunctionsDir = path.join(__dirname, '..', 'src', 'functions');
const publicDir = path.join(__dirname, '..', 'public');
const functionReleasesDir = path.join(__dirname, '..', 'functions', 'releases');

// Ensure directories exist
fs.ensureDirSync(releasesDir);
fs.ensureDirSync(functionsDir);
fs.ensureDirSync(srcFunctionsDir);
fs.ensureDirSync(publicDir);
fs.ensureDirSync(functionReleasesDir);

// Create a sample latest.json file if it doesn't exist
const latestJsonPath = path.join(releasesDir, 'latest.json');
if (!fs.existsSync(latestJsonPath)) {
  const sampleRelease = {
    tag_name: 'v1.0.0',
    name: 'NepalBooks v1.0.0',
    body: 'Initial release',
    published_at: new Date().toISOString(),
    assets: [
      {
        platform: 'win',
        browser_download_url: 'https://example.com/NepalBooks-1.0.0-win.exe',
        name: 'NepalBooks-1.0.0-win.exe'
      }
    ],
    mandatory: false
  };
  
  fs.writeJsonSync(latestJsonPath, sampleRelease, { spaces: 2 });
  fs.writeJsonSync(path.join(functionReleasesDir, 'latest.json'), sampleRelease, { spaces: 2 });
  console.log('Created sample latest.json file');
}

// Copy releases to functions/releases
fs.copySync(releasesDir, functionReleasesDir);

console.log('Setup completed successfully!'); 