const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email credentials - use env vars or fallback to configured values
// IMPORTANT: Set EMAIL_USER and EMAIL_PASS environment variables for production
const EMAIL_USER = process.env.EMAIL_USER || 'expertofurnish@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || ''; // Set this via environment variable

// Load company logo as base64 for email embedding
let COMPANY_LOGO_BASE64 = '';
try {
  const logoPath = path.join(__dirname, '../../apps/client-site/src/assets/Company logo.png');
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    COMPANY_LOGO_BASE64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    console.log('✅ Company logo loaded successfully for emails');
  } else {
    console.warn('⚠️ Company logo not found at:', logoPath);
  }
} catch (error) {
  console.warn('⚠️ Could not load company logo:', error.message);
}

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Send a personalized welcome email to new customers
 * @param {string} customerEmail - The customer's email address
 * @param {string} customerName - The customer's name
 * @returns {Promise<Object>} - Nodemailer send result
 */
async function sendWelcomeEmail(customerEmail, customerName) {
  // Get logo path
  const logoPath = path.join(__dirname, '../../apps/client-site/src/assets/Company logo.png');
  const logoExists = fs.existsSync(logoPath);
  
  const mailOptions = {
    from: {
      name: 'Expert Office Furnish',
      address: EMAIL_USER,
    },
    to: customerEmail,
    subject: 'Welcome to Expert Office Furnish',
    html: generateWelcomeEmailHTML(customerName, logoExists),
    text: generateWelcomeEmailText(customerName),
    attachments: logoExists ? [
      {
        filename: 'company-logo.png',
        path: logoPath,
        cid: 'companylogo' // This CID is referenced in the HTML as src="cid:companylogo"
      }
    ] : [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Generate the HTML content for the welcome email
 * @param {string} customerName - The customer's name
 * @param {boolean} hasLogo - Whether the logo attachment is included
 * @returns {string} - HTML email content
 */
function generateWelcomeEmailHTML(customerName, hasLogo = true) {
  const logoSrc = hasLogo ? 'cid:companylogo' : '';
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Expert Office Furnish</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e0e0e0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1a472a; padding: 30px; text-align: center;">
              ${hasLogo ? `<img src="${logoSrc}" alt="Expert Office Furnish" width="80" height="80" style="margin-bottom: 15px; border-radius: 8px;" />` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: normal; letter-spacing: 1px;">
                Expert Office Furnish
              </h1>
              <p style="color: #c9a227; margin: 8px 0 0 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">
                Premium Office Solutions
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 45px 40px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                Dear ${customerName || 'Valued Customer'},
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                Thank you for creating an account with Expert Office Furnish. We are pleased to welcome you to our community of discerning professionals who understand the value of a well-designed workspace.
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                Since 2015, we have been helping businesses across Ghana create productive, comfortable, and inspiring work environments. From executive desks to ergonomic seating, our curated collection represents the finest in office furniture.
              </p>

              <h3 style="color: #1a472a; font-size: 18px; margin: 35px 0 20px 0; font-weight: normal; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">
                What We Offer
              </h3>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                    <strong style="color: #1a472a;">Executive Furniture</strong> — Desks, chairs, and storage solutions
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                    <strong style="color: #1a472a;">Office Fitouts</strong> — Complete workspace design and installation
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                    <strong style="color: #1a472a;">Consultation Services</strong> — Expert advice for your office needs
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                    <strong style="color: #1a472a;">Bulk Orders</strong> — Special pricing for corporate clients
                  </td>
                </tr>
              </table>

              <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                Browse our collection at your convenience, and do not hesitate to reach out if you have any questions. Our team is ready to assist you in finding the perfect solutions for your workspace.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <a href="https://www.expertofficefurnish.com/shop" style="background-color: #1a472a; color: #ffffff; text-decoration: none; padding: 14px 35px; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                      VIEW OUR COLLECTION
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 35px 0 0 0;">
                Warm regards,
              </p>
              <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 5px 0 0 0;">
                <strong>The Expert Office Furnish Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 25px 40px; border-top: 1px solid #e0e0e0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color: #666666; font-size: 13px; line-height: 1.6;">
                    <strong style="color: #1a472a;">Expert Office Furnish Ltd.</strong><br>
                    Accra, Ghana<br>
                    Tel: +233 XX XXX XXXX<br>
                    Email: expertofurnish@gmail.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Copyright -->
          <tr>
            <td style="background-color: #1a472a; padding: 15px; text-align: center;">
              <p style="color: #999999; margin: 0; font-size: 11px;">
                © ${currentYear} Expert Office Furnish Ltd. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate plain text fallback for the welcome email
 * @param {string} customerName - The customer's name
 * @returns {string} - Plain text email content
 */
function generateWelcomeEmailText(customerName) {
  return `
Dear ${customerName || 'Valued Customer'},

Thank you for creating an account with Expert Office Furnish. We are pleased to welcome you to our community of discerning professionals who understand the value of a well-designed workspace.

Since 2015, we have been helping businesses across Ghana create productive, comfortable, and inspiring work environments. From executive desks to ergonomic seating, our curated collection represents the finest in office furniture.

WHAT WE OFFER:
- Executive Furniture: Desks, chairs, and storage solutions
- Office Fitouts: Complete workspace design and installation
- Consultation Services: Expert advice for your office needs
- Bulk Orders: Special pricing for corporate clients

Browse our collection at: https://www.expertofficefurnish.com/shop

Warm regards,
The Expert Office Furnish Team

---
Expert Office Furnish Ltd.
Accra, Ghana
Tel: +233 XX XXX XXXX
Email: expertofurnish@gmail.com
  `.trim();
}

/**
 * Test the email configuration
 * @returns {Promise<boolean>} - True if configuration is valid
 */
async function testEmailConfiguration() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  testEmailConfiguration,
};
