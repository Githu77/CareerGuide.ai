"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center p-4">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
      <p className="mb-6 text-center text-gray-600">We apologize for the inconvenience. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
