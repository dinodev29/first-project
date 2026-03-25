const express = require('express');
const router = express.Router();
const inboxController = require('../controllers/inboxController');

/**
 * Get inbox for email address
 * GET /api/inbox/:emailAddress
 */
router.get('/:emailAddress', inboxController.getInbox);

/**
 * Get full message content
 * GET /api/inbox/message/:messageId
 */
router.get('/message/:messageId', inboxController.getMessage);

/**
 * Check for new messages
 * POST /api/inbox/check-new
 */
router.post('/check-new', inboxController.checkNewMessages);

/**
 * Get user statistics
 * GET /api/inbox/stats
 */
router.get('/stats', inboxController.getUserStats);

module.exports = router;
