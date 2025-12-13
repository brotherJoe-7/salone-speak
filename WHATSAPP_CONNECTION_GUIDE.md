# WhatsApp Integration Setup Guide for Salone Speaks

## Your WhatsApp Number: +23273446879

### Step 1: Get Your Webhook URL
Your application's webhook URL is:
\`\`\`
https://your-vercel-domain.vercel.app/api/whatsapp/webhook
\`\`\`

Replace `your-vercel-domain` with your actual Vercel deployment domain.

### Step 2: Set Up Meta WhatsApp Business Account

1. Go to [Meta Business Manager](https://business.facebook.com)
2. Create or use existing Business Account
3. Create a WhatsApp Business App (or use existing one)
4. Navigate to **WhatsApp > Getting Started**

### Step 3: Configure Webhook Settings

1. In WhatsApp Business Dashboard, go to **Configuration > Webhooks**
2. Click **Edit** next to the Webhook URL field
3. Enter your webhook URL: `https://your-vercel-domain.vercel.app/api/whatsapp/webhook`
4. Enter a secure **Verify Token** (create a strong random string)

### Step 4: Update Environment Variables

Add these variables to your Vercel project:

\`\`\`
WHATSAPP_WEBHOOK_SECRET=<your-webhook-secret-from-meta>
WHATSAPP_WEBHOOK_TOKEN=<your-verify-token>
NEXT_PUBLIC_WHATSAPP_LINK=https://wa.me/23273446879
\`\`\`

To add variables in Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable above

### Step 5: Connect Your Phone Number

1. In Meta WhatsApp Business Dashboard, go to **Phone Numbers**
2. Click **Add Phone Number**
3. Enter: **+23273446879**
4. Verify ownership using SMS/Call verification
5. Once verified, your number will be linked to the app

### Step 6: Subscribe to Webhooks

In the Webhooks section, subscribe to these events:
- ✅ **messages**
- ✅ **message_template_status_update**
- ✅ **message_status_update**

### Step 7: Test the Connection

Send a WhatsApp message to **+23273446879** from any WhatsApp account.

The message should appear in your Dashboard under the **WhatsApp Messages** tab within 2-3 seconds!

## Troubleshooting

### Messages not appearing?
1. Verify webhook URL is correct and publicly accessible
2. Check that WHATSAPP_WEBHOOK_SECRET and WHATSAPP_WEBHOOK_TOKEN are set correctly
3. Verify your phone number is properly registered in Meta Business Manager
4. Check that message events are subscribed in the webhook settings

### Webhook verification fails?
1. The GET request with `hub.verify_token` must match your WHATSAPP_WEBHOOK_TOKEN
2. Check the exact string you entered - it's case-sensitive

### Messages stored but not showing?
1. Verify RLS policies on the `messages` table are correct
2. Check that your Supabase connection is working

## Support

For Meta WhatsApp API issues, visit: https://developers.facebook.com/docs/whatsapp/cloud-api/

For Salone Speaks specific issues, check your logs in Vercel Dashboard.
