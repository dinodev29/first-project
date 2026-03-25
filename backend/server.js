require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middleware/session');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');
const { startCleanupJob, startMonthlyResetJob } = require('./jobs/cleanup');
const environment = require('./config/environment');

// Validate required environment variables
const requiredEnvs = [
  'MONGODB_URI',
  'MAILGUN_API_KEY',
  'MAILGUN_DOMAIN'
];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    logger.warn(`Warning: ${env} is not set. Some features may not work.`);
  }
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Session middleware
app.use(sessionMiddleware);

// Database connection
connectDB();

// Routes
app.use('/api/emails', require('./routes/emails'));
app.use('/api/inbox', require('./routes/inbox'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start scheduled jobs
startCleanupJob();
startMonthlyResetJob();

// Start server
const PORT = environment.port;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Dino Mail Backend - ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
