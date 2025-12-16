"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
    const supabase = createClient()
    
    // Subscribe to new messages
    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages" 
        },
        (payload) => {
          console.log("New message received:", payload.new)
          setMessages((prev) => [payload.new, ...prev])
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const supabase = createClient()
      const { data, error: queryError } = await supabase
        .from("messages")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(100)

      if (queryError) {
        console.error("Query error:", queryError)
        throw queryError
      }
      
      console.log("Loaded messages:", data)
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
      setError(error instanceof Error ? error.message : "Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMessage = async (id: number) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("messages").delete().eq("id", id)
      
      if (error) throw error
      
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Error deleting message:", error)
      setError(error instanceof Error ? error.message : "Failed to delete message")
    }
  }

  const handleRefresh = () => {
    loadMessages()
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
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="mt-2 text-red-600 border-red-200"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2">
        {messages.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-medium">No WhatsApp messages yet</p>
                <p className="text-sm text-slate-400">
                  Messages from WhatsApp will appear here in real-time
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  Refresh
                </Button>
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
                    <p className="text-sm text-slate-700 mt-2 break-words whitespace-pre-wrap">{msg.body}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(msg.received_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMessage(msg.id)}
                    className="text-red-600 hover:bg-red-50 flex-shrink-0"
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
