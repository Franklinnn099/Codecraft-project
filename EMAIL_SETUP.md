# Email Notification Setup for Inquiries

## Overview
This system now sends email notifications to the company email address whenever a new inquiry (product or service) is submitted, while still storing all inquiries in the dashboard.

## Setup Required

### 1. Deploy the Supabase Edge Function
```bash
# Navigate to your project directory
cd Expert-office-Furnish-final

# Deploy the email notification function
supabase functions deploy send-inquiry-notification
```

### 2. Configure Email Service (Resend)
1. Sign up for a Resend account at https://resend.com
2. Get your API key from the Resend dashboard
3. Add your domain to Resend (or use the default resend domain for testing)

### 3. Set Environment Variables in Supabase
In your Supabase dashboard:
1. Go to Project Settings → Edge Functions → Environment variables
2. Add the following variables:
   - `RESEND_API_KEY`: Your Resend API key

### 4. Update Email Configuration
In the file `supabase/functions/send-inquiry-notification/index.ts`:
- Change `info@expertoffice.com` to your actual company email address (line 18)
- Change `noreply@expertoffice.com` to match your verified domain (line 75)

### 5. Verify Domain (Production)
For production use:
1. In Resend, add and verify your domain (e.g., expertoffice.com)
2. Update the "from" email address in the function to use your verified domain

## How It Works

### Process Flow
1. User submits an inquiry form (product or service)
2. Inquiry is saved to the database (as before)
3. Email notification is sent to company email
4. User sees success message
5. Admin can view inquiries in dashboard (as before)

### Email Content
**Service Inquiries include:**
- Service type, name, email, phone
- Company name, location
- Budget range, timeline
- Preferred contact method
- Requirements

**Product Inquiries include:**
- Name, email, phone
- Message/inquiry details
- Product information (if applicable)

### Fallback Behavior
- If email sending fails, the inquiry is still saved to the database
- Email failures are logged but don't prevent form submission
- Dashboard functionality remains unchanged

## Testing

### Development Testing
1. Submit a test inquiry through the form
2. Check Supabase logs for email function execution
3. Check the company email inbox
4. Verify inquiry appears in admin dashboard

### Production Checklist
- [ ] Supabase Edge Function deployed
- [ ] Resend API key configured
- [ ] Company email address updated
- [ ] Domain verified in Resend
- [ ] Test inquiry submitted and email received

## Email Templates

The system generates professional HTML emails with:
- Clear subject lines indicating inquiry type
- Structured layout with all form data
- Timestamp of submission
- Proper formatting for easy reading

## Troubleshooting

### Common Issues
1. **Email not sent**: Check Resend API key and domain verification
2. **Function timeout**: Check Supabase function logs
3. **Wrong email address**: Verify company email in function code
4. **Spam folder**: Check if emails are going to spam

### Logs
Check logs in:
- Supabase Dashboard → Edge Functions → Logs
- Browser console for client-side errors
- Resend dashboard for email delivery status