/**
 * Test script for the welcome email functionality
 * Run: node test-email.js
 */

require('dotenv').config();

// Force set the credentials (override .env if needed)
process.env.EMAIL_USER = 'franklinasarewiafe@gmail.com';
process.env.EMAIL_PASS = 'soet wkiw ezbz tfkt';

const { sendWelcomeEmail, testEmailConfiguration } = require('./services/emailService');

async function runTest() {
  console.log('🚀 Testing Email Configuration...\n');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass:', '****' + process.env.EMAIL_PASS?.slice(-4) || 'NOT SET');
  console.log('\n');

  // Step 1: Test Configuration
  console.log('Step 1: Verifying SMTP configuration...');
  const isConfigValid = await testEmailConfiguration();
  
  if (!isConfigValid) {
    console.log('❌ Email configuration is invalid. Please check your credentials.');
    process.exit(1);
  }
  
  console.log('✅ Configuration verified!\n');

  // Step 2: Send Test Email
  console.log('Step 2: Sending test welcome email...');
  try {
    const result = await sendWelcomeEmail(
      process.env.EMAIL_USER, // Send to the same email for testing
      'Test User'
    );
    
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('\n📧 Check your inbox at:', process.env.EMAIL_USER);
  } catch (error) {
    console.log('❌ Failed to send test email:', error.message);
    process.exit(1);
  }
}

runTest().catch(console.error);
