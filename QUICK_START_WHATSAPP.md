# 🚀 Quick Start: Connect WhatsApp to Salone Speaks

## What You Need
- Meta Business Account
- WhatsApp Business App created
- Phone number: **+23273446879**
- Your Vercel deployment domain

## 5-Minute Setup

### ⚙️ Step 1: Copy Your Webhook URL
\`\`\`
https://YOUR-PROJECT.vercel.app/api/whatsapp/webhook
\`\`\`

### 📱 Step 2: Go to Meta Dashboard
Visit: https://developers.facebook.com/apps/
- Select your WhatsApp app
- Go to **Configuration** 

### 🔗 Step 3: Add Webhook
- URL: `https://YOUR-PROJECT.vercel.app/api/whatsapp/webhook`
- Verify Token: Create a random string (e.g., `salone_speaks_2024`)

### 🔑 Step 4: Set Environment Variables in Vercel
\`\`\`
WHATSAPP_WEBHOOK_TOKEN=salone_speaks_2024
WHATSAPP_WEBHOOK_SECRET=<copy from Meta>
NEXT_PUBLIC_WHATSAPP_LINK=https://wa.me/23273446879
\`\`\`

### ☎️ Step 5: Add Phone Number
- Go to **Phone Numbers** in Meta Dashboard
- Add **+23273446879**
- Complete SMS verification

### ✔️ Step 6: Subscribe to Webhooks
Select these events:
- messages
- message_status_update

### 🧪 Step 7: Test
Send WhatsApp message to **+23273446879** from any phone.

**It should appear in your Dashboard instantly!**

---

## Dashboard Features

Once connected, see all messages in:
**Admin Dashboard → WhatsApp Messages Tab**

- 📨 See all incoming WhatsApp messages in real-time
- 🗑️ Delete messages you don't need
- 🔔 Auto-refresh as new messages arrive
- 📊 Combined view with feedback analytics

---

## Need Help?

| Issue | Solution |
|-------|----------|
| Messages not appearing | Check webhook URL is public & environment variables are set |
| Webhook verification fails | Verify Token must match exactly (case-sensitive) |
| Can't add phone number | Ensure account passes Meta's WhatsApp approval |
| Messages deleted from dashboard | Refresh page - check Supabase directly if needed |

---

**Webhook URL Format** (Must be HTTPS):
\`\`\`
https://yourproject.vercel.app/api/whatsapp/webhook
\`\`\`

**NOT:**
- http://localhost:3000/... (local won't work)
- Shortened URL/custom domain may cause issues
