/**
 * Environment Configuration
 */

const environment = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key'
};

module.exports = environment;
