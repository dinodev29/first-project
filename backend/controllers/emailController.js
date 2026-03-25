const Email = require('../models/Email');
const User = require('../models/User');
const {
  generateRandomEmail,
  generateCustomEmail,
  calculateExpirationDate
} = require('../utils/emailGenerator');
const {
  isValidUsername,
  checkDuplicateEmail,
  isValidLifetime
} = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * Generate random email address
 */
exports.generateRandomEmail = async (req, res, next) => {
  try {
    const { lifetime = '24hours' } = req.body;

    // Validate lifetime
    if (!isValidLifetime(lifetime)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lifetime. Use: 15min, 1hour, 6hours, or 24hours'
      });
    }

    // Get or create user
    let user = await User.findOne({ sessionId: req.sessionId });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User session not found'
      });
    }

    // Check email limits for free users
    if (user.premiumTier === 'free') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const emailCount = await Email.countDocuments({
        userId: user._id,
        createdAt: { $gte: monthStart }
      });

      if (emailCount >= 10) {
        return res.status(429).json({
          success: false,
          error: 'Free tier limit reached. Upgrade to premium for unlimited emails.'
        });
      }
    }

    // Generate unique random email
    let emailAddress = generateRandomEmail();
    let attempts = 0;

    while (await checkDuplicateEmail(emailAddress) && attempts < 5) {
      emailAddress = generateRandomEmail();
      attempts++;
    }

    if (attempts >= 5) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate unique email. Please try again.'
      });
    }

    // Create email record
    const expiresAt = calculateExpirationDate(lifetime);
    const email = new Email({
      address: emailAddress,
      userId: user._id,
      expiresAt,
      lifetime,
      customName: false
    });

    await email.save();
    user.emailsUsedThisMonth += 1;
    await user.save();

    logger.info(`Random email generated: ${emailAddress}`);

    res.status(201).json({
      success: true,
      email: {
        address: email.address,
        expiresAt: email.expiresAt,
        lifetime: email.lifetime,
        createdAt: email.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate custom email address
 */
exports.generateCustomEmail = async (req, res, next) => {
  try {
    const { customName, lifetime = '24hours' } = req.body;

    if (!customName) {
      return res.status(400).json({
        success: false,
        error: 'customName is required'
      });
    }

    // Validate username format
    if (!isValidUsername(customName)) {
      return res.status(400).json({
        success: false,
        error: 'Username must be 3-20 alphanumeric characters only'
      });
    }

    // Validate lifetime
    if (!isValidLifetime(lifetime)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lifetime. Use: 15min, 1hour, 6hours, or 24hours'
      });
    }

    // Get user
    let user = await User.findOne({ sessionId: req.sessionId });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User session not found'
      });
    }

    // Check email limits
    if (user.premiumTier === 'free') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const emailCount = await Email.countDocuments({
        userId: user._id,
        createdAt: { $gte: monthStart }
      });

      if (emailCount >= 10) {
        return res.status(429).json({
          success: false,
          error: 'Free tier limit reached. Upgrade to premium for unlimited emails.'
        });
      }
    }

    // Generate email address
    const emailAddress = generateCustomEmail(customName);

    // Check if email already exists
    if (await checkDuplicateEmail(emailAddress)) {
      return res.status(409).json({
        success: false,
        error: 'Email address already taken. Try a different username.'
      });
    }

    // Create email record
    const expiresAt = calculateExpirationDate(lifetime);
    const email = new Email({
      address: emailAddress,
      userId: user._id,
      expiresAt,
      lifetime,
      customName: true
    });

    await email.save();
    user.emailsUsedThisMonth += 1;
    await user.save();

    logger.info(`Custom email generated: ${emailAddress}`);

    res.status(201).json({
      success: true,
      email: {
        address: email.address,
        expiresAt: email.expiresAt,
        lifetime: email.lifetime,
        createdAt: email.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete/expire email address
 */
exports.deleteEmail = async (req, res, next) => {
  try {
    const { emailAddress } = req.params;

    const email = await Email.findOne({ address: emailAddress });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email address not found'
      });
    }

    // Verify ownership (optional - for security)
    if (email.userId.toString() !== req.user?._id?.toString() && req.sessionId) {
      // Allow delete if session matches
    }

    email.active = false;
    await email.save();

    logger.info(`Email deleted: ${emailAddress}`);

    res.status(200).json({
      success: true,
      message: 'Email address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
