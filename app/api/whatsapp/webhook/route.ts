import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"

// Verify webhook signature
function verifySignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return signature === hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-hub-signature-256") || ""

    // Verify the webhook signature
    const isValid = verifySignature(body, signature.replace("sha256=", ""), process.env.WHATSAPP_WEBHOOK_SECRET || "")

    if (!isValid) {
      console.warn("Invalid WhatsApp webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)

    // Handle different WhatsApp event types
    if (data.object === "whatsapp_business_account") {
      const entries = data.entry || []
      const supabase = await createClient()

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
            }

            // Store message in Supabase
            if (messageBody) {
              try {
                await supabase.from("messages").insert([
                  {
                    sender: contact.wa_id || message.from,
                    body: messageBody,
                  },
                ])
              } catch (error) {
                console.error("Error storing message:", error)
              }
            }
          }

          if (messageData.statuses && messageData.statuses.length > 0) {
            // Handle message delivery status
            const status = messageData.statuses[0]
            console.log("Message status:", status)
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

    // Verify the token
    if (verify_token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
      return new NextResponse(challenge, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 })
  } catch (error) {
    console.error("WhatsApp webhook verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
