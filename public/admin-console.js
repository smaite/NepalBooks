/**
 * NepalBooks Admin Console - External Access Script
 * 
 * This script provides a way to access the admin panel in production.
 * It can be loaded via the browser console with:
 *
 * var script = document.createElement('script');
 * script.src = '/admin-console.js';
 * document.head.appendChild(script);
 */

(function() {
  console.log('%c NepalBooks Admin Console Loading...', 'color: #1c7ed6; font-weight: bold;');
  
  // Function to check if updateAdmin is available
  function checkUpdateAdmin() {
    if (window.updateAdmin) {
      console.log('%c NepalBooks Admin Console Ready!', 'color: #2b8a3e; font-weight: bold;');
      console.log('%c Type updateAdmin.showAdminPanel() to open the admin panel', 'color: #1c7ed6;');
      return true;
    }
    return false;
  }
  
  // If updateAdmin is already available, we're done
  if (checkUpdateAdmin()) {
    return;
  }
  
  // Otherwise, we'll try to create our own admin panel
  console.log('%c Creating fallback admin panel...', 'color: #f59f00;');
  
  // Basic admin functionality for release management
  window.updateAdmin = {
    showAdminPanel: function() {
      const API_URL = 'https://up-books.netlify.app/api/updates';
      let authToken = null;
      
      // Create UI elements
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      
      const panel = document.createElement('div');
      panel.style.backgroundColor = '#1a1b1e';
      panel.style.color = '#fff';
      panel.style.padding = '20px';
      panel.style.borderRadius = '8px';
      panel.style.maxWidth = '800px';
      panel.style.width = '90%';
      panel.style.maxHeight = '90vh';
      panel.style.overflowY = 'auto';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '10px';
      closeBtn.style.right = '10px';
      closeBtn.style.padding = '8px 16px';
      closeBtn.style.backgroundColor = '#e03131';
      closeBtn.style.color = 'white';
      closeBtn.style.border = 'none';
      closeBtn.style.borderRadius = '4px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = function() {
        document.body.removeChild(container);
      };
      
      // Create form HTML
      panel.innerHTML = `
        <h2 style="margin-bottom: 20px;">NepalBooks Release Manager</h2>
        
        <div id="auth-section" style="margin-bottom: 20px;">
          <h3>Authentication</h3>
          <input type="password" id="admin-password" placeholder="Admin Password" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #25262b; color: white; border: 1px solid #373a40; border-radius: 4px;">
          <button id="auth-button" style="padding: 8px 16px; background: #1c7ed6; color: white; border: none; border-radius: 4px; cursor: pointer;">Authenticate</button>
          <div id="auth-message" style="margin-top: 10px; color: #fa5252; display: none;"></div>
        </div>
        
        <div id="release-form" style="display: none;">
          <h3>Publish New Release</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Version*</label>
            <input id="version" type="text" placeholder="1.0.0" required style="width: 100%; padding: 8px; background: #25262b; color: white; border: 1px solid #373a40; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Channel*</label>
            <select id="channel" required style="width: 100%; padding: 8px; background: #25262b; color: white; border: 1px solid #373a40; border-radius: 4px;">
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
            </select>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Release Notes*</label>
            <textarea id="notes" placeholder="Enter release notes, changes, features, etc." rows="5" required style="width: 100%; padding: 8px; background: #25262b; color: white; border: 1px solid #373a40; border-radius: 4px;"></textarea>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block;">
              <input id="mandatory" type="checkbox" style="margin-right: 5px;">
              Mandatory update (users must install this update)
            </label>
          </div>
          
          <div style="margin-top: 20px; margin-bottom: 10px; border-top: 1px solid #373a40; padding-top: 15px;">
            <h3>Download URLs</h3>
            <p style="margin-bottom: 10px; font-size: 14px;">At least one download URL is required</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Windows Download URL</label>
            <input id="win-url" type="url" placeholder="https://example.com/app-win.exe" style="width: 100%; padding: 8px; background: #25262b; color: white; border: 1px solid #373a40; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">macOS Download URL</label>
            <input id="mac-url" type="url" placeholder="https://example.com/app-mac.dmg" style="width: 100%; padding: 8px; background: #25262b; color: white; border: 1px solid #373a40; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px;">Linux Download URL</label>
            <input id="linux-url" type="url" placeholder="https://example.com/app-linux.AppImage" style="width: 100%; padding: 8px; background: #25262b; color: white; border: 1px solid #373a40; border-radius: 4px;">
          </div>
          
          <div id="form-error" style="color: #ff4d4f; margin-bottom: 15px; display: none;"></div>
          <div id="form-success" style="color: #52c41a; margin-bottom: 15px; display: none;"></div>
          
          <button id="publish-button" type="submit" style="padding: 10px 20px; background: #1c7ed6; color: white; border: none; border-radius: 4px; cursor: pointer;">Publish Release</button>
        </div>
      `;
      
      container.appendChild(panel);
      panel.appendChild(closeBtn);
      document.body.appendChild(container);
      
      // Authenticate admin
      document.getElementById('auth-button').addEventListener('click', async function() {
        const passwordInput = document.getElementById('admin-password');
        const password = passwordInput.value;
        const authMessage = document.getElementById('auth-message');
        
        try {
          const response = await fetch(`${API_URL}/admin/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });
          
          if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('release-form').style.display = 'block';
          } else {
            authMessage.textContent = 'Authentication failed';
            authMessage.style.display = 'block';
          }
        } catch (error) {
          authMessage.textContent = 'Error connecting to server';
          authMessage.style.display = 'block';
          console.error('Auth error:', error);
        }
      });
      
      // Handle form submission
      document.getElementById('publish-button').addEventListener('click', async function() {
        const errorContainer = document.getElementById('form-error');
        const successContainer = document.getElementById('form-success');
        errorContainer.style.display = 'none';
        successContainer.style.display = 'none';
        
        // Get form values
        const versionInput = document.getElementById('version');
        const notesInput = document.getElementById('notes');
        const channelInput = document.getElementById('channel');
        const mandatoryInput = document.getElementById('mandatory');
        
        const winUrlInput = document.getElementById('win-url');
        const macUrlInput = document.getElementById('mac-url');
        const linuxUrlInput = document.getElementById('linux-url');
        
        const version = versionInput.value;
        const notes = notesInput.value;
        const channel = channelInput.value;
        const mandatory = mandatoryInput.checked;
        
        const winUrl = winUrlInput.value;
        const macUrl = macUrlInput.value;
        const linuxUrl = linuxUrlInput.value;
        
        // Validate inputs
        if (!version || !notes) {
          errorContainer.textContent = 'Version and release notes are required';
          errorContainer.style.display = 'block';
          return;
        }
        
        if (!winUrl && !macUrl && !linuxUrl) {
          errorContainer.textContent = 'At least one download URL is required';
          errorContainer.style.display = 'block';
          return;
        }
        
        // Create downloadUrls object
        const downloadUrls = {};
        if (winUrl) downloadUrls['win'] = winUrl;
        if (macUrl) downloadUrls['mac'] = macUrl;
        if (linuxUrl) downloadUrls['linux'] = linuxUrl;
        
        // Create release data
        const releaseData = {
          version,
          notes,
          channel,
          mandatory,
          downloadUrls
        };
        
        // Submit to API
        try {
          const response = await fetch(`${API_URL}/admin/publish`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(releaseData)
          });
          
          if (response.ok) {
            successContainer.textContent = `Version ${version} published successfully to ${channel} channel`;
            successContainer.style.display = 'block';
            
            // Clear form
            versionInput.value = '';
            notesInput.value = '';
            winUrlInput.value = '';
            macUrlInput.value = '';
            linuxUrlInput.value = '';
            mandatoryInput.checked = false;
          } else {
            const errorData = await response.json();
            errorContainer.textContent = errorData.error || 'Failed to publish release';
            errorContainer.style.display = 'block';
          }
        } catch (error) {
          errorContainer.textContent = 'Error connecting to server';
          errorContainer.style.display = 'block';
          console.error('Publish error:', error);
        }
      });
    }
  };
  
  console.log('%c External admin panel created successfully!', 'color: #2b8a3e; font-weight: bold;');
  console.log('%c Type updateAdmin.showAdminPanel() to open the admin panel', 'color: #1c7ed6;');
})(); 