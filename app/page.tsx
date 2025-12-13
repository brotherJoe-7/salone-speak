"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Shield, Globe, ArrowRight, CheckCircle2 } from "lucide-react"
import { SierraLeoneFlag } from "@/components/sierra-leone-flag"

export default function HomePage() {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      })

      if (!response.ok) throw new Error("Failed to submit feedback")

      setSubmitStatus("success")
      setMessage("")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e8f5f1] to-[#e6f0ff]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SierraLeoneFlag className="w-12 h-12 shadow-lg hover:shadow-xl transition-shadow rounded-lg" />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-[#007a5e] to-[#0066cc] bg-clip-text text-transparent">
                Salone Speaks
              </span>
              <span className="text-xs text-[#007a5e] font-medium">Amplify Your Voice</span>
            </div>
          </div>
          <Link href="/admin/login">
            <Button className="gap-2 bg-gradient-to-r from-[#007a5e] to-[#0066cc] hover:shadow-lg transition-all text-white">
              Admin Access
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block text-sm font-semibold text-[#0066cc] bg-blue-100 px-4 py-1 rounded-full">
                Community Driven
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
                Your Voice
                <span className="block bg-gradient-to-r from-[#007a5e] via-[#00b896] to-[#0066cc] bg-clip-text text-transparent">
                  Matters Most
                </span>
              </h1>
            </div>
            <p className="text-lg text-slate-700 text-balance leading-relaxed">
              Share your feedback, ideas, and concerns. Help shape the future of Sierra Leone by making your voice heard
              and creating meaningful change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href={process.env.NEXT_PUBLIC_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-[#007a5e] to-[#00b896] hover:shadow-lg text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-[#0066cc] text-[#0066cc] hover:bg-blue-50 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#007a5e]/10 via-[#0066cc]/10 to-[#00b896]/10 rounded-3xl blur-3xl" />
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-white to-slate-100 border border-slate-200 flex items-center justify-center shadow-2xl">
              <div className="text-center space-y-4">
                <div className="text-7xl font-bold bg-gradient-to-r from-[#007a5e] to-[#0066cc] bg-clip-text text-transparent">
                  SL
                </div>
                <p className="text-sm font-semibold text-[#007a5e]">Sierra Leone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Speak Up</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Salone Speaks is built on principles of transparency, security, and community empowerment
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-[#007a5e]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#007a5e]/20 to-[#00b896]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-[#007a5e]" />
              </div>
              <CardTitle className="text-[#007a5e]">Open Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Share freely and safely. Your voice is valued, heard, and part of meaningful discussions.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-[#0066cc]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0066cc]/20 to-blue-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-[#0066cc]" />
              </div>
              <CardTitle className="text-[#0066cc]">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Your privacy is protected with the highest standards of data security and confidentiality.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-[#00b896]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00b896]/20 to-green-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6 text-[#00b896]" />
              </div>
              <CardTitle className="text-[#00b896]">Easy to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Simple, intuitive interface. Multiple ways to reach us and share your important feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-slate-200 shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#007a5e] via-[#00b896] to-[#0066cc]" />
          <CardHeader>
            <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
            <CardDescription>
              Tell us what's on your mind. Your input drives real change in our community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Share your feedback, ideas, or concerns..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-32 border-slate-300 focus:border-[#007a5e] focus:ring-[#007a5e]/20 resize-none"
                  disabled={isSubmitting}
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">{message.length}/500</div>
              </div>
              {submitStatus === "success" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Thank you! Your feedback has been recorded.</p>
                </div>
              )}
              {submitStatus === "error" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">Error submitting feedback. Please try again.</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#007a5e] to-[#0066cc] hover:shadow-lg text-white font-semibold"
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-slate-200 bg-gradient-to-br from-[#e8f5f1] to-[#e6f0ff] py-12 mt-16">
        <div className="mx-auto max-w-6xl px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <SierraLeoneFlag className="w-8 h-8 rounded" />
            <p className="font-semibold text-[#007a5e]">Salone Speaks</p>
          </div>
          <p className="text-[#007a5e]">Amplifying Community Voices Since 2025</p>
          <p className="text-xs text-[#0066cc]">Sierra Leone</p>
        </div>
      </footer>
    </div>
  )
}
