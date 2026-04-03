import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    const { to, subject, message, signature, customerName, companyInfo } =
      await req.json();

    // Validate required fields
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, message",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create HTML email template with company branding
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Arial', 'Helvetica', sans-serif; 
                background-color: #f5f5f5; 
            }
            .email-container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 8px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            }
            .header { 
                background: linear-gradient(to right, #2563eb, #1e40af); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .logo { 
                background: white; 
                border-radius: 8px; 
                padding: 8px; 
                display: inline-block; 
                margin-bottom: 15px; 
                font-weight: bold; 
                color: #2563eb; 
                font-size: 18px; 
            }
            .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                margin: 0; 
            }
            .tagline { 
                font-size: 16px; 
                opacity: 0.9; 
                margin: 5px 0 0 0; 
            }
            .content { 
                padding: 30px; 
                line-height: 1.6; 
                color: #333; 
            }
            .message-content { 
                white-space: pre-line; 
                margin-bottom: 30px; 
                font-size: 16px; 
            }
            .signature { 
                border-top: 2px solid #e5e7eb; 
                padding-top: 20px; 
                margin-top: 30px; 
                white-space: pre-line; 
                color: #666; 
                font-size: 14px; 
            }
            .footer { 
                background-color: #f9fafb; 
                padding: 20px; 
                text-align: center; 
                border-top: 1px solid #e5e7eb; 
                color: #666; 
                font-size: 12px; 
            }
            .contact-info { 
                margin-top: 15px; 
            }
            .contact-info span { 
                margin: 0 10px; 
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">EOF</div>
                <h1 class="company-name">Expert Office Furnish</h1>
                <p class="tagline">Professional Office Solutions</p>
            </div>
            <div class="content">
                <div class="message-content">${message}</div>
                <div class="signature">${signature}</div>
            </div>
            <div class="footer">
                <p><strong>Expert Office Furnish Ltd.</strong></p>
                <div class="contact-info">
                    <span>📧 expertofurnish@gmail.com</span>
                    <span>📱 +233 XX XXX XXXX</span>
                    <span>📍 Accra, Ghana</span>
                </div>
                <p style="margin-top: 15px; font-style: italic;">
                    "Transforming Workspaces, Elevating Excellence"
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Plain text version
    const textContent = `${message}\n\n${signature}\n\n---\nExpert Office Furnish Ltd.\ninfo@expertofficefurnish.com\n+233 XX XXX XXXX\nAccra, Ghana`;

    // Send email using Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Expert Office Furnish <expertofurnish@gmail.com>",
        to: [to],
        subject: subject,
        html: htmlContent,
        text: textContent,
        reply_to: "expertofurnish@gmail.com",
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({
        success: true,
        emailId: data.id,
        message: "Email sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-reply-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
