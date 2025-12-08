# How to Get EmailJS Keys

Follow these steps to find the 3 keys needed for your website.

## 1. Get Service ID
1. Log in to your [EmailJS Dashboard](https://dashboard.emailjs.com/).
2. Click on **Email Services** in the left sidebar.
3. You should see your connected Gmail service (e.g., "Gmail").
4. The **Service ID** is listed right there (usually looks like `service_xxxxxx`).
   - *If you haven't added a service yet, click "Add New Service" -> Select Gmail -> Connect Account -> Create Service.*

## 2. Get Template ID
1. Click on **Email Templates** in the sidebar.
2. Click on your Welcome Email template (or "Create New Template").
3. In the template editor, look at the top-left corner under the name.
4. You will see **ID: template_xxxxxx**. This is your Template ID.
   - *Tip: Design your email here using variables like `{{to_name}}` and `{{message}}`.*

## 3. Get Public Key
1. Click on your **Name/Avatar** in the top-right corner.
2. Click **Dashboard** (or explicitly **Account** depending on layout).
3. Look for the **Integration** or **API Keys** tab.
4. Scroll down to **"Public Key"**.
5. It usually starts with `user_...` or just a random string.

## What to do next?
Copy these 3 keys and paste them into `apps/client-site/src/pages/AuthPage.jsx`:

```javascript
const SERVICE_ID = "service_xxxxxx";
const TEMPLATE_ID = "template_xxxxxx";
const PUBLIC_KEY = "your_public_key";
```
