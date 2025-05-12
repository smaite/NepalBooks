# NepalBooks Admin Access

This documentation explains how to access the admin functionality in NepalBooks application.

## Development Mode Access

When running the application in development mode, you can access the admin panel in several ways:

1. **Developer Console**
   ```javascript
   // In the browser console, type:
   updateAdmin.showAdminPanel()
   ```

2. **Keyboard Shortcut**
   - Press `Alt+Shift+A` to open the admin panel

3. **NepalBooks Console Object**
   ```javascript
   // For more options, try:
   window.nepalbooks.help()
   
   // Or open admin panel directly:
   window.nepalbooks.adminPanel()
   ```

4. **Settings Page**
   - In development mode, go to the Settings page
   - Navigate to the "Admin" tab
   - Click the "Open Admin Panel" button

## Production Mode Access

To access admin functionality in production:

1. **Load Admin Console Script**
   ```javascript
   // In the browser console, type:
   var script = document.createElement('script');
   script.src = '/admin-console.js';
   document.head.appendChild(script);
   
   // Then, once loaded:
   updateAdmin.showAdminPanel()
   ```

## Authentication

When using the admin panel, you'll need to authenticate with the admin password.
The default password for development is: `admin-nepal-books`

For production, please set a secure password in the server configuration.

## Admin Functions

The admin panel provides the following functionality:

- Publish new releases
- Set release notes and version numbers
- Choose between stable and beta channels
- Set mandatory update flag
- Provide download URLs for different platforms (Windows, macOS, Linux)

## Update Server

The admin panel connects to the update server at https://up-books.netlify.app/
See the server documentation for more details on API endpoints and deployment. 