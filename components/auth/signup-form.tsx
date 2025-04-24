"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            created_at: new Date().toISOString(),
          },
          emailConfirm: false,
        },
      })

      if (error) throw error

      if (data.user) {
        // Sign in the user immediately after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <CardHeader className="space-y-1 p-0 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
        <CardDescription className="text-center">Join CareerGuide to discover opportunities in Kenya</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center p-0 pt-4">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push("/")}>
            Log in
          </Button>
        </p>
      </CardFooter>
    </div>
  )
}
