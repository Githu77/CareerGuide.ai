"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return

    // Set initial state
    setIsOffline(!navigator.onLine)

    // Add event listeners
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <Alert variant="destructive" className="fixed bottom-4 left-4 right-4 z-50 max-w-md">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>You are offline</AlertTitle>
      <AlertDescription>
        Some features may be limited. We'll automatically reconnect when you're back online.
      </AlertDescription>
    </Alert>
  )
}
