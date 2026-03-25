const Email = require('../models/Email');
const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * Handle Mailgun webhook for delivered emails
 */
exports.handleMailgunDelivery = async (req, res, next) => {
  try {
    const {
      'message-id': messageId,
      recipient,
      subject,
      sender,
      'body-plain': bodyPlain,
      'body-html': bodyHtml,
      timestamp
    } = req.body;

    logger.debug(`Webhook received: ${messageId} to ${recipient}`);

    // Find email record by recipient address
    const email = await Email.findOne({
      address: recipient,
      active: true,
      expiresAt: { $gt: new Date() }
    });

    if (!email) {
      logger.warn(`Email not found for recipient: ${recipient}`);
      return res.status(404).json({
        success: false,
        error: 'Email address not found'
      });
    }

    // Extract sender name (before @)
    const senderName = sender.split('@')[0] || sender;

    // Create message record
    const message = new Message({
      emailId: email._id,
      sender: sender,
      senderName: senderName,
      subject: subject,
      body: bodyPlain || '',
      htmlBody: bodyHtml || '',
      messageId: messageId,
      receivedAt: new Date(parseInt(timestamp) * 1000)
    });

    await message.save();

    // Update message count
    email.messageCount += 1;
    await email.save();

    logger.info(`Message saved: ${messageId} for ${recipient}`);

    res.status(200).json({
      success: true,
      message: 'Email processed successfully'
    });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * Handle Mailgun webhook for failed emails
 */
exports.handleMailgunFailure = async (req, res, next) => {
  try {
    const {
      'message-id': messageId,
      recipient,
      reason
    } = req.body;

    logger.warn(`Email failed: ${messageId} to ${recipient} - Reason: ${reason}`);

    // Log failure for debugging
    // Could update email status or notify user

    res.status(200).json({
      success: true,
      message: 'Failure logged'
    });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * Test webhook endpoint
 */
exports.testWebhook = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Webhook endpoint is active'
    });
  } catch (error) {
    next(error);
  }
};
