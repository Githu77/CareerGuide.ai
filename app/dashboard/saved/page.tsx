"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import SavedItem from "@/components/dashboard/saved-item"

export default function SavedRecommendations() {
  const [savedItems, setSavedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadSavedItems() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/")
          return
        }

        // Get saved recommendations
        const { data, error } = await supabase
          .from("saved_recommendations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setSavedItems(data || [])
      } catch (error) {
        console.error("Error loading saved items:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSavedItems()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        <span className="ml-2">Loading saved items...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Recommendations</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      {!savedItems || savedItems.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">No saved recommendations yet</h2>
          <p className="mb-4 text-gray-600">When you find jobs or courses you like, save them to view them later.</p>
          <Button asChild>
            <Link href="/dashboard">Find Opportunities</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedItems.map((item) => (
            <SavedItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
