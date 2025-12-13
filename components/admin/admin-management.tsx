"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, UserPlus, CheckCircle2, Users, Crown } from "lucide-react"

interface Admin {
  id: string
  email: string
  role: "admin" | "moderator" | "super_admin"
  created_at: string
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setAdmins(data || [])
    } catch (err) {
      setError("Failed to load admins")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email")
      return
    }

    setIsInviting(true)

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite admin")
      }

      setSuccess(`Invitation sent to ${email}`)
      setEmail("")
      loadAdmins()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleChange = async (adminId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role")
      }

      loadAdmins()
    } catch (err) {
      console.error("Role change error:", err)
      setError("Failed to update admin role")
    }
  }

  return (
    <div className="space-y-8">
      {/* Invite Card */}
      <Card className="border-slate-200 shadow-xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
        <div className="h-2 bg-gradient-to-r from-[#007a5e] via-[#00b896] to-[#0066cc]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#007a5e] text-2xl">
            <UserPlus className="w-6 h-6" />
            Invite New Admin
          </CardTitle>
          <CardDescription className="text-[#0066cc] text-sm">
            Send an invitation to a new admin to join the platform and help manage feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteAdmin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#007a5e] font-bold text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="newadmin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gradient-to-r from-[#e8f5f1] to-white border-[#00b896] text-[#007a5e] placeholder:text-[#00b896]/60 focus:border-[#007a5e] focus:ring-[#007a5e]/20 h-11 transition-all duration-200"
              />
            </div>
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <div className="text-red-600 mt-0.5">⚠️</div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-[#e8f5f1] border-2 border-[#00b896] rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#007a5e] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#007a5e] font-medium">{success}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={isInviting || !email}
              className="w-full bg-gradient-to-r from-[#007a5e] to-[#0066cc] hover:shadow-lg text-white font-bold h-11 transition-all duration-200"
            >
              {isInviting ? "Sending Invitation..." : "Send Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#007a5e] flex items-center gap-2">
              <Users className="w-6 h-6" />
              Current Admins
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Managing {admins.length} team member{admins.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={loadAdmins}
            disabled={isLoading}
            variant="outline"
            className="gap-2 border-[#007a5e] text-[#007a5e] hover:bg-[#e8f5f1] bg-transparent font-semibold transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 border-4 border-[#007a5e]/20 border-t-[#007a5e] rounded-full animate-spin mx-auto" />
              <p className="text-[#007a5e] font-medium">Loading admins...</p>
            </div>
          </div>
        ) : admins.length === 0 ? (
          <Card className="border-2 border-dashed border-[#00b896]/30 bg-gradient-to-br from-[#e8f5f1] to-white">
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="w-12 h-12 text-[#00b896] opacity-30 mx-auto mb-3" />
              <p className="text-[#007a5e] font-medium text-lg">No admins yet.</p>
              <p className="text-sm text-slate-600 mt-2">Start by inviting your first admin above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <Card
                key={admin.id}
                className="border-slate-200 hover:shadow-xl hover:border-[#007a5e] transition-all duration-300 overflow-hidden group bg-white hover:bg-gradient-to-r hover:from-white hover:to-[#e8f5f1]"
              >
                <div className="h-1 bg-gradient-to-r from-[#007a5e] to-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#007a5e] font-bold text-lg truncate">{admin.email}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Joined{" "}
                        {new Date(admin.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select value={admin.role} onValueChange={(value) => handleRoleChange(admin.id, value)}>
                        <SelectTrigger className="w-48 border-2 border-[#00b896] text-[#007a5e] font-semibold focus:border-[#007a5e] focus:ring-[#007a5e]/20 bg-white hover:border-[#007a5e] transition-colors duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-300">
                          <SelectItem value="admin" className="font-semibold">
                            👤 Admin
                          </SelectItem>
                          <SelectItem value="moderator" className="font-semibold">
                            ⚖️ Moderator
                          </SelectItem>
                          <SelectItem value="super_admin" className="font-semibold">
                            👑 Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {admin.role === "super_admin" && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#007a5e] to-[#0066cc] rounded-full">
                          <Crown className="w-4 h-4 text-white" />
                          <span className="text-xs font-bold text-white">SUPER</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
