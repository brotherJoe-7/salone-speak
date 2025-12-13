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

    // Check if any admins exist
    const { count } = await supabase.from("admins").select("*", { count: "exact", head: true })

    // Determine role: first admin is super_admin, others are admin
    const role = (count ?? 0) === 0 ? "super_admin" : "admin"

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message || "Failed to create account" }, { status: 400 })
    }

    // Create admin record in public schema
    const { error: adminError } = await supabase.from("admins").insert([
      {
        id: authData.user.id,
        email,
        role,
      },
    ])

    if (adminError) {
      console.error("Admin creation error:", adminError)
      // Try to clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create admin record" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Account created successfully", role }, { status: 201 })
  } catch (error) {
    console.error("Error in signup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
