import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      throw new Error("Email address is required");
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Email service not configured");
    }

    // Generate personalized welcome email HTML
    const customerName = name || "Valued Customer";
    const htmlContent = generateWelcomeEmailHTML(customerName);
    const textContent = generateWelcomeEmailText(customerName);

    // Send email using Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Expert Office Furnish <welcome@expertofficefurnish.com>",
        to: [email],
        subject: "🎉 Welcome to Expert Office Furnish! Your Workspace Journey Begins",
        html: htmlContent,
        text: textContent,
      }),
    });

    const emailResult = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Welcome email sent successfully to:", email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome email sent successfully",
        messageId: emailResult.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Welcome email error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function generateWelcomeEmailHTML(customerName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Expert Office Furnish</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #f5c518; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                ✨ Expert Office Furnish ✨
              </h1>
              <p style="color: #ffffff; opacity: 0.9; margin-top: 10px; font-size: 14px; letter-spacing: 0.5px;">
                Premium Furniture for Your Workspace
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <!-- Welcome Badge -->
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="background: linear-gradient(135deg, #f5c518, #ffd700); color: #1a1a2e; padding: 10px 30px; border-radius: 50px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(245, 197, 24, 0.3);">
                  🎊 WELCOME ABOARD! 🎊
                </span>
              </div>

              <h2 style="color: #1a1a2e; font-size: 26px; margin: 0 0 20px 0; text-align: center;">
                Hello, ${customerName}! 👋
              </h2>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; text-align: center; margin-bottom: 30px;">
                Congratulations on joining the <strong>Expert Office Furnish</strong> family! 
                We're absolutely thrilled to have you with us.
              </p>

              <!-- Feature Boxes -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px;">
                    <div style="background: linear-gradient(135deg, #fef9e7 0%, #fff8e1 100%); border-radius: 12px; padding: 25px; text-align: center; border: 1px solid #f5c518;">
                      <div style="font-size: 32px; margin-bottom: 10px;">🪑</div>
                      <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 16px;">Premium Quality</h3>
                      <p style="color: #666; margin: 0; font-size: 13px;">Handpicked furniture that combines style with comfort</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px;">
                    <div style="background: linear-gradient(135deg, #e8f8f5 0%, #d5f5e3 100%); border-radius: 12px; padding: 25px; text-align: center; border: 1px solid #27ae60;">
                      <div style="font-size: 32px; margin-bottom: 10px;">🚚</div>
                      <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 16px;">Fast Delivery</h3>
                      <p style="color: #666; margin: 0; font-size: 13px;">Quick and reliable shipping right to your doorstep</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px;">
                    <div style="background: linear-gradient(135deg, #f5eef8 0%, #ebdef0 100%); border-radius: 12px; padding: 25px; text-align: center; border: 1px solid #9b59b6;">
                      <div style="font-size: 32px; margin-bottom: 10px;">💬</div>
                      <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 16px;">24/7 Support</h3>
                      <p style="color: #666; margin: 0; font-size: 13px;">Our team is always here to help you</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://www.expertofficefurnish.com" style="background: linear-gradient(135deg, #f5c518 0%, #ffd700 100%); color: #1a1a2e; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 20px rgba(245, 197, 24, 0.4);">
                      🛒 Start Shopping Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #888888; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 30px;">
                Transform your workspace with our curated collection of ergonomic chairs, 
                elegant desks, and modern office accessories.
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">
                Connect with us
              </p>
              <div style="margin-bottom: 20px;">
                <a href="#" style="color: #f5c518; text-decoration: none; margin: 0 10px; font-size: 14px;">Facebook</a>
                <a href="#" style="color: #f5c518; text-decoration: none; margin: 0 10px; font-size: 14px;">Instagram</a>
                <a href="#" style="color: #f5c518; text-decoration: none; margin: 0 10px; font-size: 14px;">Twitter</a>
              </div>
              <p style="color: #888888; margin: 0; font-size: 12px;">
                © 2024 Expert Office Furnish. All rights reserved.
              </p>
              <p style="color: #666666; margin: 10px 0 0 0; font-size: 11px;">
                This email was sent because you registered for an account.
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

function generateWelcomeEmailText(customerName: string): string {
  return `
Welcome to Expert Office Furnish!

Hello, ${customerName}!

Congratulations on joining the Expert Office Furnish family! We're absolutely thrilled to have you with us.

What you can expect:
✓ Premium Quality - Handpicked furniture that combines style with comfort
✓ Fast Delivery - Quick and reliable shipping right to your doorstep  
✓ 24/7 Support - Our team is always here to help you

Transform your workspace with our curated collection of ergonomic chairs, elegant desks, and modern office accessories.

Visit us: https://www.expertofficefurnish.com

---
© 2024 Expert Office Furnish. All rights reserved.
  `.trim();
}
