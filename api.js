/**
 * Dino Mail API Service
 * Handles all communication with the backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DinoMailAPI {
  /**
   * Initialize API with session ID
   */
  static initialize() {
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Get or create session ID from localStorage
   */
  static getOrCreateSessionId() {
    let sessionId = localStorage.getItem('dinomail_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('dinomail_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get request headers with session ID
   */
  static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId
    };
  }

  /**
   * Handle API errors
   */
  static async handleError(response) {
    const data = await response.json();
    throw new Error(data.error || `API Error: ${response.status}`);
  }

  /**
   * Generate random email
   */
  static async generateRandomEmail(lifetime = '24hours') {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/generate-random`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ lifetime })
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      if (data.success) {
        // Store email address in localStorage for quick access
        localStorage.setItem('dinomail_current_email', data.email.address);
        localStorage.setItem('dinomail_email_expires', data.email.expiresAt);
        localStorage.setItem('dinomail_email_lifetime', data.email.lifetime);
      }
      return data;
    } catch (error) {
      console.error('Error generating random email:', error);
      throw error;
    }
  }

  /**
   * Generate custom email
   */
  static async generateCustomEmail(customName, lifetime = '24hours') {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/generate-custom`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ customName, lifetime })
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('dinomail_current_email', data.email.address);
        localStorage.setItem('dinomail_email_expires', data.email.expiresAt);
        localStorage.setItem('dinomail_email_lifetime', data.email.lifetime);
      }
      return data;
    } catch (error) {
      console.error('Error generating custom email:', error);
      throw error;
    }
  }

  /**
   * Get inbox for an email address
   */
  static async getInbox(emailAddress) {
    try {
      const response = await fetch(`${API_BASE_URL}/inbox/${emailAddress}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching inbox:', error);
      throw error;
    }
  }

  /**
   * Get full message content
   */
  static async getMessage(messageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/inbox/message/${messageId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  /**
   * Check for new messages
   */
  static async checkNewMessages(emailAddress, lastCheckTime) {
    try {
      const response = await fetch(`${API_BASE_URL}/inbox/check-new`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ emailAddress, lastCheckTime })
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking new messages:', error);
      throw error;
    }
  }

  /**
   * Delete email address
   */
  static async deleteEmail(emailAddress) {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/${emailAddress}/delete`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      // Clear from localStorage
      localStorage.removeItem('dinomail_current_email');
      localStorage.removeItem('dinomail_email_expires');
      localStorage.removeItem('dinomail_email_lifetime');

      return await response.json();
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/inbox/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   */
  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Initialize on load
DinoMailAPI.initialize();
