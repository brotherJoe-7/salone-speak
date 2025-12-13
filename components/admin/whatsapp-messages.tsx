"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMessages()
    const supabase = createClient()
    const subscription = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadMessages = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("messages").select("*").order("received_at", { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMessage = async (id: number) => {
    try {
      const supabase = createClient()
      await supabase.from("messages").delete().eq("id", id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {messages.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium">No WhatsApp messages yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id} className="border-slate-200 hover:border-[#00b896] transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0066cc]">From: {msg.sender}</p>
                    <p className="text-sm text-slate-700 mt-2 break-words">{msg.body}</p>
                    <p className="text-xs text-slate-500 mt-2">{new Date(msg.received_at).toLocaleString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMessage(msg.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
