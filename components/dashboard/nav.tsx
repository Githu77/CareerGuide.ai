"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, User, Bookmark, LogOut } from "lucide-react"

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className={cn("flex items-center gap-1", pathname === "/dashboard" && "bg-accent text-accent-foreground")}
      >
        <Link href="/dashboard">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        asChild
        className={cn(
          "flex items-center gap-1",
          pathname === "/dashboard/profile" && "bg-accent text-accent-foreground",
        )}
      >
        <Link href="/dashboard/profile">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        asChild
        className={cn("flex items-center gap-1", pathname === "/dashboard/saved" && "bg-accent text-accent-foreground")}
      >
        <Link href="/dashboard/saved">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">Saved</span>
        </Link>
      </Button>

      <form action="/auth/signout" method="post">
        <Button variant="ghost" size="sm" type="submit" className="flex items-center gap-1">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </form>
    </nav>
  )
}
