const express = require('express');
const router = express.Router();
const { sendWelcomeEmail, testEmailConfiguration } = require('../services/emailService');

/**
 * POST /api/email/welcome
 * Send a personalized welcome email to a new customer
 * 
 * Request body:
 * - email: string (required) - Customer's email address
 * - name: string (optional) - Customer's name
 */
router.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format',
      });
    }

    const result = await sendWelcomeEmail(email, name);

    res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send welcome email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/email/test
 * Test the email configuration
 */
router.get('/test', async (req, res) => {
  try {
    const isValid = await testEmailConfiguration();
    
    if (isValid) {
      res.status(200).json({
        success: true,
        message: 'Email configuration is valid',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Email configuration is invalid',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test email configuration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
