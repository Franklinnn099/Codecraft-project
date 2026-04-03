import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaignId, targetAudience, recipientEmails } = await req.json();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Get recipients based on target audience
    let recipients = [];
    if (targetAudience === "all") {
      const { data: subscribers, error: subError } = await supabase
        .from("subscribers")
        .select("id, email")
        .eq("status", "active");

      if (!subError && subscribers) {
        recipients = subscribers;
      }
    } else if (targetAudience === "specific" && recipientEmails) {
      // For specific emails, we need to get subscriber IDs if they exist
      const { data: subscribers, error: subError } = await supabase
        .from("subscribers")
        .select("id, email")
        .in("email", recipientEmails)
        .eq("status", "active");

      if (!subError && subscribers) {
        recipients = subscribers;
      }

      // Add non-subscribers as well (with null subscriber_id)
      const existingEmails = subscribers?.map((s) => s.email) || [];
      const newEmails = recipientEmails.filter(
        (email) => !existingEmails.includes(email)
      );
      recipients = [
        ...recipients,
        ...newEmails.map((email) => ({ id: null, email })),
      ];
    }

    if (recipients.length === 0) {
      throw new Error("No recipients found");
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Email service not configured");
    }

    // Generate HTML email content
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject}</title>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Arial', 'Helvetica', sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
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
                background: linear-gradient(135deg, #16a34a, #eab308); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .logo { 
                font-size: 32px; 
                font-weight: bold; 
                margin-bottom: 10px; 
            }
            .company-name { 
                font-size: 24px; 
                margin: 0; 
                font-weight: 300; 
            }
            .tagline { 
                margin: 5px 0 0 0; 
                font-size: 14px; 
                opacity: 0.9; 
            }
            .content { 
                padding: 40px 30px; 
            }
            .message-content { 
                color: #333; 
                font-size: 16px; 
                white-space: pre-line; 
                margin-bottom: 30px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #16a34a, #eab308);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer { 
                background-color: #f9fafb; 
                padding: 30px 20px; 
                text-align: center; 
                border-top: 1px solid #e5e7eb; 
                color: #666; 
                font-size: 14px; 
            }
            .contact-info { 
                margin-top: 15px; 
            }
            .contact-info span { 
                margin: 0 10px; 
                display: inline-block;
            }
            .unsubscribe {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
            .unsubscribe a {
                color: #666;
                text-decoration: underline;
            }
            @media (max-width: 600px) {
                .content { padding: 20px; }
                .header { padding: 20px; }
                .logo { font-size: 24px; }
                .company-name { font-size: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">EOF</div>
                <h1 class="company-name">Expert Office Furnish</h1>
                <p class="tagline">Transforming Workspaces, Elevating Excellence</p>
            </div>
            <div class="content">
                <div class="message-content">${campaign.content}</div>
                <div style="text-align: center;">
                    <a href="https://www.expertofficefurnish.com/shop" class="cta-button">
                        Shop Now
                    </a>
                </div>
            </div>
            <div class="footer">
                <p><strong>Expert Office Furnish Ltd.</strong></p>
                <div class="contact-info">
                    <span>📧 expertofurnish@gmail.com</span>
                    <span>📱 +233 XX XXX XXXX</span>
                    <span>📍 Accra, Ghana</span>
                </div>
                <div class="unsubscribe">
                    <p>You received this email because you subscribed to our newsletter.</p>
                    <a href="#">Unsubscribe</a> | <a href="#">Update Preferences</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(async (recipient) => {
        try {
          // Send email using Resend API
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Expert Office Furnish <expertofurnish@gmail.com>",
              to: [recipient.email],
              subject: campaign.subject,
              html: htmlContent,
              text: campaign.content,
            }),
          });

          const emailResult = await res.json();

          // Track email send in database
          const sendRecord = {
            campaign_id: campaignId,
            subscriber_id: recipient.id,
            email: recipient.email,
            status: res.ok ? "sent" : "failed",
            sent_at: res.ok ? new Date().toISOString() : null,
            error_message: res.ok
              ? null
              : emailResult.message || "Unknown error",
          };

          // Insert send record
          await supabase.from("newsletter_sends").insert([sendRecord]);

          return {
            email: recipient.email,
            success: res.ok,
            error: res.ok ? null : emailResult.message,
          };
        } catch (error) {
          // Track failed send
          await supabase.from("newsletter_sends").insert([
            {
              campaign_id: campaignId,
              subscriber_id: recipient.id,
              email: recipient.email,
              status: "failed",
              error_message: error.message,
            },
          ]);

          return {
            email: recipient.email,
            success: false,
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
    await supabase
      .from("newsletter_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter sent successfully`,
        details: {
          total: results.length,
          sent: successCount,
          failed: failureCount,
          results: results,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Newsletter sending error:", error);
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
