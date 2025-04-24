"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ExternalLink, Trash2, Building, MapPin, Clock, GraduationCap } from "lucide-react"

type SavedItemProps = {
  item: any
}

export default function SavedItem({ item }: SavedItemProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this saved item?")) return

    setLoading(true)
    try {
      const { error } = await supabase.from("saved_recommendations").delete().eq("id", item.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting saved item:", error)
    } finally {
      setLoading(false)
    }
  }

  // Ensure URL has protocol
  const ensureHttps = (url?: string) => {
    if (!url) return "#"
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    return `https://${url}`
  }

  // Format URL for display
  const formatUrl = (url?: string) => {
    if (!url) return null
    try {
      const urlObj = new URL(ensureHttps(url))
      return urlObj.hostname
    } catch (e) {
      return url
    }
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <div
        className={`h-2 w-full ${item.type === "job" ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gradient-to-r from-indigo-600 to-indigo-700"}`}
      ></div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={`text-lg ${item.type === "job" ? "text-blue-800" : "text-indigo-800"}`}>
              {item.title || (item.type === "job" ? "Job Opportunity" : "Course Recommendation")}
            </CardTitle>
            <CardDescription>{item.type === "job" ? "Job Opportunity" : "Course Recommendation"}</CardDescription>

            {item.type === "job" && item.details.company && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <Building className={`h-3 w-3 ${item.type === "job" ? "text-blue-500" : "text-indigo-500"}`} />
                <span>{item.details.company}</span>
              </CardDescription>
            )}

            {item.type === "job" && item.details.location && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className={`h-3 w-3 ${item.type === "job" ? "text-blue-500" : "text-indigo-500"}`} />
                <span>{item.details.location}</span>
              </CardDescription>
            )}

            {item.type === "course" && item.details.provider && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <GraduationCap className={`h-3 w-3 ${item.type === "job" ? "text-blue-500" : "text-indigo-500"}`} />
                <span>{item.details.provider}</span>
              </CardDescription>
            )}

            {item.type === "course" && item.details.duration && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className={`h-3 w-3 ${item.type === "job" ? "text-blue-500" : "text-indigo-500"}`} />
                <span>{item.details.duration}</span>
              </CardDescription>
            )}

            {item.url && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <ExternalLink className={`h-3 w-3 ${item.type === "job" ? "text-blue-500" : "text-indigo-500"}`} />
                <a
                  href={ensureHttps(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover:underline ${item.type === "job" ? "text-blue-600" : "text-indigo-600"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {formatUrl(item.url)}
                </a>
              </CardDescription>
            )}
          </div>
          <Bookmark className={`h-5 w-5 ${item.type === "job" ? "text-blue-500" : "text-indigo-500"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {item.type === "job" ? (
            <>
              <div>
                <p className="text-sm font-medium mb-1">Salary:</p>
                <p className="text-sm">{item.details.salary || "Not specified"}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Required Skills:</p>
                {item.details.skills ? (
                  <div className="flex flex-wrap gap-1">
                    {item.details.skills.split(/,|;/).map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">Not specified</p>
                )}
              </div>

              {item.details.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description:</p>
                  <p className="text-sm line-clamp-3">{item.details.description}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium mb-1">Provider:</p>
                <p className="text-sm">{item.details.provider || "Not specified"}</p>
              </div>

              {item.details.duration && (
                <div>
                  <p className="text-sm font-medium mb-1">Duration:</p>
                  <p className="text-sm">{item.details.duration}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Benefits:</p>
                <p className="text-sm">{item.details.benefits || "Not specified"}</p>
              </div>

              {item.details.skills && (
                <div>
                  <p className="text-sm font-medium mb-1">Skills You'll Gain:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.details.skills.split(/,|;/).map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <p className="text-xs text-gray-500">Saved on {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 border-t p-3">
        <Button variant="outline" size="sm" className="text-xs gap-1" disabled={loading} onClick={handleDelete}>
          <Trash2 className="mr-1 h-3 w-3" />
          Remove
        </Button>
        {item.url && (
          <Button
            variant="outline"
            size="sm"
            className={`text-xs gap-1 ${item.type === "job" ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"}`}
            asChild
          >
            <a href={ensureHttps(item.url)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />
              {item.type === "job" ? "View Job" : "View Course"}
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
