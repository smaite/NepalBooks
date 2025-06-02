// Admin functionality for updates that can be exposed to the console

import { appConfig } from '../config/appConfig';

interface DownloadUrls {
  win?: string;
  mac?: string;
  linux?: string;
}

interface ReleaseData {
  version: string;
  notes: string;
  channel: 'stable' | 'beta';
  mandatory: boolean;
  downloadUrls: DownloadUrls;
}

// Update server URL
const API_URL = 'https://up-books.netlify.app/api/updates';

class UpdateAdmin {
  // Token for authentication (in a real app, this would be secured)
  private authToken: string | null = null;

  // Authenticate admin
  async authenticate(password: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.token;
        console.log('Authentication successful');
        return true;
      } else {
        console.error('Authentication failed');
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  // Publish new release
  async publishRelease(releaseData: ReleaseData): Promise<boolean> {
    if (!this.authToken) {
      console.error('Not authenticated. Please authenticate first.');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/admin/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(releaseData),
      });

      if (response.ok) {
        console.log(`Release ${releaseData.version} published successfully!`);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to publish release:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Error publishing release:', error);
      return false;
    }
  }

  // Show admin panel
  showAdminPanel(): void {
    // Create release manager component and inject into DOM
    const releaseManagerContainer = document.createElement('div');
    releaseManagerContainer.id = 'release-manager-container';
    releaseManagerContainer.style.position = 'fixed';
    releaseManagerContainer.style.top = '0';
    releaseManagerContainer.style.left = '0';
    releaseManagerContainer.style.width = '100%';
    releaseManagerContainer.style.height = '100%';
    releaseManagerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    releaseManagerContainer.style.zIndex = '9999';
    releaseManagerContainer.style.display = 'flex';
    releaseManagerContainer.style.justifyContent = 'center';
    releaseManagerContainer.style.alignItems = 'center';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Admin Panel';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.padding = '10px';
    closeButton.style.backgroundColor = '#ff4d4f';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      document.body.removeChild(releaseManagerContainer);
    };
    
    // Create admin form container
    const formContainer = document.createElement('div');
    formContainer.style.backgroundColor = '#1a1b1e';
    formContainer.style.padding = '20px';
    formContainer.style.borderRadius = '8px';
    formContainer.style.width = '90%';
    formContainer.style.maxWidth = '800px';
    formContainer.style.maxHeight = '90vh';
    formContainer.style.overflowY = 'auto';
    formContainer.style.color = 'white';
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = `${appConfig.name} Release Manager`;
    title.style.marginBottom = '20px';
    
    // Add form HTML
    formContainer.innerHTML += `
      <form id="release-form">
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
        
        <button type="submit" style="padding: 10px 20px; background: #1c7ed6; color: white; border: none; border-radius: 4px; cursor: pointer;">Publish Release</button>
      </form>
    `;
    
    // Append elements
    formContainer.appendChild(closeButton);
    releaseManagerContainer.appendChild(formContainer);
    document.body.appendChild(releaseManagerContainer);
    
    // Add form submission handler
    const form = document.getElementById('release-form') as HTMLFormElement;
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      // Reset message containers
      const errorContainer = document.getElementById('form-error') as HTMLDivElement;
      const successContainer = document.getElementById('form-success') as HTMLDivElement;
      errorContainer.style.display = 'none';
      successContainer.style.display = 'none';
      
      // Get form values
      const version = (document.getElementById('version') as HTMLInputElement).value;
      const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;
      const channel = (document.getElementById('channel') as HTMLSelectElement).value as 'stable' | 'beta';
      const mandatory = (document.getElementById('mandatory') as HTMLInputElement).checked;
      
      const winUrl = (document.getElementById('win-url') as HTMLInputElement).value;
      const macUrl = (document.getElementById('mac-url') as HTMLInputElement).value;
      const linuxUrl = (document.getElementById('linux-url') as HTMLInputElement).value;
      
      // Validate at least one URL is provided
      if (!winUrl && !macUrl && !linuxUrl) {
        errorContainer.textContent = 'At least one download URL is required';
        errorContainer.style.display = 'block';
        return;
      }
      
      // Create downloadUrls object
      const downloadUrls: DownloadUrls = {};
      if (winUrl) downloadUrls.win = winUrl;
      if (macUrl) downloadUrls.mac = macUrl;
      if (linuxUrl) downloadUrls.linux = linuxUrl;
      
      // Create release data
      const releaseData: ReleaseData = {
        version,
        notes,
        channel,
        mandatory,
        downloadUrls
      };
      
      // Submit release
      try {
        const success = await this.publishRelease(releaseData);
        if (success) {
          successContainer.textContent = `Version ${version} published successfully to ${channel} channel`;
          successContainer.style.display = 'block';
          form.reset();
        } else {
          errorContainer.textContent = 'Failed to publish release. See console for details.';
          errorContainer.style.display = 'block';
        }
      } catch (error) {
        errorContainer.textContent = 'An error occurred. See console for details.';
        errorContainer.style.display = 'block';
        console.error('Error submitting form:', error);
      }
    };
  }
}

// Create global instance for console access
const updateAdmin = new UpdateAdmin();

// Export for module use
export { updateAdmin };

// Make available in window for console access
(window as any).updateAdmin = updateAdmin;

// Ensure updateAdmin is registered on window.onload
window.addEventListener('load', () => {
  // Double-check window.updateAdmin is correctly set
  if (!(window as any).updateAdmin) {
    (window as any).updateAdmin = updateAdmin;
    console.log(`${appConfig.name} Admin Panel is now available. Type updateAdmin.showAdminPanel() to access it.`);
  }
}); 