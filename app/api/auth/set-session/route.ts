import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { session } = requestData

    if (!session) {
      return NextResponse.json({ error: "No session provided" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Set the auth cookie
    await supabase.auth.setSession(session)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting session:", error)
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 })
  }
}
