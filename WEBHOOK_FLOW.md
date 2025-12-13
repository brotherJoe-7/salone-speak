# WhatsApp Webhook Flow - Salone Speaks

## How Messages Flow Into Your Dashboard

### 1. Message Sent
User sends WhatsApp message to **+23273446879**

### 2. Meta Webhooks
Meta's WhatsApp Cloud API detects the message and sends a POST request to:
\`\`\`
https://your-domain.vercel.app/api/whatsapp/webhook
\`\`\`

### 3. Signature Verification
The route handler verifies the request is genuine by:
- Extracting `x-hub-signature-256` header
- Computing HMAC-SHA256 using WHATSAPP_WEBHOOK_SECRET
- Comparing signatures to ensure message came from Meta

### 4. Data Processing
If signature valid, extracts:
- `message.from` - Sender's WhatsApp number
- `message.text.body` - Message content
- `message.timestamp` - When message was sent

### 5. Database Storage
Message is stored in Supabase `messages` table:
\`\`\`sql
INSERT INTO messages (sender, body, received_at)
VALUES ('+234..', 'Message content', NOW())
\`\`\`

### 6. Real-Time Dashboard Update
- WhatsAppMessages component subscribes to `postgres_changes` events
- When new message INSERT detected, component updates instantly
- Message appears in Dashboard without page refresh

## Message Schema

\`\`\`sql
CREATE TABLE messages (
  id BIGINT PRIMARY KEY,
  sender TEXT NOT NULL,           -- WhatsApp number (e.g., +234...)
  body TEXT NOT NULL,              -- Message content
  received_at TIMESTAMP DEFAULT NOW()
)
\`\`\`

## Security Features

✅ **Signature Verification** - Only accept messages from Meta
✅ **RLS Policies** - Only admins can read messages (via Supabase RLS)
✅ **Service Role** - Only service role can insert messages (webhook level)
✅ **Rate Limiting** - Set up in Meta dashboard to prevent spam

## Webhook Response

Route always returns:
\`\`\`json
{ "success": true }
\`\`\`

Even if processing fails, returns 200 to prevent Meta retries on valid requests.
