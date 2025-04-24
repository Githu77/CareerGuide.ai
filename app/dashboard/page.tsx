"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import SkillsForm from "@/components/dashboard/skills-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, BookOpen, Briefcase } from "lucide-react"

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/")
          return
        }

        setUserId(user.id)

        // Get user profile
        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        setProfile(profileData || {})
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  const isNewUser = !profile?.full_name && !profile?.current_skills?.length && !profile?.location

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to CareerGuide</h1>
        <p className="mt-2 text-gray-600">Your personal career assistant for opportunities in Kenya</p>
      </div>

      {isNewUser && (
        <Card className="mb-8 border-blue-100 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-blue-900">Complete Your Profile</CardTitle>
            <CardDescription className="text-blue-700">
              Get started by filling in your details to receive personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild className="gap-2">
              <Link href="/dashboard/profile">
                <User className="h-4 w-4" /> Complete Your Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Job Finder
            </CardTitle>
            <CardDescription className="text-blue-100">Find job opportunities matching your skills</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="mb-4 text-sm text-blue-100">
              Discover jobs aligned with your experience and location preferences.
            </p>
            <Button variant="secondary" className="w-full bg-white text-blue-700 hover:bg-blue-50" asChild>
              <Link href="/dashboard/recommendations?type=job">Explore Jobs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Course Explorer
            </CardTitle>
            <CardDescription className="text-blue-100">Find courses to advance your career</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="mb-4 text-sm text-blue-100">
              Discover educational opportunities to grow your professional skills.
            </p>
            <Button variant="secondary" className="w-full bg-white text-blue-700 hover:bg-blue-50" asChild>
              <Link href="/dashboard/recommendations?type=course">Explore Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> My Profile
            </CardTitle>
            <CardDescription>Manage your career profile</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="mb-4 text-sm text-gray-500">
              Update your skills, experience, and preferences to get better matches.
            </p>
            <Button className="w-full" asChild>
              <Link href="/dashboard/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {userId && <SkillsForm userId={userId} />}
    </div>
  )
}
