const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  // Skip connection if URI is not provided
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set. Database features will be unavailable.');
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    logger.warn('Server starting without database connection');
    return null;
  }
};

module.exports = connectDB;
