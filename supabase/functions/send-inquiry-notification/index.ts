import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { inquiryData, inquiryType } = await req.json()
    
    // Company email - replace with actual company email
    const companyEmail = 'info@expertoffice.com' // Change this to actual company email
    
    // Create email content based on inquiry type
    let emailSubject: string
    let emailBody: string
    
    if (inquiryType === 'service') {
      emailSubject = `New Service Inquiry - ${inquiryData.service_type}`
      emailBody = `
        <h2>New Service Inquiry Received</h2>
        <p><strong>Service Type:</strong> ${inquiryData.service_type}</p>
        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Phone:</strong> ${inquiryData.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${inquiryData.company_name || 'Not provided'}</p>
        <p><strong>Location:</strong> ${inquiryData.location || 'Not provided'}</p>
        <p><strong>Budget Range:</strong> ${inquiryData.budget_range || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${inquiryData.timeline || 'Not specified'}</p>
        <p><strong>Preferred Contact:</strong> ${inquiryData.preferred_contact_method}</p>
        <p><strong>Requirements:</strong></p>
        <p>${inquiryData.requirements || 'No additional requirements'}</p>
        
        <hr>
        <p><em>This inquiry was submitted on ${new Date().toLocaleString()}</em></p>
      `
    } else {
      emailSubject = `New Product Inquiry from ${inquiryData.name}`
      emailBody = `
        <h2>New Product Inquiry Received</h2>
        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Phone:</strong> ${inquiryData.phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${inquiryData.message}</p>
        
        <hr>
        <p><em>This inquiry was submitted on ${new Date().toLocaleString()}</em></p>
      `
    }

    // Use Resend API to send email (you'll need to set up Resend)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Expert Office Furnish <noreply@expertoffice.com>', // Use your domain
        to: [companyEmail],
        subject: emailSubject,
        html: emailBody,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Failed to send email:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email notification' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const result = await emailResponse.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        emailId: result.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in send-inquiry-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})