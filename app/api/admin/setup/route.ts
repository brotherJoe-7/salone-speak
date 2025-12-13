import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Use service role key for admin creation (bypasses RLS)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message || "Failed to create admin user" }, { status: 400 })
    }

    // Create admin record in public schema
    const { error: adminError } = await supabase.from("admins").insert([
      {
        id: authData.user.id,
        email,
        role: "super_admin",
      },
    ])

    if (adminError) {
      console.error("Admin creation error:", adminError)
      // Try to clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create admin record" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Admin created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error in admin setup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if any admins exist
    const { count, error } = await supabase.from("admins").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error checking admins:", error)
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({
      exists: (count ?? 0) > 0,
      count,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ exists: false })
  }
}
