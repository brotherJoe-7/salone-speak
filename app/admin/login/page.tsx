"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SierraLeoneFlag } from "@/components/sierra-leone-flag"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirm, setSignUpConfirm] = useState("")
  const [signUpLoading, setSignUpLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      router.push("/admin/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !signUpPassword) {
      setError("Email and password are required")
      return
    }

    if (signUpPassword !== signUpConfirm) {
      setError("Passwords do not match")
      return
    }

    if (signUpPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setSignUpLoading(true)

    try {
      const response = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: signUpPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: signUpPassword,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      router.push("/admin/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSignUpLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007a5e] via-[#0066cc] to-[#00b896] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-white/30 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <SierraLeoneFlag className="w-14 h-14 shadow-lg rounded-xl" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#007a5e]">Salone Speaks</CardTitle>
            <CardDescription className="text-[#0066cc]">
              {showSignUp ? "Create your admin account" : "Access the admin dashboard"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={showSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#007a5e] font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#e8f5f1] border-[#00b896] text-[#007a5e] placeholder:text-[#00b896] focus:border-[#007a5e] focus:ring-[#007a5e]/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#007a5e] font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={showSignUp ? signUpPassword : password}
                onChange={(e) => (showSignUp ? setSignUpPassword(e.target.value) : setPassword(e.target.value))}
                className="bg-[#e8f5f1] border-[#00b896] text-[#007a5e] placeholder:text-[#00b896] focus:border-[#007a5e] focus:ring-[#007a5e]/20"
                required
              />
            </div>
            {showSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#007a5e] font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={signUpConfirm}
                  onChange={(e) => setSignUpConfirm(e.target.value)}
                  className="bg-[#e8f5f1] border-[#00b896] text-[#007a5e] placeholder:text-[#00b896] focus:border-[#007a5e] focus:ring-[#007a5e]/20"
                  required
                />
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#007a5e] to-[#0066cc] hover:shadow-lg text-white font-semibold"
              disabled={showSignUp ? signUpLoading : isLoading}
            >
              {showSignUp ? (signUpLoading ? "Creating..." : "Create Account") : isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-[#0066cc] mb-3">
              {showSignUp ? "Already have an account?" : "First time here?"}
            </p>
            <button
              onClick={() => {
                setShowSignUp(!showSignUp)
                setError(null)
              }}
              className="text-sm font-semibold text-[#007a5e] hover:text-[#0066cc] transition-colors"
            >
              {showSignUp ? "Login instead" : "Sign up as admin"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
