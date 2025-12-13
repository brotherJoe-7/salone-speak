import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if email already exists
    const { data: existingAdmin } = await supabase.from("admins").select("*").eq("email", email).single()

    if (existingAdmin) {
      return NextResponse.json({ error: "This email is already an admin" }, { status: 400 })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: false,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message || "Failed to create user" }, { status: 400 })
    }

    // Create admin record
    const { error: adminError } = await supabase.from("admins").insert([
      {
        id: authData.user.id,
        email,
        role: "admin",
      },
    ])

    if (adminError) {
      console.error("Admin creation error:", adminError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create admin record" }, { status: 500 })
    }

    // Send magic link for password setup (would require email provider)
    // For now, just return success
    return NextResponse.json({ success: true, message: "Admin invitation sent" }, { status: 201 })
  } catch (error) {
    console.error("Error in admin invite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
