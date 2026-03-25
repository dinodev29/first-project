const Email = require('../models/Email');
const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * Get inbox messages for an email address
 */
exports.getInbox = async (req, res, next) => {
  try {
    const { emailAddress } = req.params;

    // Find email record
    const email = await Email.findOne({
      address: emailAddress,
      active: true,
      expiresAt: { $gt: new Date() }
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email address not found or expired'
      });
    }

    // Get all messages for this email
    const messages = await Message.find({ emailId: email._id })
      .sort({ receivedAt: -1 })
      .select('sender senderName subject receivedAt read -_id')
      .lean();

    res.status(200).json({
      success: true,
      email: {
        address: email.address,
        messageCount: email.messageCount,
        expiresAt: email.expiresAt,
        createdAt: email.createdAt
      },
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full email message
 */
exports.getMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Mark as read
    message.read = true;
    await message.save();

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res, next) => {
  try {
    // Get current month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // This would need to be integrated with auth system
    // For now, return general stats
    res.status(200).json({
      success: true,
      stats: {
        emailsCreatedThisMonth: 0,
        emailsAvailable: 0,
        premiumTier: 'free',
        accountAge: 'new',
        totalMessagesReceived: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if inbox has new messages (WebSocket alternative)
 */
exports.checkNewMessages = async (req, res, next) => {
  try {
    const { emailAddress, lastCheckTime } = req.body;

    const email = await Email.findOne({ address: emailAddress });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found'
      });
    }

    const newMessages = await Message.find({
      emailId: email._id,
      receivedAt: { $gt: new Date(lastCheckTime) }
    }).countDocuments();

    res.status(200).json({
      success: true,
      hasNewMessages: newMessages > 0,
      newMessageCount: newMessages
    });
  } catch (error) {
    next(error);
  }
};
