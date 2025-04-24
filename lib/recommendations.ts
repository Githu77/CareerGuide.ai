import { supabase, type SampleJob, type SampleCourse } from "./supabase"
import { getAIRecommendations } from "./deepseek"

// Simple in-memory cache
const recommendationsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export async function getRecommendations(type: "job" | "course", skills: string[], location: string, userId: string) {
  const cacheKey = `${userId}-${type}-${skills.join(",")}-${location}`

  // Check cache first
  const cachedData = recommendationsCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  try {
    // First try to get recommendations from our database
    const dbRecommendations = await getDbRecommendations(type, skills, location)

    // If we have enough recommendations from the database, use those
    if (dbRecommendations.items.length >= 3) {
      // Store in cache
      recommendationsCache.set(cacheKey, {
        data: dbRecommendations,
        timestamp: Date.now(),
      })

      return dbRecommendations
    }

    // Otherwise, fall back to AI recommendations
    const aiRecommendations = await getAIRecommendations(type, skills, location)

    // Store in cache
    recommendationsCache.set(cacheKey, {
      data: aiRecommendations,
      timestamp: Date.now(),
    })

    return aiRecommendations
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    throw error
  }
}

async function getDbRecommendations(type: "job" | "course", skills: string[], location: string) {
  try {
    if (type === "job") {
      // Query sample_jobs table
      let query = supabase.from("sample_jobs").select("*")

      // Filter by location if provided
      if (location) {
        query = query.ilike("location", `%${location}%`)
      }

      // Get results
      const { data: jobs, error } = await query

      if (error) throw error

      // Score and sort jobs based on skill match
      const scoredJobs = jobs
        .map((job: SampleJob) => {
          const matchingSkills = skills.filter((skill) =>
            job.skills.some((jobSkill) => jobSkill.toLowerCase() === skill.toLowerCase()),
          )

          return {
            ...job,
            matchScore: matchingSkills.length / Math.max(skills.length, 1),
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      // Format the top results
      const items = scoredJobs.slice(0, 5).map((job: SampleJob & { matchScore: number }) => ({
        title: job.title,
        company: job.company,
        skills: job.skills.join(", "),
        salary: job.salary_range,
        location: job.location,
        description: job.description,
        url: job.url || `https://www.brightermonday.co.ke/jobs/${job.title.toLowerCase().replace(/\s+/g, "-")}`,
      }))

      return { items }
    } else {
      // Query sample_courses table
      const query = supabase.from("sample_courses").select("*")

      // Get results
      const { data: courses, error } = await query

      if (error) throw error

      // Score and sort courses based on desired skills match
      const scoredCourses = courses
        .map((course: SampleCourse) => {
          const matchingSkills = skills.filter((skill) =>
            course.skills_gained.some((courseSkill) => courseSkill.toLowerCase() === skill.toLowerCase()),
          )

          return {
            ...course,
            matchScore: matchingSkills.length / Math.max(skills.length, 1),
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      // Format the top results
      const items = scoredCourses.slice(0, 5).map((course: SampleCourse & { matchScore: number }) => ({
        title: course.title,
        provider: course.provider,
        benefits: course.description,
        skills: course.skills_gained.join(", "),
        duration: course.duration,
        location: course.location || "Online",
        url: course.url || `https://www.coursera.org/search?query=${encodeURIComponent(course.title)}`,
      }))

      return { items }
    }
  } catch (error) {
    console.error("Error getting DB recommendations:", error)
    throw error
  }
}
