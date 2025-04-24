"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bookmark, BookmarkCheck, Building, MapPin, Clock, GraduationCap, DollarSign, ExternalLink } from "lucide-react"

type JobRecommendation = {
  title: string
  company: string
  location: string
  skills: string
  salary: string
  description: string
  url?: string
}

type CourseRecommendation = {
  title: string
  provider: string
  location: string
  skills: string
  duration: string
  benefits: string
  url?: string
}

type RecommendationCardProps = {
  type: "job" | "course"
  data: JobRecommendation | CourseRecommendation
  userId: string
}

export default function RecommendationCard({ type, data, userId }: RecommendationCardProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("saved_recommendations").insert({
        user_id: userId,
        type,
        title: type === "job" ? (data as JobRecommendation).title : (data as CourseRecommendation).title,
        details: data,
        url: data.url || null,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      setSaved(true)
    } catch (error) {
      console.error("Error saving recommendation:", error)
    } finally {
      setSaving(false)
    }
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

  // Ensure URL has protocol
  const ensureHttps = (url?: string) => {
    if (!url) return "#"
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    return `https://${url}`
  }

  if (type === "job") {
    const job = data as JobRecommendation
    return (
      <Card className="w-full overflow-hidden hover:shadow-md transition-shadow duration-200 group">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 w-full"></div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg text-blue-800 group-hover:text-blue-600 transition-colors">
                {job.title || "Job Opportunity"}
              </CardTitle>
              <CardDescription>
                {job.company && (
                  <div className="flex items-center gap-1 mt-1">
                    <Building className="h-3 w-3 text-blue-500" />
                    <span>{job.company}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.url && (
                  <div className="flex items-center gap-1 mt-1 text-blue-500">
                    <ExternalLink className="h-3 w-3" />
                    <a
                      href={ensureHttps(job.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {formatUrl(job.url)}
                    </a>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1 flex items-center">
                <DollarSign className="h-3.5 w-3.5 text-blue-500 mr-1" /> Salary:
              </p>
              <p className="text-sm">{job.salary}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {job.skills.split(/,|;/).map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            {job.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description:</p>
                <p className="text-sm line-clamp-3">{job.description}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t p-3 flex justify-between">
          {job.url && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a
                href={ensureHttps(job.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" /> View Job
              </a>
            </Button>
          )}
          <Button
            variant={saved ? "outline" : "default"}
            size="sm"
            className={`${!job.url ? "ml-auto" : ""} gap-1.5 ${saved ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700" : ""}`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? (
              <>
                <BookmarkCheck className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  } else {
    const course = data as CourseRecommendation
    return (
      <Card className="w-full overflow-hidden hover:shadow-md transition-shadow duration-200 group">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 h-2 w-full"></div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg text-indigo-800 group-hover:text-indigo-600 transition-colors">
                {course.title || "Course Recommendation"}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <GraduationCap className="h-3 w-3 text-indigo-500" />
                <span>{course.provider}</span>
              </CardDescription>
              {course.location && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-indigo-500" />
                  <span>{course.location}</span>
                </CardDescription>
              )}
              {course.duration && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-indigo-500" />
                  <span>{course.duration}</span>
                </CardDescription>
              )}
              {course.url && (
                <CardDescription className="flex items-center gap-1 mt-1 text-indigo-500">
                  <ExternalLink className="h-3 w-3" />
                  <a
                    href={ensureHttps(course.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-indigo-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {formatUrl(course.url)}
                  </a>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {course.skills && (
              <div>
                <p className="text-sm font-medium mb-1">Skills You'll Gain:</p>
                <div className="flex flex-wrap gap-1">
                  {course.skills.split(/,|;/).map((skill, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {course.benefits && (
              <div>
                <p className="text-sm font-medium mb-1">Benefits:</p>
                <p className="text-sm">{course.benefits}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t p-3 flex justify-between">
          {course.url && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a
                href={ensureHttps(course.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" /> View Course
              </a>
            </Button>
          )}
          <Button
            variant={saved ? "outline" : "default"}
            size="sm"
            className={`${!course.url ? "ml-auto" : ""} gap-1.5 ${saved ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700" : ""}`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? (
              <>
                <BookmarkCheck className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }
}
