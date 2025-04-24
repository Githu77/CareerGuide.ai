export default function Loading() {
  return (
    <div className="container mx-auto flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      <span className="ml-2">Loading recommendations...</span>
    </div>
  )
}
