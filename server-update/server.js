const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ADMIN_CREDENTIALS, JWT_SECRET } = require('./src/config/admin');
const authMiddleware = require('./src/middleware/auth');
const updatesHandler = require('./src/functions/updates');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

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
    res.status(result.statusCode || 200);

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

// API Routes
app.get('/api/updates/latest', serverlessToExpress(updatesHandler.handler));
app.get('/api/updates/latest/:channel', serverlessToExpress(updatesHandler.handler));
app.get('/api/updates/releases/:channel', serverlessToExpress(updatesHandler.handler));
app.get('/api/updates/version/:version', serverlessToExpress(updatesHandler.handler));
app.post('/api/admin/publish', serverlessToExpress(updatesHandler.handler));
app.post('/api/admin/upload', serverlessToExpress(updatesHandler.handler));

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/admin/dashboard.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`
Available endpoints:
- GET /api/updates/latest               - Get latest stable release
- GET /api/updates/latest/stable        - Get latest stable release
- GET /api/updates/latest/beta          - Get latest beta release
- GET /api/updates/releases/stable      - Get all stable releases
- GET /api/updates/releases/beta        - Get all beta releases
- GET /api/updates/releases/all         - Get all releases (both channels)
- GET /api/updates/version/{version}    - Get specific version
- POST /api/admin/publish               - Publish a new release
- POST /api/admin/upload                - Upload a release file
  `);
}); 