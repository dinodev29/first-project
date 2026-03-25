const User = require('../models/User');
const { generateSessionId } = require('../utils/emailGenerator');

/**
 * Session middleware for anonymous users
 */
const sessionMiddleware = async (req, res, next) => {
  try {
    let sessionId = req.headers['x-session-id'];

    if (!sessionId) {
      // Generate new session for anonymous user
      sessionId = generateSessionId();
      let user = await User.findOne({ sessionId });

      if (!user) {
        user = new User({
          sessionId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
        await user.save();
      }
    } else {
      // Update existing user
      await User.findOneAndUpdate(
        { sessionId },
        { lastActivityAt: new Date() },
        { upsert: true }
      );
    }

    req.sessionId = sessionId;
    res.setHeader('X-Session-ID', sessionId);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = sessionMiddleware;
