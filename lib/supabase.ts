import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a single supabase client for the entire session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type UserProfile = {
  id: string
  email: string
  full_name: string
  phone: string
  education_level: string
  bio: string
  current_skills: string[]
  desired_skills: string[]
  location: string
  experience_years: string
  created_at: string
  updated_at: string
}

export type Recommendation = {
  id: string
  user_id: string
  type: "job" | "course"
  content: any
  created_at: string
}

export type SavedRecommendation = {
  id: string
  user_id: string
  type: "job" | "course"
  title: string
  details: any
  url: string | null
  created_at: string
}

export type SampleJob = {
  id: number
  title: string
  company: string
  description: string
  skills: string[]
  salary_range: string
  location: string
  url?: string
  created_at: string
}

export type SampleCourse = {
  id: number
  title: string
  provider: string
  description: string
  skills_gained: string[]
  duration: string
  location?: string
  url?: string
  created_at: string
}
