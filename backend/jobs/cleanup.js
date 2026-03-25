const schedule = require('node-schedule');
const Email = require('../models/Email');
const logger = require('../utils/logger');

/**
 * Cleanup job to delete expired emails
 * Runs every hour
 */
const startCleanupJob = () => {
  schedule.scheduleJob('0 * * * *', async () => {
    try {
      const result = await Email.deleteMany({
        expiresAt: { $lt: new Date() },
        active: false
      });
      logger.info(`Cleanup job: Deleted ${result.deletedCount} expired emails`);
    } catch (error) {
      logger.error(`Cleanup job error: ${error.message}`);
    }
  });

  logger.info('Cleanup job scheduled (runs every hour)');
};

/**
 * Reset monthly email counter for free users
 * Runs daily at midnight
 */
const startMonthlyResetJob = () => {
  schedule.scheduleJob('0 0 1 * *', async () => {
    try {
      const { User } = require('../models/User');
      const result = await User.updateMany(
        { premiumTier: 'free' },
        { emailsUsedThisMonth: 0 }
      );
      logger.info(`Monthly reset: Reset ${result.modifiedCount} free user emails`);
    } catch (error) {
      logger.error(`Monthly reset job error: ${error.message}`);
    }
  });

  logger.info('Monthly reset job scheduled (runs daily at midnight)');
};

module.exports = {
  startCleanupJob,
  startMonthlyResetJob
};
