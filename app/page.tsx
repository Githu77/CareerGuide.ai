"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import { Briefcase, GraduationCap, MapPin } from "lucide-react"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const showSignup = searchParams.get("signup") === "true"

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data.session) {
          // Session exists, redirect to dashboard
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Auth error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto py-4 flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold mr-2">
            CG
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            CareerGuide
          </h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Find Your Perfect Career Path in Kenya</h2>
              <p className="text-lg text-gray-600">
                CareerGuide helps you discover personalized job opportunities and professional development courses
                tailored to your skills and location.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 mt-1">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Personalized Job Recommendations</h3>
                    <p className="text-gray-600">Get job matches based on your unique skills and experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 mt-1">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Skill-Building Courses</h3>
                    <p className="text-gray-600">Discover courses to develop your professional capabilities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 mt-1">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Location-Based Matching</h3>
                    <p className="text-gray-600">Find opportunities relevant to your location in Kenya</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              {showSignup ? <SignupForm /> : <LoginForm />}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-4">
        <div className="container mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CareerGuide | Empowering Kenyan careers
        </div>
      </footer>
    </div>
  )
}
