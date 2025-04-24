import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Sign out the user
    await supabase.auth.signOut()

    // Redirect to the home page
    return NextResponse.redirect(new URL("/", request.url), {
      status: 302,
    })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.redirect(new URL("/", request.url), {
      status: 302,
    })
  }
}
