/**
 * Email Generation Utilities
 */

/**
 * Generate random email address
 */
const generateRandomEmail = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 10; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${random}@dinomail.com`;
};

/**
 * Generate custom email from username
 */
const generateCustomEmail = (customName) => {
  return `${customName.toLowerCase()}@dinomail.com`;
};

/**
 * Calculate expiration date based on lifetime
 */
const calculateExpirationDate = (lifetime) => {
  const now = new Date();
  const durations = {
    '15min': 15 * 60 * 1000,
    '1hour': 60 * 60 * 1000,
    '6hours': 6 * 60 * 60 * 1000,
    '24hours': 24 * 60 * 60 * 1000
  };
  
  const duration = durations[lifetime] || durations['24hours'];
  return new Date(now.getTime() + duration);
};

/**
 * Generate session ID for anonymous users
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = {
  generateRandomEmail,
  generateCustomEmail,
  calculateExpirationDate,
  generateSessionId
};
