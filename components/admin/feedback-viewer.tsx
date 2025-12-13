"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2, ThumbsUp, ThumbsDown, MessageCircle, Zap, Award } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Feedback {
  id: number
  message: string
  email: string | null
  sentiment: "positive" | "negative" | "neutral"
  created_at: string
}

export default function FeedbackViewer() {
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeedback()
  }, [])

  const loadFeedback = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setAllFeedback(data || [])
    } catch (err) {
      setError("Failed to load feedback")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("feedback").delete().eq("id", id)

      if (error) throw error

      setAllFeedback(allFeedback.filter((f) => f.id !== id))
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const positiveFeedback = allFeedback.filter((f) => f.sentiment === "positive")
  const negativeFeedback = allFeedback.filter((f) => f.sentiment === "negative")
  const brotherJosephMessages = allFeedback.filter((f) => f.email === "brotherjoseph79@gmail.com")

  const renderFeedbackList = (items: Feedback[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <Card className="border border-dashed border-[#00b896]/30 bg-gradient-to-br from-[#e8f5f1] to-white">
          <CardContent className="pt-12 pb-12 text-center">
            <MessageCircle className="w-12 h-12 text-[#00b896] opacity-30 mx-auto mb-3" />
            <p className="text-[#007a5e] font-medium text-lg">{emptyMessage}</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="border-slate-200 hover:shadow-xl hover:border-[#007a5e] transition-all duration-300 overflow-hidden group bg-white hover:bg-gradient-to-r hover:from-white hover:to-[#e8f5f1]"
          >
            <div className="h-1 bg-gradient-to-r from-[#007a5e] to-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <p className="text-[#007a5e] leading-relaxed text-base font-medium">{item.message}</p>
                  <div className="flex flex-col gap-2 pt-2">
                    {item.email && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#0066cc]" />
                        <p className="text-sm text-[#0066cc] font-semibold">{item.email}</p>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      📅 {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Feedback Card */}
        <Card className="border-slate-200 bg-gradient-to-br from-[#e6f0ff] via-white to-[#e6f0ff] hover:shadow-2xl transition-all duration-300 group cursor-default overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#0066cc] opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold text-[#0066cc] tracking-wider">Total Feedback</p>
                <p className="text-4xl font-bold text-[#0066cc] group-hover:scale-110 transition-transform origin-left">
                  {allFeedback.length}
                </p>
              </div>
              <div className="p-3 bg-[#0066cc]/10 rounded-lg group-hover:bg-[#0066cc]/20 transition-colors">
                <MessageCircle className="w-8 h-8 text-[#0066cc]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positive Feedback Card */}
        <Card className="border-slate-200 bg-gradient-to-br from-[#e8f5f1] via-white to-[#e8f5f1] hover:shadow-2xl transition-all duration-300 group cursor-default overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#007a5e] opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold text-[#007a5e] tracking-wider">Positive</p>
                <p className="text-4xl font-bold text-[#007a5e] group-hover:scale-110 transition-transform origin-left">
                  {positiveFeedback.length}
                </p>
              </div>
              <div className="p-3 bg-[#007a5e]/10 rounded-lg group-hover:bg-[#007a5e]/20 transition-colors">
                <ThumbsUp className="w-8 h-8 text-[#007a5e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Negative Feedback Card */}
        <Card className="border-slate-200 bg-gradient-to-br from-[#fee]/10 via-white to-[#fee]/10 hover:shadow-2xl transition-all duration-300 group cursor-default overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold text-red-600 tracking-wider">Negative</p>
                <p className="text-4xl font-bold text-red-600 group-hover:scale-110 transition-transform origin-left">
                  {negativeFeedback.length}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <ThumbsDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Speak Salone Card */}
        <Card className="border-slate-200 bg-gradient-to-br from-[#e8f5f1] via-[#e6f0ff] to-white hover:shadow-2xl transition-all duration-300 group cursor-default overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#00b896] opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold text-[#00b896] tracking-wider">Speak Salone</p>
                <p className="text-4xl font-bold text-[#00b896] group-hover:scale-110 transition-transform origin-left">
                  {brotherJosephMessages.length}
                </p>
              </div>
              <div className="p-3 bg-[#00b896]/10 rounded-lg group-hover:bg-[#00b896]/20 transition-colors">
                <Award className="w-8 h-8 text-[#00b896]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border-b-2 border-slate-200 h-auto p-1 gap-1 rounded-none">
          <TabsTrigger
            value="all"
            className="relative data-[state=active]:text-[#0066cc] data-[state=active]:font-bold data-[state=active]:bg-[#e6f0ff] rounded-t-lg transition-all duration-200"
          >
            All Feedback
          </TabsTrigger>
          <TabsTrigger
            value="positive"
            className="relative data-[state=active]:text-[#007a5e] data-[state=active]:font-bold data-[state=active]:bg-[#e8f5f1] rounded-t-lg transition-all duration-200"
          >
            Positive
          </TabsTrigger>
          <TabsTrigger
            value="negative"
            className="relative data-[state=active]:text-red-600 data-[state=active]:font-bold data-[state=active]:bg-red-50 rounded-t-lg transition-all duration-200"
          >
            Negative
          </TabsTrigger>
          <TabsTrigger
            value="speak-salone"
            className="relative data-[state=active]:text-[#00b896] data-[state=active]:font-bold data-[state=active]:bg-[#e8f5f1] rounded-t-lg transition-all duration-200"
          >
            Speak Salone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold text-[#007a5e]">All Community Feedback</h3>
              <p className="text-sm text-slate-600 mt-1">Total: {allFeedback.length} responses</p>
            </div>
            <Button
              onClick={loadFeedback}
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-[#007a5e] to-[#0066cc] hover:shadow-lg text-white transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <Card className="bg-red-50 border-red-200 border-2">
              <CardContent className="pt-6">
                <p className="text-red-700 font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {error}
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-[#007a5e]/20 border-t-[#007a5e] rounded-full animate-spin mx-auto" />
                <p className="text-[#007a5e] font-medium">Loading feedback...</p>
              </div>
            </div>
          ) : (
            renderFeedbackList(allFeedback, "No feedback yet. Check back soon!")
          )}
        </TabsContent>

        <TabsContent value="positive" className="mt-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-[#007a5e]">Positive Feedback</h3>
            <p className="text-sm text-slate-600 mt-1">Total: {positiveFeedback.length} positive responses</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-[#007a5e]/20 border-t-[#007a5e] rounded-full animate-spin mx-auto" />
                <p className="text-[#007a5e] font-medium">Loading feedback...</p>
              </div>
            </div>
          ) : (
            renderFeedbackList(positiveFeedback, "No positive feedback yet. Encourage more positive responses!")
          )}
        </TabsContent>

        <TabsContent value="negative" className="mt-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-red-600">Negative Feedback</h3>
            <p className="text-sm text-slate-600 mt-1">Total: {negativeFeedback.length} negative responses</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-[#007a5e]/20 border-t-[#007a5e] rounded-full animate-spin mx-auto" />
                <p className="text-[#007a5e] font-medium">Loading feedback...</p>
              </div>
            </div>
          ) : (
            renderFeedbackList(negativeFeedback, "No negative feedback yet. That's great!")
          )}
        </TabsContent>

        <TabsContent value="speak-salone" className="mt-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-[#00b896]">Speak Salone Messages</h3>
            <p className="text-sm text-slate-600 mt-1">
              Messages from brotherjoseph79@gmail.com (Total: {brotherJosephMessages.length})
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-[#007a5e]/20 border-t-[#007a5e] rounded-full animate-spin mx-auto" />
                <p className="text-[#007a5e] font-medium">Loading messages...</p>
              </div>
            </div>
          ) : (
            renderFeedbackList(brotherJosephMessages, "No messages from Speak Salone yet.")
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
