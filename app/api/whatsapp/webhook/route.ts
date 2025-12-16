import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Verify webhook signature
function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!secret) {
    console.warn("WHATSAPP_WEBHOOK_SECRET not configured")
    return false
  }
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex")
  const isValid = signature === hash
  if (!isValid) {
    console.warn("Signature mismatch. Expected:", hash, "Got:", signature)
  }
  return isValid
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-hub-signature-256") || ""

    // Verify the webhook signature
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("WHATSAPP_WEBHOOK_SECRET environment variable is not set")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    const isValid = verifySignature(body, signature.replace("sha256=", ""), webhookSecret)

    if (!isValid) {
      console.warn("Invalid WhatsApp webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)
    console.log("Received WhatsApp webhook:", JSON.stringify(data, null, 2))

    // Handle different WhatsApp event types
    if (data.object === "whatsapp_business_account") {
      const entries = data.entry || []
      
      // Create Supabase client with service role key for elevated permissions
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Supabase credentials not configured")
        return NextResponse.json({ error: "Database not configured" }, { status: 500 })
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      for (const entry of entries) {
        const changes = entry.changes || []

        for (const change of changes) {
          const messageData = change.value

          if (messageData.messages && messageData.messages.length > 0) {
            // Process incoming message
            const message = messageData.messages[0]
            const contacts = messageData.contacts || []
            const contact = contacts[0] || {}

            // Extract message text
            let messageBody = ""
            if (message.type === "text") {
              messageBody = message.text.body
            } else if (message.type === "image") {
              messageBody = "[Image message received]"
            } else if (message.type === "document") {
              messageBody = "[Document message received]"
            } else if (message.type === "audio") {
              messageBody = "[Audio message received]"
            } else if (message.type === "video") {
              messageBody = "[Video message received]"
            }

            // Store message in Supabase
            if (messageBody) {
              try {
                const senderNumber = contact.wa_id || message.from || "Unknown"
                console.log(`Storing message from ${senderNumber}: ${messageBody}`)
                
                const { data, error } = await supabase.from("messages").insert([
                  {
                    sender: senderNumber,
                    body: messageBody,
                    received_at: new Date().toISOString(),
                  },
                ])

                if (error) {
                  console.error("Error storing message:", error)
                } else {
                  console.log("Message stored successfully:", data)
                }
              } catch (error) {
                console.error("Error storing message:", error)
              }
            }
          }

          if (messageData.statuses && messageData.statuses.length > 0) {
            // Handle message delivery status
            const status = messageData.statuses[0]
            console.log("Message status:", status.status, "for message:", status.id)
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const verify_token = request.nextUrl.searchParams.get("hub.verify_token")
    const challenge = request.nextUrl.searchParams.get("hub.challenge")
    const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN

    console.log("Webhook verification attempt. Token match:", verify_token === expectedToken)

    // Verify the token
    if (verify_token === expectedToken) {
      console.log("Webhook verified successfully")
      return new NextResponse(challenge, { status: 200 })
    }

    console.warn("Invalid verify token. Expected:", expectedToken, "Got:", verify_token)
    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 })
  } catch (error) {
    console.error("WhatsApp webhook verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
