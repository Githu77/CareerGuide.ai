"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import RecommendationCard from "@/components/dashboard/recommendation-card"
import RecommendationSkeleton from "@/components/dashboard/recommendation-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trackEvent } from "@/lib/analytics"
import { RefreshCw, ArrowLeft, Bookmark } from "lucide-react"

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get("type") as "job" | "course"

  useEffect(() => {
    async function getRecommendations() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/")
          return
        }

        setUserId(user.id)

        if (!type || (type !== "job" && type !== "course")) {
          setError("Invalid recommendation type")
          setLoading(false)
          return
        }

        // Track this view for analytics
        trackEvent(user.id, `view_${type}_recommendations`, { type })

        // Get the latest recommendation from Supabase
        const { data, error } = await supabase
          .from("recommendations")
          .select("*")
          .eq("user_id", user.id)
          .eq("type", type)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          if (error.code === "PGRST116") {
            // No recommendations found
            setRecommendations([])
            setLoading(false)
            return
          }
          throw error
        }

        if (data && data.content && data.content.items) {
          setRecommendations(data.content.items)
        } else if (data && data.content && data.content.raw) {
          // Handle raw content if parsing failed
          setError("Could not parse recommendations properly. Raw data is displayed.")
          setRecommendations([{ title: "Raw Recommendations", description: data.content.raw }])
        } else {
          setError("No recommendations found")
        }
      } catch (error: any) {
        console.error("Error fetching recommendations:", error)
        setError(error.message || "Failed to load recommendations")
      } finally {
        setLoading(false)
      }
    }

    getRecommendations()
  }, [type, router])

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)

    try {
      // Get user profile to get skills and location
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("current_skills, location")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      if (!profile.current_skills || !profile.current_skills.length || !profile.location) {
        setError("Please update your profile with skills and location first")
        setRefreshing(false)
        return
      }

      // Get new recommendations
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          skills: profile.current_skills,
          location: profile.location,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get recommendations")
      }

      const data = await response.json()

      if (data.recommendations && data.recommendations.items) {
        setRecommendations(data.recommendations.items)
      } else {
        setError("Could not generate recommendations")
      }
    } catch (error: any) {
      console.error("Error refreshing recommendations:", error)
      setError(error.message || "Failed to refresh recommendations")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {type === "job" ? "Job Recommendations" : "Course Recommendations"}
          </h1>
          <p className="mt-2 text-gray-600">
            {type === "job"
              ? "Discover job opportunities matching your skills and location"
              : "Find courses to enhance your professional skills"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" onClick={handleRefresh} disabled={loading || refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/saved")} className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <RecommendationSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Recommendations</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={() => router.push("/dashboard/profile")}>Update Your Profile</Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No recommendations yet</CardTitle>
            <CardDescription>
              We couldn't find any {type === "job" ? "job" : "course"} recommendations based on your current profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={handleRefresh}>Generate Recommendations</Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/profile")}>
              Update Your Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((item, index) => (
            <RecommendationCard key={index} type={type} data={item} userId={userId || ""} />
          ))}
        </div>
      )}
    </div>
  )
}
