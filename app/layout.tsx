import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import OfflineDetector from "@/components/offline-detector"
import ServiceWorkerRegister from "@/components/service-worker-register"

export const metadata: Metadata = {
  title: "CareerGuide | Find Your Path in Kenya",
  description: "Discover personalized job and course recommendations for your career in Kenya",
  manifest: "/manifest.json",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <OfflineDetector />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
