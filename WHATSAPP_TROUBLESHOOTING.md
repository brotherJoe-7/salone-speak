# WhatsApp Connection Troubleshooting Guide

## Overview
This guide helps you verify and fix the WhatsApp connection so messages appear in your admin dashboard.

## Quick Verification Checklist

### 1. Environment Variables
Make sure these are set in your Vercel project settings or `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_WHATSAPP_NUMBER=+232XXXXXXXXX
NEXT_PUBLIC_WHATSAPP_LINK=https://wa.me/232XXXXXXXXX
WHATSAPP_WEBHOOK_SECRET=<your-secret-from-whatsapp>
WHATSAPP_WEBHOOK_TOKEN=<your-token-from-whatsapp>
```

### 2. Database Setup
Run the migration script in Supabase SQL Editor:

```bash
# Go to Supabase Dashboard > SQL Editor > New Query
# Copy and run: scripts/003_create_messages_table.sql
```

This creates:
- `messages` table
- Proper Row Level Security (RLS) policies
- Indexes for performance

### 3. WhatsApp Business Platform Setup

#### Step 1: Create a Business App
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Create a new app → Select "Business" type
3. Add WhatsApp product

#### Step 2: Get Credentials
- **Phone Number ID**: From WhatsApp settings
- **Business Account ID**: From settings
- **Access Token**: Generate from App Roles

#### Step 3: Configure Webhook
1. Go to **Configuration** in WhatsApp settings
2. Set webhook URL to: `https://your-domain.com/api/whatsapp/webhook`
3. Use your `WHATSAPP_WEBHOOK_TOKEN` for verification
4. Subscribe to `messages` webhook field

#### Step 4: Webhook Headers
Meta will send requests with:
- Header: `x-hub-signature-256: sha256=<signature>`
- Body: JSON with messages

## How It Works

```
WhatsApp → Your Webhook (/api/whatsapp/webhook)
           ↓
         Verify Signature
           ↓
         Parse Message
           ↓
         Store in Supabase (messages table)
           ↓
         Admin Dashboard (Real-time via subscription)
```

## Testing the Connection

### Test 1: Webhook Verification
```bash
curl -X GET "https://your-domain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
```

Expected response: `test123`

### Test 2: Webhook Signature Verification
Create a test message with proper signature:

```bash
curl -X POST "https://your-domain.com/api/whatsapp/webhook" \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=<signature>" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "1234567890",
            "type": "text",
            "text": { "body": "Test message" }
          }],
          "contacts": [{ "wa_id": "1234567890" }]
        }
      }]
    }]
  }'
```

To generate the correct signature:
```javascript
const crypto = require('crypto');
const body = JSON.stringify({...your webhook body...});
const secret = 'YOUR_WEBHOOK_SECRET';
const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
console.log('sha256=' + signature);
```

### Test 3: Database Query
In Supabase SQL Editor:
```sql
SELECT * FROM messages ORDER BY received_at DESC LIMIT 10;
```

### Test 4: Real-time Subscription
In your browser console on the admin dashboard:
```javascript
const { createClient } = await import('/lib/supabase/client.js');
const supabase = createClient();
supabase
  .channel('public:messages')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

## Common Issues & Fixes

### Issue 1: Webhook Not Receiving Messages
**Symptoms**: No messages in database, no console logs

**Fixes**:
1. Verify webhook URL is publicly accessible
2. Check that `WHATSAPP_WEBHOOK_TOKEN` matches Meta's configuration
3. In Meta Dashboard, verify webhook URL shows "✓ Verified"
4. Check Webhook Logs in Meta Dashboard for error messages

### Issue 2: "Invalid Signature" Error
**Symptoms**: 401 responses, signature verification fails

**Fixes**:
1. Ensure `WHATSAPP_WEBHOOK_SECRET` is set correctly in Vercel
2. Check that signature verification code hasn't been modified
3. Test with curl using generated signature (see Test 2 above)

### Issue 3: Messages Not Appearing on Dashboard
**Symptoms**: Messages stored in database but not showing

**Fixes**:
1. Check RLS policies are correct:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'messages';
   ```
2. Verify real-time subscription in browser console (no errors)
3. Hard refresh dashboard (Ctrl+Shift+R)
4. Check browser console for Supabase subscription errors

### Issue 4: "Supabase credentials not configured"
**Symptoms**: 500 error on webhook

**Fixes**:
1. In Vercel, add `SUPABASE_SERVICE_ROLE_KEY` environment variable
2. This is different from the anon key and has elevated permissions
3. Redeploy after adding the variable

### Issue 5: Real-time Updates Not Working
**Symptoms**: Messages appear after refresh but not in real-time

**Fixes**:
1. Check Supabase project has Realtime enabled
2. Verify RLS policies allow reading
3. Check browser console for subscription errors
4. Try: Dashboard → Realtime → Enable all tables

## Debugging Commands

### Check Webhook Logs (in Node.js console)
The webhook now logs detailed info:
```
Webhook verification attempt. Token match: true
Webhook verified successfully
Received WhatsApp webhook: {...}
Storing message from 1234567890: Hello
Message stored successfully: [...]
```

### Verify Database Connection
```typescript
// In admin dashboard browser console
const supabase = createClient();
const { data, error } = await supabase.from('messages').select('count');
console.log('Messages count:', data);
```

### Check RLS Policy
```sql
-- In Supabase SQL Editor
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies 
WHERE tablename = 'messages';
```

## Database Schema

```sql
CREATE TABLE messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sender TEXT NOT NULL,
  body TEXT NOT NULL,
  received_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies:
-- public_can_read_messages: SELECT for all users
-- service_can_insert_messages: INSERT for service role and authenticated users
```

## Performance Tips

1. **Limit Query Results**: Dashboard loads last 100 messages
2. **Index on received_at**: Ensures fast sorting
3. **Real-time Subscription**: Only watches new INSERTs
4. **Pagination**: Can be added for older messages

## Security Notes

1. **Webhook Secret**: Cryptographically signed requests only
2. **Service Role Key**: Only used server-side, never exposed to client
3. **RLS Policies**: Restricts database access based on user role
4. **Phone Numbers**: Stored as-is from WhatsApp (e.g., "1234567890")

## Next Steps

1. ✅ Verify all environment variables are set
2. ✅ Run database migration (003_create_messages_table.sql)
3. ✅ Configure webhook in Meta Dashboard
4. ✅ Send a test message from WhatsApp
5. ✅ Check admin dashboard for message

## Support Resources

- [Meta WhatsApp API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

## Files Modified

- `/app/api/whatsapp/webhook/route.ts` - Enhanced webhook with better error handling
- `/scripts/003_create_messages_table.sql` - Updated RLS policies
- `/components/admin/whatsapp-messages.tsx` - Better real-time subscription
