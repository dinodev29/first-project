const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,      // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false        // Disable `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for email generation
 */
const emailGenerationLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 10,                    // 10 requests per minute
  message: 'Too many email creation attempts, please try again later.',
  skipSuccessfulRequests: false
});

/**
 * Rate limiter for webhook endpoints (lenient)
 */
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  skipFailedRequests: true
});

module.exports = {
  apiLimiter,
  emailGenerationLimiter,
  webhookLimiter
};
