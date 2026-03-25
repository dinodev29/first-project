/**
 * Dino Mail Frontend Application
 * Phase 2: API Integration and Real-time Updates
 */

class DinoMailApp {
  constructor() {
    this.currentEmail = localStorage.getItem('dinomail_current_email') || null;
    this.sessionId = DinoMailAPI.sessionId;
    this.pollingInterval = null;
    this.pollIntervalMs = 3000; // Poll every 3 seconds
    this.selectedMessage = null;
    this.isOnline = true;
    this.messageCache = new Map();
    
    this.init();
  }

  /**
   * Initialize the app
   */
  async init() {
    console.log('Initializing Dino Mail App...');
    
    // Check backend connection
    const isHealthy = await DinoMailAPI.checkHealth();
    if (!isHealthy) {
      this.showConnectionError();
      return;
    }

    // Restore previous email if exists
    if (this.currentEmail) {
      this.displayEmail(this.currentEmail);
      await this.loadInbox();
      this.startPolling();
    }

    // Setup event listeners
    this.setupEventListeners();
    
    // Update visitor counter
    this.updateVisitorCounter();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const customNameInput = document.getElementById('customName');
    if (customNameInput) {
      customNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.createCustomEmail();
        }
      });
    }
  }

  /**
   * Generate random email
   */
  async generateRandomEmail(lifetime = '24hours') {
    try {
      this.showLoading('Generating email...');
      
      const result = await DinoMailAPI.generateRandomEmail(lifetime);
      
      if (result.success) {
        this.currentEmail = result.email.address;
        this.displayEmail(this.currentEmail);
        this.showSuccess('Email generated successfully!');
        
        // Clear custom name input
        document.getElementById('customName').value = '';
        
        // Load inbox and start polling
        await this.loadInbox();
        this.startPolling();
      } else {
        this.showError(result.error || 'Failed to generate email');
      }
    } catch (error) {
      this.showError(error.message);
      console.error('Error generating email:', error);
    }
  }

  /**
   * Create custom email
   */
  async createCustomEmail() {
    const name = document.getElementById('customName').value.trim();

    if (!name) {
      this.showError('Please enter a username');
      return;
    }

    // Basic validation
    if (!/^[a-zA-Z0-9]{3,20}$/.test(name)) {
      this.showError('Username must be 3-20 alphanumeric characters');
      return;
    }

    try {
      this.showLoading('Creating custom email...');
      
      const result = await DinoMailAPI.generateCustomEmail(name, '24hours');
      
      if (result.success) {
        this.currentEmail = result.email.address;
        this.displayEmail(this.currentEmail);
        this.showSuccess('Custom email created!');
        
        // Clear input
        document.getElementById('customName').value = '';
        
        // Load inbox and start polling
        await this.loadInbox();
        this.startPolling();
      } else {
        this.showError(result.error || 'Failed to create email');
      }
    } catch (error) {
      this.showError(error.message);
      console.error('Error creating custom email:', error);
    }
  }

  /**
   * Display email address with countdown timer
   */
  displayEmail(emailAddress) {
    const displayEl = document.getElementById('email-display');
    const deleteBtn = document.getElementById('deleteBtn');
    const expiresEl = document.getElementById('email-expires');
    
    displayEl.innerHTML = `<strong class="email-address">${emailAddress}</strong>`;
    displayEl.classList.add('has-email');
    deleteBtn.style.display = 'inline-block';
    
    // Start countdown timer
    this.startCountdownTimer(expiresEl);
  }

  /**
   * Start email expiration countdown timer
   */
  startCountdownTimer(element) {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    const updateTimer = () => {
      const expiresAt = localStorage.getItem('dinomail_email_expires');
      if (!expiresAt) return;

      const now = new Date();
      const expireTime = new Date(expiresAt);
      const diff = expireTime - now;

      if (diff <= 0) {
        element.innerHTML = '<span class="expires-soon">Email expired</span>';
        clearInterval(this.countdownInterval);
        this.stopPolling();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      let timeStr = '';
      if (hours > 0) {
        timeStr = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        timeStr = `${minutes}m ${seconds}s`;
      } else {
        timeStr = `${seconds}s`;
        element.innerHTML = '<span class="expires-soon">Expires in: ' + timeStr + '</span>';
        return;
      }

      element.innerHTML = `<span class="expires">Expires in: ${timeStr}</span>`;
    };

    updateTimer();
    this.countdownInterval = setInterval(updateTimer, 1000);
  }

  /**
   * Load inbox messages
   */
  async loadInbox() {
    if (!this.currentEmail) {
      document.getElementById('messages').innerHTML = '<p class="empty-state">No email selected</p>';
      return;
    }

    try {
      const result = await DinoMailAPI.getInbox(this.currentEmail);

      if (result.success) {
        this.renderInbox(result.messages);
        this.updateInboxCount(result.email.messageCount);
        this.messageCache.clear(); // Clear cache for fresh load
      }
    } catch (error) {
      console.error('Error loading inbox:', error);
      // Don't show error if offline - just keep previous messages
    }
  }

  /**
   * Render inbox messages
   */
  renderInbox(messages) {
    const messagesEl = document.getElementById('messages');

    if (!messages || messages.length === 0) {
      messagesEl.innerHTML = '<p class="empty-state">No messages yet. Your emails will appear here.</p>';
      return;
    }

    messagesEl.innerHTML = messages.map((msg, index) => `
      <div class="email-item" onclick="app.openMessage(${index}, '${this.escapeHtml(msg.sender)}', '${this.escapeHtml(msg.subject)}')">
        <div class="email-item-from">${this.escapeHtml(msg.senderName || msg.sender)}</div>
        <div class="email-item-subject">${this.escapeHtml(msg.subject)}</div>
        <div class="email-item-time">${this.formatTime(msg.receivedAt)}</div>
        ${!msg.read ? '<span class="unread-badge"></span>' : ''}
      </div>
    `).join('');
  }

  /**
   * Open message modal
   */
  async openMessage(index, sender, subject) {
    try {
      const result = await DinoMailAPI.getInbox(this.currentEmail);
      const message = result.messages[index];

      if (message) {
        document.getElementById('modal-sender').textContent = this.escapeHtml(sender);
        document.getElementById('modal-subject').textContent = this.escapeHtml(subject);
        document.getElementById('modal-body').innerHTML = `
          <div class="message-details">
            <p><strong>From:</strong> ${this.escapeHtml(message.sender)}</p>
            <p><strong>Received:</strong> ${new Date(message.receivedAt).toLocaleString()}</p>
            <div class="message-divider"></div>
            <div class="message-content">
              ${message.htmlBody ? message.htmlBody : this.escapeHtml(message.body).replace(/\n/g, '<br>')}
            </div>
          </div>
        `;

        document.getElementById('message-modal').style.display = 'block';
        this.selectedMessage = message;
      }
    } catch (error) {
      this.showError('Failed to open message');
      console.error('Error opening message:', error);
    }
  }

  /**
   * Close message modal
   */
  closeMessageModal() {
    document.getElementById('message-modal').style.display = 'none';
    this.selectedMessage = null;
  }

  /**
   * Copy email to clipboard
   */
  async copyEmail() {
    if (!this.currentEmail) {
      this.showError('Generate or create email first');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.currentEmail);
      this.showSuccess('Email copied to clipboard!');
    } catch (error) {
      this.showError('Failed to copy email');
      console.error('Error copying email:', error);
    }
  }

  /**
   * Delete current email
   */
  async deleteEmail() {
    if (!this.currentEmail) return;

    if (!confirm('Are you sure you want to delete this email?')) {
      return;
    }

    try {
      this.showLoading('Deleting email...');
      const result = await DinoMailAPI.deleteEmail(this.currentEmail);

      if (result.success) {
        this.currentEmail = null;
        this.stopPolling();
        this.showSuccess('Email deleted successfully');
        
        // Reset display
        document.getElementById('email-display').innerHTML = 'Your email will appear here';
        document.getElementById('email-display').classList.remove('has-email');
        document.getElementById('email-expires').innerHTML = '';
        document.getElementById('messages').innerHTML = '<p class="empty-state">No email selected</p>';
        document.getElementById('deleteBtn').style.display = 'none';
        document.getElementById('customName').value = '';
      }
    } catch (error) {
      this.showError(error.message);
      console.error('Error deleting email:', error);
    }
  }

  /**
   * Start polling for new messages
   */
  startPolling() {
    if (this.pollingInterval) return;

    console.log('Starting message polling...');
    this.pollingInterval = setInterval(() => {
      this.loadInbox();
    }, this.pollIntervalMs);
  }

  /**
   * Stop polling for new messages
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped message polling');
    }
  }

  /**
   * Update inbox message count
   */
  updateInboxCount(count) {
    const countEl = document.getElementById('inbox-count');
    if (countEl) {
      countEl.textContent = `${count} ${count === 1 ? 'message' : 'messages'}`;
    }
  }

  /**
   * Remove ads (premium feature demo)
   */
  removeAds() {
    document.querySelectorAll('.ad-container').forEach(ad => {
      ad.style.display = 'none';
    });
    const stickyAd = document.getElementById('stickyAd');
    if (stickyAd) stickyAd.style.display = 'none';
    
    this.showSuccess('Premium: Ads removed (Demo Mode)');
    localStorage.setItem('dinomail_ads_removed', 'true');
  }

  /**
   * Update visitor counter
   */
  updateVisitorCounter() {
    let count = localStorage.getItem('dinomail_visits');
    if (!count) {
      count = 1;
    } else {
      count = parseInt(count) + 1;
    }
    localStorage.setItem('dinomail_visits', count);
    document.getElementById('counter').textContent = count;
  }

  /**
   * Show loading state
   */
  showLoading(message) {
    this.showNotification(message, 'loading');
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification (toast)
   */
  showNotification(message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Show connection error
   */
  showConnectionError() {
    document.getElementById('connection-status').style.display = 'block';
      this.showError('Backend connection failed. Please check if the server is running on http://localhost:5000');
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    document.getElementById('connection-status').style.display = 'none';
    if (this.currentEmail && !this.pollingInterval) {
      this.startPolling();
    }
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    document.getElementById('connection-status').style.display = 'block';
  }

  /**
   * Format time to readable format
   */
  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new DinoMailApp();
  });
} else {
  app = new DinoMailApp();
}
