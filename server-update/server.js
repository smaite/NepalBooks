const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ADMIN_CREDENTIALS, JWT_SECRET } = require('./src/config/admin');
const authMiddleware = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Import the updates function handler
const updatesHandler = require('./src/functions/updates');

// Helper to convert serverless function responses to Express
const serverlessToExpress = (serverlessHandler) => async (req, res) => {
  try {
    const result = await serverlessHandler({
      path: req.path,
      httpMethod: req.method,
      headers: req.headers,
      queryStringParameters: req.query,
      body: JSON.stringify(req.body),
      isBase64Encoded: false,
    }, {});

    // Set status code
    res.status(result.statusCode);

    // Set headers
    if (result.headers) {
      Object.keys(result.headers).forEach(header => {
        res.setHeader(header, result.headers[header]);
      });
    }

    // Send response body
    if (result.body) {
      return res.send(result.isBase64Encoded ? 
        Buffer.from(result.body, 'base64') : 
        result.body
      );
    }

    return res.send();
  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin login route
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Hash the provided password
  const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

  // Check credentials
  if (
    username === ADMIN_CREDENTIALS.username &&
    hashedPassword === ADMIN_CREDENTIALS.password
  ) {
    // Generate JWT token
    const token = jwt.sign(
      { username: ADMIN_CREDENTIALS.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        username: ADMIN_CREDENTIALS.username,
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Public routes
app.all('/api/updates/latest', serverlessToExpress(updatesHandler.handler));
app.all('/api/updates/latest/:channel', serverlessToExpress(updatesHandler.handler));
app.all('/api/updates/releases/:channel', serverlessToExpress(updatesHandler.handler));
app.all('/api/updates/version/:version', serverlessToExpress(updatesHandler.handler));

// Protected admin routes
app.all('/api/admin/publish', authMiddleware, serverlessToExpress(updatesHandler.handler));
app.all('/api/admin/upload', authMiddleware, serverlessToExpress(updatesHandler.handler));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`
Available endpoints:
- POST /api/admin/login                 - Admin login
- GET /api/updates/latest               - Get latest stable release
- GET /api/updates/latest/stable        - Get latest stable release
- GET /api/updates/latest/beta          - Get latest beta release
- GET /api/updates/releases/stable      - Get all stable releases
- GET /api/updates/releases/beta        - Get all beta releases
- GET /api/updates/releases/all         - Get all releases (both channels)
- GET /api/updates/version/{version}    - Get specific version
- POST /api/admin/publish               - Publish a new release (requires auth)
- POST /api/admin/upload                - Upload a release file (requires auth)
  `);
}); 