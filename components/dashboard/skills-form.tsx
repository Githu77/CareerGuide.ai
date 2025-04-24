"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { trackEvent } from "@/lib/analytics"

export default function SkillsForm({ userId }: { userId: string }) {
  const [currentSkills, setCurrentSkills] = useState("")
  const [desiredSkills, setDesiredSkills] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) throw error

        if (data) {
          setCurrentSkills(data.current_skills?.join(", ") || "")
          setDesiredSkills(data.desired_skills?.join(", ") || "")
          setLocation(data.location || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent, type: "job" | "course") => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!currentSkills.trim()) {
        throw new Error("Please enter at least one current skill")
      }

      if (!location.trim()) {
        throw new Error("Please enter your location in Kenya")
      }

      // Track this event
      trackEvent(userId, `search_${type}`, {
        skills_count: currentSkills.split(",").filter(Boolean).length,
        location,
      })

      // Update user profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          current_skills: currentSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          desired_skills: desiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          location: location.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) throw updateError

      // Get recommendations
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          skills: currentSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          location: location.trim(),
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get recommendations")
      }

      router.push(`/dashboard/recommendations?type=${type}`)
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return <div className="flex justify-center p-8">Loading profile...</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Find Opportunities</CardTitle>
        <CardDescription>Enter your skills and location to get personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentSkills">Current Skills (comma separated)</Label>
            <Textarea
              id="currentSkills"
              placeholder="HTML, CSS, JavaScript, Communication"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desiredSkills">Desired Skills (comma separated)</Label>
            <Textarea
              id="desiredSkills"
              placeholder="React, Node.js, Project Management"
              value={desiredSkills}
              onChange={(e) => setDesiredSkills(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location in Kenya</Label>
            <Input
              id="location"
              placeholder="Nairobi, Mombasa, Kisumu, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button onClick={(e) => handleSubmit(e, "job")} className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Find Jobs"}
        </Button>
        <Button onClick={(e) => handleSubmit(e, "course")} className="w-full" variant="outline" disabled={loading}>
          {loading ? "Loading..." : "Recommend Courses"}
        </Button>
      </CardFooter>
    </Card>
  )
}
