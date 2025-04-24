import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skip API routes and static files
  if (
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.includes(".") ||
    req.nextUrl.pathname === "/manifest.json" ||
    req.nextUrl.pathname === "/sw.js" ||
    req.nextUrl.pathname === "/offline.html"
  ) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    await supabase.auth.getSession()
    return res
  } catch (e) {
    console.error("Middleware error:", e)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
