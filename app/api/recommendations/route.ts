import { type NextRequest, NextResponse } from "next/server"
import { getAIRecommendations } from "@/lib/deepseek"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { type, skills, location, userId } = await request.json()

    if (!type || !skills || !location || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate type
    if (type !== "job" && type !== "course") {
      return NextResponse.json({ error: 'Type must be either "job" or "course"' }, { status: 400 })
    }

    // Get recommendations from DeepSeek API
    const recommendations = await getAIRecommendations(type, skills, location)

    if (!recommendations || !('items' in recommendations) || recommendations.items.length === 0) {
      console.error("No recommendations generated:", recommendations)
      return NextResponse.json({ 
        error: "No recommendations generated",
        details: "The API returned no valid recommendations"
      }, { status: 500 })
    }

    // Create authenticated Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Store in Supabase for history
    const { error } = await supabase.from("recommendations").insert({
      user_id: userId,
      type,
      content: recommendations,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error storing recommendations:", error)
      return NextResponse.json({ error: "Failed to store recommendations" }, { status: 500 })
    }

    return NextResponse.json({ recommendations })
  } catch (error: any) {
    console.error("Error in recommendations API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to get recommendations",
      details: error.cause || error.stack
    }, { status: 500 })
  }
}
