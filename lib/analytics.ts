// Simple in-memory analytics tracking
const analyticsEvents: Array<{
  userId: string
  event: string
  metadata: any
  timestamp: string
}> = []

// In a real app, you would send these to a database or analytics service
export function trackEvent(userId: string, event: string, metadata: any = {}) {
  const eventData = {
    userId,
    event,
    metadata,
    timestamp: new Date().toISOString(),
  }

  analyticsEvents.push(eventData)

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("Analytics event:", eventData)
  }

  // In a real app, you would batch send these to your backend
  // For now, we'll just store the last 100 events in memory
  if (analyticsEvents.length > 100) {
    analyticsEvents.shift()
  }

  return eventData
}

// Get events for a specific user
export function getUserEvents(userId: string) {
  return analyticsEvents.filter((event) => event.userId === userId)
}

// Get all events of a specific type
export function getEventsByType(eventType: string) {
  return analyticsEvents.filter((event) => event.event === eventType)
}
