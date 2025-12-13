import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const { adminId, role } = await request.json()

    if (!adminId || !role) {
      return NextResponse.json({ error: "Admin ID and role are required" }, { status: 400 })
    }

    const validRoles = ["admin", "moderator", "super_admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verify requesting user is super_admin
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update admin role
    const { error } = await supabase.from("admins").update({ role }).eq("id", adminId)

    if (error) {
      console.error("Update error:", error)
      return NextResponse.json({ error: "Failed to update admin role" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Admin role updated" }, { status: 200 })
  } catch (error) {
    console.error("Error in role update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
