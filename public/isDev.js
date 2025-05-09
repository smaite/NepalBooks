// Simple utility to check if we're in development mode
const { app } = require('electron');
 
module.exports = process.env.NODE_ENV === 'development' || !app.isPackaged; 