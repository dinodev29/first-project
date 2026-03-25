const Email = require('../models/Email');

/**
 * Validate username format (3-20 alphanumeric characters)
 */
const isValidUsername = (name) => {
  return /^[a-zA-Z0-9]{3,20}$/.test(name);
};

/**
 * Check if email already exists and is active
 */
const checkDuplicateEmail = async (address) => {
  const existing = await Email.findOne({ 
    address, 
    active: true,
    expiresAt: { $gt: new Date() }
  });
  return existing !== null;
};

/**
 * Validate email lifetime
 */
const isValidLifetime = (lifetime) => {
  const validLifetimes = ['15min', '1hour', '6hours', '24hours'];
  return validLifetimes.includes(lifetime);
};

/**
 * Validate email address format
 */
const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
};

module.exports = {
  isValidUsername,
  checkDuplicateEmail,
  isValidLifetime,
  isValidEmail
};
