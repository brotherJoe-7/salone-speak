# WhatsApp Integration Setup for Salone Speaks

## Environment Variables Required

Add these to your Vercel project environment variables:

\`\`\`
NEXT_PUBLIC_WHATSAPP_NUMBER=+232XXXXXXXXX
NEXT_PUBLIC_WHATSAPP_LINK=https://wa.me/232XXXXXXXXX
WHATSAPP_WEBHOOK_SECRET=<secure-random-string>
WHATSAPP_WEBHOOK_TOKEN=<secure-random-string>
\`\`\`

## Database Migration

The `scripts/003_create_messages_table.sql` migration creates:
- `messages` table with columns: id, sender, body, received_at
- Row Level Security (RLS) enabled
- Public read access and service role insert access

Run this script in your Supabase dashboard or it will auto-execute.

## Webhook Configuration

1. **Webhook Route**: `/api/whatsapp/webhook`
2. **Verification**: The webhook verifies incoming requests using WHATSAPP_WEBHOOK_SECRET and WHATSAPP_WEBHOOK_TOKEN
3. **Message Storage**: Incoming WhatsApp messages are automatically stored in the `messages` table
4. **Real-time Updates**: Admin dashboard receives real-time message updates via Supabase subscriptions

## Admin Dashboard Features

**Three main tabs:**
1. **Feedback Analytics** - Shows 4 stat cards and feedback filtering
   - Total Feedback count
   - Positive feedback count
   - Negative feedback count
   - Speak Salone messages (from brotherjoseph79@gmail.com)
   - Tabbed views for All, Positive, Negative, and Speak Salone

2. **WhatsApp Messages** - Shows incoming WhatsApp messages
   - Real-time message updates
   - Display sender phone number and message body
   - Delete individual messages
   - Empty state when no messages

3. **Admin Management** (Super admin only) - Manage admin roles and invitations

## Public Feedback System

**Homepage Features:**
- Beautiful hero section with Sierra Leone branding
- Feedback submission form with email field
- Real-time sentiment analysis
- WhatsApp integration button (links to NEXT_PUBLIC_WHATSAPP_LINK)
- Three feature cards explaining benefits

## Colors Used

All components use Sierra Leone national colors:
- **Primary Green**: #007a5e
- **Secondary Green**: #00b896
- **Blue**: #0066cc
- **White**: #ffffff

## File Structure

\`\`\`
app/
├── page.tsx (Homepage with feedback form and WhatsApp button)
├── api/
│   ├── feedback/route.ts (Feedback submission)
│   ├── admin/
│   │   ├── signup/route.ts (First signup becomes super_admin)
│   │   ├── login/route.ts
│   │   └── whatsapp/webhook/route.ts (WhatsApp message handler)
│   └── admin/dashboard/page.tsx (Dashboard with all tabs)
├── admin/
│   ├── login/page.tsx (Admin login)
│   └── dashboard/page.tsx (Main admin panel)
└── globals.css (Sierra Leone color theme)

components/
├── admin/
│   ├── feedback-viewer.tsx (Feedback analytics)
│   ├── whatsapp-messages.tsx (WhatsApp message display)
│   └── admin-management.tsx (Admin role management)
└── sierra-leone-flag.tsx (Flag logo SVG)

lib/
└── supabase/
    ├── client.ts (Browser client)
    └── server.ts (Server client)

scripts/
├── 001_create_schema.sql (Initial schema)
├── 002_add_sentiment_and_email.sql (Sentiment analysis)
└── 003_create_messages_table.sql (WhatsApp messages)
\`\`\`

## Next Steps

1. Add environment variables to Vercel project
2. Run database migrations in Supabase
3. Configure WhatsApp webhook in Meta/Facebook developer dashboard
4. Deploy to Vercel

The application is now fully functional with all requested features!
