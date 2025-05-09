const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to get the path to the releases directory
const getReleasesDirectory = () => {
  // In Netlify Functions, we need to use a different path structure
  if (process.env.NETLIFY) {
    return path.join(__dirname, '..', 'releases');
  }
  
  // For local development
  return path.join(__dirname, '..', '..', 'releases');
};

// Get latest release for a specific channel
app.get('/latest/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const validChannels = ['stable', 'beta'];
    
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ error: 'Invalid channel. Must be "stable" or "beta"' });
    }
    
    const latestReleasePath = path.join(getReleasesDirectory(), `latest-${channel}.json`);
    if (fs.existsSync(latestReleasePath)) {
      const releaseData = fs.readJsonSync(latestReleasePath);
      return res.json(releaseData);
    }
    return res.status(404).json({ error: `No release information found for ${channel} channel` });
  } catch (error) {
    console.error('Error fetching latest release:', error);
    return res.status(500).json({ error: 'Failed to fetch release information' });
  }
});

// Get latest release (default to stable)
app.get('/latest', async (req, res) => {
  try {
    const latestReleasePath = path.join(getReleasesDirectory(), 'latest-stable.json');
    if (fs.existsSync(latestReleasePath)) {
      const releaseData = fs.readJsonSync(latestReleasePath);
      return res.json(releaseData);
    }
    return res.status(404).json({ error: 'No release information found' });
  } catch (error) {
    console.error('Error fetching latest release:', error);
    return res.status(500).json({ error: 'Failed to fetch release information' });
  }
});

// Get all releases for a channel
app.get('/releases/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const validChannels = ['stable', 'beta', 'all'];
    
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ error: 'Invalid channel. Must be "stable", "beta", or "all"' });
    }
    
    const releasesDir = getReleasesDirectory();
    const files = await fs.readdir(releasesDir);
    const releases = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && !file.startsWith('latest-')) {
        const releaseData = await fs.readJson(path.join(releasesDir, file));
        
        if (channel === 'all' || releaseData.channel === channel) {
          releases.push(releaseData);
        }
      }
    }
    
    // Sort by version (newest first)
    releases.sort((a, b) => {
      return new Date(b.published_at) - new Date(a.published_at);
    });
    
    return res.json(releases);
  } catch (error) {
    console.error('Error fetching releases:', error);
    return res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

// Get specific version info
app.get('/version/:version', async (req, res) => {
  try {
    const { version } = req.params;
    const versionPath = path.join(getReleasesDirectory(), `${version}.json`);
    
    if (fs.existsSync(versionPath)) {
      const releaseData = fs.readJsonSync(versionPath);
      return res.json(releaseData);
    }
    return res.status(404).json({ error: `Version ${version} not found` });
  } catch (error) {
    console.error(`Error fetching version ${req.params.version}:`, error);
    return res.status(500).json({ error: 'Failed to fetch version information' });
  }
});

// Admin API to publish a new release - should be protected in production
app.post('/admin/publish', async (req, res) => {
  try {
    const { version, notes, publishedAt, downloadUrls, mandatory, channel } = req.body;
    
    if (!version || !downloadUrls) {
      return res.status(400).json({ error: 'Version and downloadUrls are required' });
    }
    
    // Validate channel
    const validChannel = channel === 'beta' || channel === 'stable';
    if (!validChannel) {
      return res.status(400).json({ error: 'Channel must be "beta" or "stable"' });
    }
    
    const releaseInfo = {
      tag_name: `v${version}`,
      name: `NepalBooks v${version}`,
      body: notes || '',
      published_at: publishedAt || new Date().toISOString(),
      channel: channel || 'stable',
      assets: Object.entries(downloadUrls).map(([platform, url]) => ({
        platform,
        browser_download_url: url,
        name: `NepalBooks-${version}-${platform}.${platform === 'win' ? 'exe' : (platform === 'mac' ? 'dmg' : 'AppImage')}`
      })),
      mandatory: mandatory || false
    };
    
    // Save to specific version file
    fs.writeJsonSync(path.join(getReleasesDirectory(), `${version}.json`), releaseInfo, { spaces: 2 });
    
    // Update latest release for the specific channel
    fs.writeJsonSync(path.join(getReleasesDirectory(), `latest-${channel}.json`), releaseInfo, { spaces: 2 });
    
    return res.json({ success: true, message: `Published version ${version} to ${channel} channel` });
  } catch (error) {
    console.error('Error publishing release:', error);
    return res.status(500).json({ error: 'Failed to publish release' });
  }
});

// File upload for releases
app.post('/admin/upload', async (req, res) => {
  // Note: This would require file upload middleware like multer or busboy
  // Since we're in a serverless function, file uploads are better handled by using
  // pre-signed URLs for direct S3/Cloudinary uploads in a production scenario
  
  // For Netlify, direct file upload is not feasible in serverless functions
  // Consider using Netlify Large Media or another file hosting service
  return res.status(501).json({ 
    message: 'File uploads are not supported directly in serverless functions. Use direct upload to S3 or another storage service.',
    infoUrl: 'https://docs.netlify.com/large-media/overview/'
  });
});

// Not Found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Export the serverless handler
exports.handler = serverless(app); 