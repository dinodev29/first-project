const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { emailGenerationLimiter } = require('../middleware/rateLimiter');

/**
 * Generate random email
 * POST /api/emails/generate-random
 */
router.post('/generate-random', emailGenerationLimiter, emailController.generateRandomEmail);

/**
 * Generate custom email
 * POST /api/emails/generate-custom
 */
router.post('/generate-custom', emailGenerationLimiter, emailController.generateCustomEmail);

/**
 * Delete email
 * POST /api/emails/:emailAddress/delete
 */
router.post('/:emailAddress/delete', emailController.deleteEmail);

module.exports = router;
