// Admin credentials
// In production, these should be stored securely and not in the code
const ADMIN_CREDENTIALS = {
  username: 'admin',
  // This is a hashed password - in production use proper password hashing
  password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918' // 'admin' hashed with SHA-256
};

// JWT secret for token generation
const JWT_SECRET = 'your-secret-key-here'; // In production, use a strong random key

module.exports = {
  ADMIN_CREDENTIALS,
  JWT_SECRET
}; 