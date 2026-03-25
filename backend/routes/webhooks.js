const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { webhookLimiter } = require('../middleware/rateLimiter');

/**
 * Mailgun webhook for delivered emails
 * POST /api/webhooks/mailgun/delivered
 */
router.post('/mailgun/delivered', webhookLimiter, webhookController.handleMailgunDelivery);

/**
 * Mailgun webhook for failed emails
 * POST /api/webhooks/mailgun/failed
 */
router.post('/mailgun/failed', webhookLimiter, webhookController.handleMailgunFailure);

/**
 * Test webhook
 * GET /api/webhooks/test
 */
router.get('/test', webhookController.testWebhook);

module.exports = router;
