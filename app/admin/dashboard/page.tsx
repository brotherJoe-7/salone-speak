"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Users, MessageSquare, MessageCircleIcon } from "lucide-react"
import { SierraLeoneFlag } from "@/components/sierra-leone-flag"
import AdminManagement from "@/components/admin/admin-management"
import FeedbackViewer from "@/components/admin/feedback-viewer"
import WhatsAppMessages from "@/components/admin/whatsapp-messages"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser()

      if (error || !authUser) {
        router.push("/admin/login")
        return
      }

      setUser(authUser)

      const { data: adminData } = await supabase.from("admins").select("role").eq("id", authUser.id).single()

      if (adminData) {
        setRole(adminData.role)
      }
    } catch (err) {
      console.error("Auth check error:", err)
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f5f1] to-[#e6f0ff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#007a5e]/20 border-t-[#007a5e] rounded-full animate-spin mx-auto" />
          <p className="text-[#007a5e] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e8f5f1] to-[#e6f0ff]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SierraLeoneFlag className="w-10 h-10 rounded-lg shadow-md" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#007a5e]">Salone Speaks</span>
              <span className="text-xs text-[#0066cc] font-medium">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-[#007a5e]">{user?.email}</p>
              <p className="text-xs text-[#0066cc] font-semibold uppercase">{role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-[#007a5e] border-[#007a5e] hover:bg-[#007a5e] hover:text-white transition-all bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border-slate-200 mb-8">
            <TabsTrigger
              value="feedback"
              className="gap-2 data-[state=active]:text-[#007a5e] data-[state=active]:border-b-2 data-[state=active]:border-[#007a5e]"
            >
              <MessageSquare className="w-4 h-4" />
              Feedback Analytics
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="gap-2 data-[state=active]:text-[#00b896] data-[state=active]:border-b-2 data-[state=active]:border-[#00b896]"
            >
              <MessageCircleIcon className="w-4 h-4" />
              WhatsApp Messages
            </TabsTrigger>
            {role === "super_admin" && (
              <TabsTrigger
                value="admins"
                className="gap-2 data-[state=active]:text-[#0066cc] data-[state=active]:border-b-2 data-[state=active]:border-[#0066cc]"
              >
                <Users className="w-4 h-4" />
                Admin Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="feedback" className="mt-6 space-y-6">
            <FeedbackViewer />
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-6 space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircleIcon className="w-5 h-5 text-[#00b896]" />
                  WhatsApp Messages
                </CardTitle>
                <CardDescription>Messages received through WhatsApp integration</CardDescription>
              </CardHeader>
              <CardContent>
                <WhatsAppMessages />
              </CardContent>
            </Card>
          </TabsContent>

          {role === "super_admin" && (
            <TabsContent value="admins" className="mt-6 space-y-6">
              <AdminManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
