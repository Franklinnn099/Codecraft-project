# Setting up Resend for Supabase Authentication Emails

You have successfully added the `RESEND_API_KEY` to your project, which enables the **Welcome Email**.

To enable **Confirmation Emails** (Verify Account) and **Password Reset Emails** via Supabase, follow these steps:

## 1. Go to Supabase Dashboard
1. Open your project in Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on **Authentication** (User icon in left sidebar).
3. Under Configuration, click **Providers**.
4. Click on **Email**.

## 2. Configure Custom SMTP
1. Toggle **"Enable Custom SMTP"** to **ON**.
2. Fill in the specific Resend details below:

| Setting | Value |
|---------|-------|
| **Sender Email** | `onboarding@resend.dev` (Use this for testing) <br> OR `yourname@yourdomain.com` (If you verified a domain on Resend) |
| **Sender Name** | `Expert Office Furnish` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` (Recommended) or `587` |
| **Username** | `resend` (Exactly this word) |
| **Password** | `re_...` (YOUR Resend API Key that you generated) |

## 3. Save & Test
1. Click **Save**.
2. Try signing up again on your website.

## Why is this necessary?
Supabase's built-in email service has strict limits (approx 3/hour). By connecting Resend, you bypass these limits and ensure users always receive their confirmation links instantly.
