const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email credentials - use env vars or fallback to configured values
const EMAIL_USER = process.env.EMAIL_USER || 'franklinasarewiafe@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'soet wkiw ezbz tfkt';

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
    subject: '🎉 Welcome to Expert Office Furnish! Your Workspace Journey Begins',
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
  // Use CID reference for embedded image, fallback to placeholder
  const logoSrc = hasLogo ? 'cid:companylogo' : 'https://via.placeholder.com/120x120/16a34a/ffffff?text=EOF';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Expert Office Furnish</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #84cc16 100%); padding: 50px 30px; text-align: center;">
              <!-- Company Logo -->
              <div style="margin: 0 auto 20px;">
                <img src="${logoSrc}" alt="Expert Office Furnish Logo" width="140" height="140" style="border-radius: 16px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); background: #ffffff; padding: 8px;" />
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                Expert Office Furnish
              </h1>
              <p style="color: #d9f99d; margin-top: 10px; font-size: 16px; letter-spacing: 1px; font-weight: 500;">
                Transforming Workspaces, Elevating Excellence
              </p>
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #eab308 0%, #facc15 100%); padding: 20px; text-align: center;">
              <span style="color: #1a1a2e; font-size: 18px; font-weight: 700; letter-spacing: 2px;">
                🎉 CONGRATULATIONS ON JOINING US! 🎉
              </span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #1f2937; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                Hello, ${customerName || 'Valued Customer'}! 👋
              </h2>

              <p style="color: #4b5563; font-size: 17px; line-height: 1.9; text-align: center; margin-bottom: 35px;">
                Welcome to the <strong style="color: #16a34a;">Expert Office Furnish</strong> family! 
                We're excited to have you on board. Get ready to transform your workspace with our premium collection of office furniture.
              </p>

              <!-- Benefits Grid -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 35px;">
                <tr>
                  <td style="padding: 12px;">
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; padding: 28px; text-align: center; border: 2px solid #10b981;">
                      <div style="font-size: 40px; margin-bottom: 12px;">🪑</div>
                      <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 18px; font-weight: 700;">Premium Quality</h3>
                      <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.6;">Handcrafted furniture designed for comfort and durability</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px;">
                    <div style="background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border-radius: 16px; padding: 28px; text-align: center; border: 2px solid #eab308;">
                      <div style="font-size: 40px; margin-bottom: 12px;">🚚</div>
                      <h3 style="color: #854d0e; margin: 0 0 10px 0; font-size: 18px; font-weight: 700;">Express Delivery</h3>
                      <p style="color: #a16207; margin: 0; font-size: 14px; line-height: 1.6;">Fast and reliable shipping across Ghana</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px;">
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 28px; text-align: center; border: 2px solid #22c55e;">
                      <div style="font-size: 40px; margin-bottom: 12px;">💼</div>
                      <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 18px; font-weight: 700;">Business Solutions</h3>
                      <p style="color: #15803d; margin: 0; font-size: 14px; line-height: 1.6;">Complete office setup & consultation services</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 25px 0;">
                    <a href="https://www.expertofficefurnish.com/shop" style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-weight: 700; font-size: 18px; display: inline-block; box-shadow: 0 6px 25px rgba(22, 163, 74, 0.4); letter-spacing: 0.5px;">
                      🛒 Explore Our Collection
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Promo Banner -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px; border: 2px dashed #f59e0b;">
                <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 600;">
                  🎁 NEW MEMBER PERK: Get exclusive first-time buyer discounts!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 35px 30px; text-align: center;">
              <p style="color: #f3f4f6; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                Expert Office Furnish
              </p>
              <p style="color: #9ca3af; margin: 0 0 20px 0; font-size: 14px;">
                📍 Accra, Ghana | 📧 info@expertofficefurnish.com
              </p>
              <div style="margin-bottom: 20px;">
                <a href="#" style="color: #22c55e; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">Facebook</a>
                <a href="#" style="color: #22c55e; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">Instagram</a>
                <a href="#" style="color: #22c55e; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">Twitter</a>
              </div>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                © 2024 Expert Office Furnish Ltd. All rights reserved.
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
Welcome to Expert Office Furnish!

Hello, ${customerName || 'Valued Customer'}!

Congratulations on joining the Expert Office Furnish family! We're absolutely thrilled to have you with us.

What you can expect:
✓ Premium Quality - Handpicked furniture that combines style with comfort
✓ Fast Delivery - Quick and reliable shipping right to your doorstep  
✓ 24/7 Support - Our team is always here to help you

Transform your workspace with our curated collection of ergonomic chairs, elegant desks, and modern office accessories.

Visit us: https://expertoffice-furnish.com

---
© 2024 Expert Office Furnish. All rights reserved.
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
