// Update server API for NepalBooks
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const RELEASES_FILE = path.join(DATA_DIR, 'releases.json');

// JWT secret (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'nepal-books-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
async function ensureDataDirExists() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Create releases.json if it doesn't exist
    try {
      await fs.access(RELEASES_FILE);
    } catch (err) {
      await fs.writeFile(
        RELEASES_FILE,
        JSON.stringify({ stable: [], beta: [] }, null, 2)
      );
    }
  } catch (err) {
    console.error('Error initializing data directory:', err);
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Load releases data
async function getReleases() {
  try {
    const data = await fs.readFile(RELEASES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading releases data:', err);
    return { stable: [], beta: [] };
  }
}

// Save releases data
async function saveReleases(releases) {
  try {
    await fs.writeFile(RELEASES_FILE, JSON.stringify(releases, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving releases data:', err);
    return false;
  }
}

// Initialize data directory
ensureDataDirExists();

// API routes
// Get latest release for a channel
app.get('/api/updates/latest/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    if (channel !== 'stable' && channel !== 'beta') {
      return res.status(400).json({ error: 'Invalid channel' });
    }
    
    const releases = await getReleases();
    const channelReleases = releases[channel] || [];
    
    if (channelReleases.length === 0) {
      return res.status(404).json({ error: 'No releases found' });
    }
    
    // Return the latest release
    const latestRelease = channelReleases[0];
    res.json(latestRelease);
  } catch (err) {
    console.error('Error getting latest release:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all releases for a channel
app.get('/api/updates/releases/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    if (channel !== 'stable' && channel !== 'beta') {
      return res.status(400).json({ error: 'Invalid channel' });
    }
    
    const releases = await getReleases();
    const channelReleases = releases[channel] || [];
    
    res.json(channelReleases);
  } catch (err) {
    console.error('Error getting releases:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific version
app.get('/api/updates/version/:version', async (req, res) => {
  try {
    const { version } = req.params;
    const releases = await getReleases();
    
    // Search in both channels
    const allReleases = [...releases.stable, ...releases.beta];
    const release = allReleases.find(r => r.version === version);
    
    if (!release) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    res.json(release);
  } catch (err) {
    console.error('Error getting version:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin authentication
app.post('/api/updates/admin/auth', (req, res) => {
  const { password } = req.body;
  
  // In production, use a secure password check
  if (password === 'admin-nepal-books') { // Change this in production!
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Publish a new release (admin only)
app.post('/api/updates/admin/publish', authenticateToken, async (req, res) => {
  try {
    const { version, notes, channel, mandatory, downloadUrls } = req.body;
    
    // Basic validation
    if (!version || !notes || !channel || !downloadUrls) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (channel !== 'stable' && channel !== 'beta') {
      return res.status(400).json({ error: 'Invalid channel' });
    }
    
    // Validate at least one download URL is provided
    if (!downloadUrls.win && !downloadUrls.mac && !downloadUrls.linux) {
      return res.status(400).json({ error: 'At least one download URL is required' });
    }
    
    // Format the release object
    const newRelease = {
      version,
      notes,
      channel,
      mandatory: mandatory || false,
      publishedAt: new Date().toISOString(),
      assets: [
        ...(downloadUrls.win ? [{ platform: 'win', browser_download_url: downloadUrls.win }] : []),
        ...(downloadUrls.mac ? [{ platform: 'mac', browser_download_url: downloadUrls.mac }] : []),
        ...(downloadUrls.linux ? [{ platform: 'linux', browser_download_url: downloadUrls.linux }] : [])
      ]
    };
    
    // Load current releases
    const releases = await getReleases();
    
    // Check if version already exists in any channel
    const allReleases = [...releases.stable, ...releases.beta];
    const existingVersion = allReleases.find(r => r.version === version);
    
    if (existingVersion) {
      return res.status(409).json({ error: 'Version already exists' });
    }
    
    // Add the new release to the beginning of the array
    releases[channel] = [newRelease, ...releases[channel]];
    
    // Save the updated releases
    const saved = await saveReleases(releases);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save release' });
    }
    
    res.status(201).json({ message: 'Release published', release: newRelease });
  } catch (err) {
    console.error('Error publishing release:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Update server running on port ${PORT}`);
  console.log(`Available at: http://localhost:${PORT}/api/updates/latest/stable`);
}); 